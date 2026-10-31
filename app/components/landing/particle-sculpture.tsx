"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const LAVENDER = new THREE.Color("#AA88FF")
const WHITE = new THREE.Color("#F4F4F8")
const GREY = new THREE.Color("#8A8A96")

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  attribute vec3 aBasePosition;
  attribute float aRandom;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vec3 base = aBasePosition;
    vec3 dir = normalize(base + vec3(0.0001));

    float dist = length(base - uPointer);
    float falloff = smoothstep(1.35, 0.0, dist);

    float wobble = sin(uTime * 1.1 + aRandom * 6.2831853) * 0.035;

    vec3 displaced = base
      + dir * falloff * uPointerStrength * 0.55
      + dir * wobble;

    vColor = aColor;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_PointSize = (95.0 / -mvPosition.z) * (0.6 + aRandom * 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform sampler2D uSprite;
  varying vec3 vColor;

  void main() {
    vec4 tex = texture2D(uSprite, gl_PointCoord);
    if (tex.a < 0.04) discard;
    gl_FragColor = vec4(vColor, tex.a * 0.75);
  }
`

function makeSpriteTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )
  gradient.addColorStop(0, "rgba(255,255,255,1)")
  gradient.addColorStop(0.4, "rgba(255,255,255,0.7)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function buildGeometry(tubularSegments: number, radialSegments: number) {
  const knot = new THREE.TorusKnotGeometry(1.6, 0.46, tubularSegments, radialSegments, 2, 5)
  const basePosition = knot.getAttribute("position").array as Float32Array
  const count = basePosition.length / 3

  const colors = new Float32Array(count * 3)
  const random = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const isAccent = Math.random() < 0.08
    const base = isAccent ? LAVENDER : Math.random() < 0.5 ? WHITE : GREY
    colors[i * 3] = base.r
    colors[i * 3 + 1] = base.g
    colors[i * 3 + 2] = base.b
    random[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("aBasePosition", new THREE.BufferAttribute(basePosition.slice(), 3))
  geometry.setAttribute("position", new THREE.BufferAttribute(basePosition.slice(), 3))
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 1))
  knot.dispose()
  return geometry
}

export function ParticleSculpture() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const isLowPower =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768

    let probe: WebGLRenderingContext | WebGL2RenderingContext | null = null
    try {
      const probeCanvas = document.createElement("canvas")
      probe =
        (probeCanvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
        (probeCanvas.getContext("webgl") as WebGLRenderingContext | null)
    } catch {
      probe = null
    }
    const applyFallback = () => {
      container.style.background =
        "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(170,136,255,0.12), transparent)"
    }

    if (!probe) {
      applyFallback()
      return
    }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      applyFallback()
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 8.5)

    const tubularSegments = isLowPower ? 90 : 220
    const radialSegments = isLowPower ? 10 : 20
    const geometry = buildGeometry(tubularSegments, radialSegments)
    const sprite = makeSpriteTexture()

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector3(10, 10, 10) },
        uPointerStrength: { value: 0 },
        uSprite: { value: sprite },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPower ? 1.5 : 2))
    container.appendChild(renderer.domElement)

    const resize = () => {
      const { clientWidth, clientHeight } = container
      if (clientWidth === 0 || clientHeight === 0) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const raycaster = new THREE.Raycaster()
    const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const pointerNdc = new THREE.Vector2(10, 10)
    const pointerWorld = new THREE.Vector3()
    const pointerLocal = new THREE.Vector3(10, 10, 10)
    let pointerStrengthTarget = 0

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const withinBounds =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      if (!withinBounds) return

      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      pointerNdc.set(x, y)

      raycaster.setFromCamera(pointerNdc, camera)
      if (raycaster.ray.intersectPlane(pointerPlane, pointerWorld)) {
        pointerLocal.copy(pointerWorld)
        points.worldToLocal(pointerLocal)
        pointerStrengthTarget = 1
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    let frameId: number | null = null
    let lastTime = performance.now()
    let paused = false

    const animate = (now: number) => {
      if (paused) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      material.uniforms.uTime.value = now / 1000
      pointerStrengthTarget *= Math.pow(0.001, dt)
      material.uniforms.uPointerStrength.value +=
        (pointerStrengthTarget - material.uniforms.uPointerStrength.value) * Math.min(dt * 6, 1)
      material.uniforms.uPointer.value.lerp(pointerLocal, Math.min(dt * 4, 1))

      points.rotation.y += dt * 0.05
      points.rotation.x = Math.sin(now / 9000) * 0.08

      camera.position.x += (pointerNdc.x * 0.5 - camera.position.x) * Math.min(dt * 2, 1)
      camera.position.y += (pointerNdc.y * 0.3 - camera.position.y) * Math.min(dt * 2, 1)
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    if (prefersReducedMotion) {
      renderer.render(scene, camera)
    } else {
      frameId = requestAnimationFrame(animate)
    }

    const handleVisibility = () => {
      if (prefersReducedMotion) return
      if (document.hidden) {
        paused = true
        if (frameId) cancelAnimationFrame(frameId)
      } else if (paused) {
        paused = false
        lastTime = performance.now()
        frameId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      paused = true
      if (frameId) cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("visibilitychange", handleVisibility)
      geometry.dispose()
      material.dispose()
      sprite.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
}
