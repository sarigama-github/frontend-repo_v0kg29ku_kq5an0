import React, { useState } from 'react'
import Spline from '@splinetool/react-spline'
import Game from './components/Game'

export default function App() {
  const [showGame, setShowGame] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero with Spline animation */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <Spline 
          scene="https://prod.spline.design/YMbQm4jphL7pTceL/scene.splinecode" 
          style={{ width: '100%', height: '100%' }}
        />
        {/* gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">
              Neo Flappy: Futuristic Flight
            </h1>
            <p className="mt-4 text-slate-300/90 text-sm md:text-base">
              Glide through neon pipes in a cyber-grid world. Tap or press space to keep your orb afloat.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setShowGame(true)}
                className="rounded-xl px-6 py-3 font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.55)] transition"
              >
                Play Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Game Section */}
      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {showGame ? (
          <Game onExit={() => setShowGame(false)} />
        ) : (
          <div className="mt-6 grid gap-4 text-slate-300/80">
            <div className="text-lg font-semibold">How to play</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Tap / click or press Space to flap</li>
              <li>Avoid the glowing pipes and the edges</li>
              <li>Beat your best score and share with friends</li>
            </ul>
          </div>
        )}
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        Built for vibes • Neon aesthetic • 60fps canvas
      </footer>
    </div>
  )
}
