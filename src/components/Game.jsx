import React, { useEffect, useRef, useState } from 'react'

// Futuristic Flappy Bird-like game using Canvas
// Neon aesthetic with particles and glow
export default function Game({ onExit }) {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem('neo-best') || 0)
    } catch {
      return 0
    }
  })
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let w = (canvas.width = canvas.clientWidth)
    let h = (canvas.height = canvas.clientHeight)

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    canvas.width = w * DPR
    canvas.height = h * DPR
    ctx.scale(DPR, DPR)

    // Game state
    const gravity = 0.45
    const flap = -7.5
    const pipeGapBase = 160
    const pipeWidth = 70
    const pipeSpeed = 2.4

    const bird = {
      x: w * 0.28,
      y: h * 0.5,
      r: 16,
      vy: 0,
      rot: 0,
    }

    const particles = []
    const pipes = []
    let tick = 0
    let localScore = 0

    const addPipe = () => {
      const gap = pipeGapBase + Math.sin(tick * 0.02) * 40
      const topHeight = 40 + Math.random() * (h - gap - 80)
      const bottomY = topHeight + gap
      pipes.push({ x: w + 40, top: { y: 0, h: topHeight }, bottom: { y: bottomY, h: h - bottomY }, passed: false })
    }

    const addParticles = (x, y, color = 'rgba(168,85,247,0.8)') => {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2.2,
          vy: (Math.random() - 0.5) * 2.2,
          life: 20 + Math.random() * 20,
          color,
        })
      }
    }

    const hitTest = () => {
      if (bird.y - bird.r < 0 || bird.y + bird.r > h) return true
      for (const p of pipes) {
        const inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + pipeWidth
        if (!inX) continue
        const hitTop = bird.y - bird.r < p.top.h
        const hitBottom = bird.y + bird.r > p.bottom.y
        if (hitTop || hitBottom) return true
      }
      return false
    }

    const drawGlowPipe = (x, y, width, height) => {
      const grd = ctx.createLinearGradient(x, y, x + width, y + height)
      grd.addColorStop(0, 'rgba(59,130,246,0.25)')
      grd.addColorStop(0.5, 'rgba(147,51,234,0.5)')
      grd.addColorStop(1, 'rgba(59,130,246,0.25)')
      ctx.fillStyle = grd
      ctx.fillRect(x, y, width, height)
      ctx.strokeStyle = 'rgba(168,85,247,0.9)'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, width - 2, height - 2)
    }

    const drawBackground = () => {
      // subtle grid
      ctx.fillStyle = '#050507'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(99,102,241,0.1)'
      ctx.lineWidth = 1
      const step = 28
      ctx.beginPath()
      for (let gx = 0; gx < w; gx += step) {
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
      }
      for (let gy = 0; gy < h; gy += step) {
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
      }
      ctx.stroke()

      // horizon glow
      const g = ctx.createRadialGradient(w / 2, h * 0.8, 10, w / 2, h * 0.8, h)
      g.addColorStop(0, 'rgba(59,130,246,0.12)')
      g.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.8, h, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawBird = () => {
      ctx.save()
      ctx.translate(bird.x, bird.y)
      ctx.rotate(bird.rot)

      // outer glow
      const bg = ctx.createRadialGradient(0, 0, 2, 0, 0, 20)
      bg.addColorStop(0, 'rgba(139,92,246,0.9)')
      bg.addColorStop(1, 'rgba(59,130,246,0.05)')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.fill()

      // core
      ctx.fillStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.arc(0, 0, bird.r, 0, Math.PI * 2)
      ctx.fill()

      // visor line
      ctx.strokeStyle = 'rgba(99,102,241,0.9)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-10, -2)
      ctx.lineTo(10, 2)
      ctx.stroke()

      ctx.restore()
    }

    const drawHUD = () => {
      ctx.fillStyle = 'rgba(226,232,240,0.9)'
      ctx.font = '700 28px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(localScore), w / 2, 54)

      ctx.textAlign = 'left'
      ctx.font = '600 12px Inter, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(148,163,184,0.9)'
      ctx.fillText(`Best: ${best}`, 16, 22)
    }

    const handleFlap = () => {
      if (gameOver) {
        // reset
        bird.y = h * 0.5
        bird.vy = 0
        bird.rot = 0
        pipes.length = 0
        particles.length = 0
        localScore = 0
        setScore(0)
        setGameOver(false)
        setRunning(true)
        return
      }
      bird.vy = flap
      addParticles(bird.x - 10, bird.y, 'rgba(59,130,246,0.85)')
    }

    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        handleFlap()
      } else if (e.code === 'Escape') {
        setRunning(false)
      }
    }

    const onPointer = () => handleFlap()

    window.addEventListener('keydown', onKey)
    canvas.addEventListener('pointerdown', onPointer)

    let raf

    const loop = () => {
      if (!running) return
      tick++

      // spawn pipes
      if (tick % 95 === 0) addPipe()

      // physics
      bird.vy += gravity
      bird.y += bird.vy
      bird.rot = Math.atan2(bird.vy, 8) * 0.6

      // move pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i]
        p.x -= pipeSpeed
        if (!p.passed && p.x + pipeWidth < bird.x) {
          p.passed = true
          localScore += 1
          setScore(localScore)
          addParticles(bird.x + 8, bird.y, 'rgba(168,85,247,0.9)')
        }
        if (p.x + pipeWidth < -10) pipes.splice(i, 1)
      }

      // collisions
      if (hitTest()) {
        setGameOver(true)
        setRunning(false)
        try {
          const newBest = Math.max(best, localScore)
          setBest(newBest)
          localStorage.setItem('neo-best', String(newBest))
        } catch {}
      }

      // particles update
      for (let i = particles.length - 1; i >= 0; i--) {
        const pa = particles[i]
        pa.x += pa.vx
        pa.y += pa.vy
        pa.vx *= 0.98
        pa.vy *= 0.98
        pa.life -= 1
        if (pa.life <= 0) particles.splice(i, 1)
      }

      // draw
      drawBackground()

      // pipes
      for (const p of pipes) {
        drawGlowPipe(p.x, p.top.y, pipeWidth, p.top.h)
        drawGlowPipe(p.x, p.bottom.y, pipeWidth, p.bottom.h)
      }

      // particles
      for (const pa of particles) {
        const g = ctx.createRadialGradient(pa.x, pa.y, 0, pa.x, pa.y, 10)
        g.addColorStop(0, pa.color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pa.x, pa.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }

      drawBird()
      drawHUD()

      if (!gameOver) raf = requestAnimationFrame(loop)
      else drawGameOver()
    }

    const drawButton = (text, x, y, wbtn, hbtn) => {
      // button background
      const grd = ctx.createLinearGradient(x, y, x + wbtn, y + hbtn)
      grd.addColorStop(0, 'rgba(59,130,246,0.25)')
      grd.addColorStop(1, 'rgba(147,51,234,0.25)')
      ctx.fillStyle = grd
      ctx.fillRect(x, y, wbtn, hbtn)
      ctx.strokeStyle = 'rgba(168,85,247,0.9)'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, wbtn - 2, hbtn - 2)
      ctx.fillStyle = 'white'
      ctx.font = '700 16px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(text, x + wbtn / 2, y + hbtn / 2 + 6)
    }

    const drawGameOver = () => {
      ctx.fillStyle = 'rgba(2,6,23,0.8)'
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.font = '800 34px Inter, system-ui, sans-serif'
      ctx.fillText('Game Over', w / 2, h / 2 - 60)
      ctx.font = '600 18px Inter, system-ui, sans-serif'
      ctx.fillText(`Score: ${localScore}  •  Best: ${Math.max(best, localScore)}`, w / 2, h / 2 - 20)

      drawButton('Try Again (Space)', w / 2 - 140, h / 2 + 10, 280, 44)
      drawButton('Exit', w / 2 - 70, h / 2 + 64, 140, 40)
    }

    const onResize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(DPR, DPR)
    }

    const onClick = (e) => {
      if (!gameOver) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left)
      const my = (e.clientY - rect.top)
      // Try Again button
      if (mx > w / 2 - 140 && mx < w / 2 + 140 && my > h / 2 + 10 && my < h / 2 + 54) {
        setRunning(true)
        setGameOver(false)
        tick = 0
        pipes.length = 0
        particles.length = 0
        bird.y = h * 0.5
        bird.vy = 0
        localScore = 0
        setScore(0)
        requestAnimationFrame(loop)
        return
      }
      // Exit button
      if (mx > w / 2 - 70 && mx < w / 2 + 70 && my > h / 2 + 64 && my < h / 2 + 104) {
        onExit?.()
      }
    }

    window.addEventListener('resize', onResize)
    canvas.addEventListener('click', onClick)

    // kick-off
    requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerdown', onPointer)
      canvas.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
    }
  }, [running, best, gameOver])

  return (
    <div className="relative w-full h-[70vh] md:h-[75vh] lg:h-[80vh] rounded-2xl overflow-hidden bg-slate-950 ring-1 ring-indigo-500/20 shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-slate-800/60 ring-1 ring-indigo-500/30 backdrop-blur">
        Neo Flappy
      </div>
      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-slate-800/60 ring-1 ring-indigo-500/30 backdrop-blur">
        Score: {score}
      </div>

      <div className="absolute bottom-3 inset-x-3 grid grid-cols-2 gap-3 pointer-events-none">
        <div className="text-slate-300/80 text-xs md:text-sm">Tap / Space to flap</div>
        <div className="text-right text-slate-400/70 text-xs md:text-sm">Esc to pause</div>
      </div>

      {!running && !gameOver && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-extrabold text-white tracking-tight">Paused</div>
            <button
              onClick={() => setRunning(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-fuchsia-500/25 transition"
            >
              Resume
            </button>
            <button
              onClick={() => onExit?.()}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white/90 ring-1 ring-slate-700 hover:bg-slate-700 transition"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
