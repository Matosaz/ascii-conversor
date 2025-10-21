// ParticlesBackground.jsx
import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const ParticlesBackground = () => {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  // "Firefly" preset-inspired config: glowing, floating, interactive particles
  const options = useMemo(() => ({
    background: {
      color: { value: '#181c1f' },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 80,
        density: { enable: true, area: 800 },
      },
      color: { value: ['#00ffea', '#ff00c8', '#fff700', '#00ff2a', '#ff5e00'] },
      shape: { type: 'circle' },
      opacity: {
        value: 0.8,
        random: { enable: true, minimumValue: 0.4 },
        animation: { enable: true, speed: 1, minimumValue: 0.4, sync: false },
      },
      size: {
        value: { min: 2, max: 6 },
        animation: { enable: true, speed: 4, minimumValue: 2, sync: false },
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
        attract: { enable: false },
      },
      links: {
        enable: true,
        distance: 120,
        color: '#00ffea',
        opacity: 0.3,
        width: 1,
      },
      glow: {
        enable: true,
        color: '#fff',
        radius: 10,
        intensity: 0.5,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
    fullScreen: { enable: true, zIndex: -1 },
  }), [])

  if (!init) return null
  return <Particles id="tsparticles" options={options} />
}

export default ParticlesBackground
