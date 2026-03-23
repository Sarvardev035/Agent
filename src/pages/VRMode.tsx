import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import api from '../lib/api'
import { safeObject } from '../lib/helpers'
import { formatCurrency } from '../lib/currency'

type CardMesh = THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial> & {
  userData: {
    floatOffset: number
  }
}

const VRMode = () => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    let animId = 0

    const mount = mountRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.Fog(0x0a0a1a, 20, 60)

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 2, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x404080, 0.6)
    scene.add(ambient)

    const pointLight1 = new THREE.PointLight(0x7c3aed, 2, 20)
    pointLight1.position.set(0, 5, 0)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x2563eb, 1.5, 15)
    pointLight2.position.set(-5, 3, -3)
    scene.add(pointLight2)

    const gridHelper = new THREE.GridHelper(40, 40, 0x222244, 0x1a1a3e)
    gridHelper.position.y = -1
    scene.add(gridHelper)

    const starGeo = new THREE.BufferGeometry()
    const starCount = 1500
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 1) {
      positions[i] = (Math.random() - 0.5) * 100
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
    })
    scene.add(new THREE.Points(starGeo, starMat))

    const cards: CardMesh[] = []

    const makeCard = (label: string, value: string, color: number, position: [number, number, number]) => {
      const geo = new THREE.BoxGeometry(3.2, 1.6, 0.08)
      const mat = new THREE.MeshPhongMaterial({
        color: 0x1a1a3e,
        transparent: true,
        opacity: 0.85,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.08,
      })
      const card = new THREE.Mesh(geo, mat) as CardMesh
      card.position.set(...position)
      card.castShadow = true
      card.userData.floatOffset = Math.random() * Math.PI * 2

      const edgesGeo = new THREE.EdgesGeometry(geo)
      const edgesMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      })
      const edges = new THREE.LineSegments(edgesGeo, edgesMat)
      card.add(edges)

      const textCanvas = document.createElement('canvas')
      textCanvas.width = 512
      textCanvas.height = 256
      const textCtx = textCanvas.getContext('2d')
      if (textCtx) {
        textCtx.fillStyle = 'rgba(10,10,26,0.8)'
        textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height)
        textCtx.fillStyle = '#c4b5fd'
        textCtx.font = 'bold 38px sans-serif'
        textCtx.fillText(label, 24, 90)
        textCtx.fillStyle = '#ffffff'
        textCtx.font = 'bold 48px sans-serif'
        textCtx.fillText(value, 24, 170)
      }
      const textTexture = new THREE.CanvasTexture(textCanvas)
      const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 1.3),
        new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
      )
      textPlane.position.z = 0.05
      card.add(textPlane)

      scene.add(card)
      return card
    }

    const loadData = async () => {
      try {
        const res = await api.get('/api/analytics/summary')
        const s = safeObject<any>(res.data)
        const items = [
          {
            label: 'Total Balance',
            value: formatCurrency(s?.totalBalance ?? 0),
            color: 0x7c3aed,
            pos: [-3.5, 1, 0] as [number, number, number],
          },
          {
            label: 'Income',
            value: formatCurrency(s?.totalIncome ?? 0),
            color: 0x10b981,
            pos: [0, 1, 0] as [number, number, number],
          },
          {
            label: 'Expenses',
            value: formatCurrency(s?.totalExpense ?? 0),
            color: 0xef4444,
            pos: [3.5, 1, 0] as [number, number, number],
          },
          {
            label: 'Net Savings',
            value: formatCurrency(s?.savings ?? 0),
            color: 0x2563eb,
            pos: [-1.75, -1, 0] as [number, number, number],
          },
          {
            label: 'Open Debts',
            value: 'Track now',
            color: 0xf59e0b,
            pos: [1.75, -1, 0] as [number, number, number],
          },
        ]
        items.forEach(item => {
          const card = makeCard(item.label, item.value, item.color, item.pos)
          cards.push(card)
        })
      } catch {}
    }
    void loadData()

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshPhongMaterial({
        color: 0x7c3aed,
        emissive: new THREE.Color(0x7c3aed),
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.9,
      })
    )
    orb.position.set(0, 1, -2)
    scene.add(orb)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.02, 8, 60),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.5,
      })
    )
    ring.position.set(0, 1, -2)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

    let isDragging = false
    let prevX = 0
    let prevY = 0
    let rotX = 0
    let rotY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      rotY += (e.clientX - prevX) * 0.005
      rotX += (e.clientY - prevY) * 0.005
      rotX = Math.max(-0.4, Math.min(0.4, rotX))
      prevX = e.clientX
      prevY = e.clientY
    }
    const onMouseUp = () => {
      isDragging = false
    }

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      prevX = e.touches[0].clientX
      prevY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      rotY += (e.touches[0].clientX - prevX) * 0.005
      prevX = e.touches[0].clientX
      prevY = e.touches[0].clientY
    }

    mount.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    mount.addEventListener('touchstart', onTouchStart)
    mount.addEventListener('touchmove', onTouchMove)
    mount.addEventListener('touchend', onMouseUp)

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001

      scene.rotation.y += (rotY - scene.rotation.y) * 0.05
      scene.rotation.x += (rotX - scene.rotation.x) * 0.05

      cards.forEach(card => {
        const offset = card.userData.floatOffset ?? 0
        card.position.y += Math.sin(t + offset) * 0.003
        card.rotation.y = Math.sin(t * 0.5 + offset) * 0.05
      })

      orb.rotation.y += 0.01
      ring.rotation.z += 0.005
      pointLight1.intensity = 2 + Math.sin(t * 2) * 0.5
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    if ('xr' in navigator) {
      ;(navigator as Navigator & { xr?: XRSystem }).xr
        ?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          if (!supported) return
          const vrBtn = document.createElement('button')
          vrBtn.textContent = '🥽 Enter VR Headset'
          vrBtn.style.cssText = `
            position:absolute; bottom:80px; left:50%;
            transform:translateX(-50%);
            background:linear-gradient(135deg,#7c3aed,#2563eb);
            color:white; border:none; border-radius:12px;
            padding:12px 24px; font-size:14px; font-weight:600;
            cursor:pointer; z-index:10;
          `
          vrBtn.onclick = async () => {
            const xr = (navigator as Navigator & { xr?: XRSystem }).xr
            if (!xr) return
            const session = await xr.requestSession('immersive-vr')
            await renderer.xr.setSession(session)
          }
          mount.appendChild(vrBtn)
        })
        .catch(() => {})
    }

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      renderer.setAnimationLoop(null)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', onResize)
      mount.removeEventListener('mousedown', onMouseDown)
      mount.removeEventListener('touchstart', onTouchStart)
      mount.removeEventListener('touchmove', onTouchMove)
      mount.removeEventListener('touchend', onMouseUp)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(10,10,26,0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 16,
            padding: '10px 24px',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          🥽 Finly VR Dashboard — Drag to explore · Real data
        </div>
      </div>

      <button
        onClick={() => window.history.back()}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(239,68,68,0.2)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 10,
          padding: '8px 16px',
          color: '#fca5a5',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ✕ Exit VR
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
        }}
      >
        🖱 Drag to rotate · 📱 Touch & drag on mobile · 🥽 VR headset supported
      </div>
    </div>
  )
}

export default VRMode

