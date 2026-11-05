'use client';
import { Component, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { summit, terrainLayout, terrainPoint, type TerrainInput } from './terrain-model';
import { SphereTerrain } from './SphereTerrain';

type Props = { locale: string; active: boolean; reduced: boolean; input: RefObject<TerrainInput>; onReady: () => void; onUnavailable: () => void };
class TerrainBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function SummitFlag({ reduced, time, locale, stretch }: { reduced: boolean; time: RefObject<number>; locale: string; stretch: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const invalidate = useThree(state => state.invalidate);
  const size = useThree(state => state.size);
  const scale = terrainLayout(size.width, size.height).flagScale;
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 288;
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => {
    let disposed = false;
    const draw = () => {
      if (disposed) return;
      const canvas = texture.image as HTMLCanvasElement, ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f16e00'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fffdf8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = locale === 'ar' ? 'rtl' : 'ltr';
      ctx.font = `500 ${locale === 'ar' ? 113 : 65}px Plex, Arial, sans-serif`;
      ctx.fillText(locale === 'ar' ? 'بياناتك. قرارك!' : 'Your data. Your decision!', 512, 144);
      texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true; invalidate();
    };
    draw(); void document.fonts.ready.then(draw);
    return () => { disposed = true; };
  }, [texture, locale, invalidate]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const u = (positions.getX(i) + 1.05) / 2.1;
      positions.setZ(i, reduced ? 0 : Math.pow(u, 1.3) * (Math.sin(u * 7 - time.current * 3) * .095 + Math.sin(u * 13 - time.current * 4) * .025));
    }
    positions.needsUpdate = true;
  });
  return <group position={[summit.x, summit.y, summit.z]} scale={[scale / stretch, scale, scale]}>
    <mesh position={[0, .42, 0]}><cylinderGeometry args={[.013, .019, .88, 8]} /><meshBasicMaterial color="#062759" /></mesh>
    <mesh position={[0, .88, 0]}><sphereGeometry args={[.035, 12, 8]} /><meshBasicMaterial color="#f16e00" /></mesh>
    <mesh ref={mesh} position={[1.06, .56, 0]}>
      <planeGeometry args={[2.1, .59, 30, 5]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
    <pointLight color="#f16e00" intensity={1} distance={3} />
  </group>;
}

function TerrainScene({ reduced, input, locale, onReady, onUnavailable }: Props) {
  const time = useRef(0), ready = useRef(false);
  const { camera, size, gl, invalidate } = useThree();
  const { stretch } = terrainLayout(size.width, size.height);
  const packetGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(180 * 3), 3));
    return geometry;
  }, []);
  const movingTrails = useMemo(() => {
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(108 * 6), 3)); return geometry;
  }, []);
  const trails = useMemo(() => {
    const vertices: number[] = [];
    for (let lane = 0; lane < 12; lane++) {
      const angle = lane / 12 * Math.PI * 2 + .17;
      for (let n = 0; n < 50; n++) {
        const a = terrainPoint(n / 50, angle), b = terrainPoint((n + 1) / 50, angle);
        a[1] += .027; b[1] += .027; vertices.push(...a, ...b);
      }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); return geometry;
  }, []);
  useEffect(() => () => { packetGeometry.dispose(); trails.dispose(); movingTrails.dispose(); }, [packetGeometry, trails, movingTrails]);
  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = terrainLayout(size.width, size.height).zoom;
    ortho.position.set(.2, 4.1, 14); ortho.lookAt(0, 2.7, 0); ortho.updateProjectionMatrix(); invalidate();
  }, [camera, size, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onUnavailable]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, .05), control = input.current;
    if (!reduced) time.current += dt * (1 + (control.hover ? .65 : 0) + control.impulse * 2);
    control.impulse = Math.max(0, control.impulse - dt * 1.1);
    const positions = packetGeometry.getAttribute('position');
    const streaks = movingTrails.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const lane = i % 12, angle = lane / 12 * Math.PI * 2 + .17;
      const phase = (i / positions.count + time.current * (.055 + (i % 3) * .009) + control.scroll * .2) % 1;
      let [x, y, z] = terrainPoint(1 - phase, angle); y += .065;
      positions.setXYZ(i, x, y, z);
      if (i >= 72) {
        const tail = terrainPoint(Math.min(1, 1 - phase + .027), angle), n = (i - 72) * 2;
        streaks.setXYZ(n, x, y, z); streaks.setXYZ(n + 1, tail[0], tail[1] + .065, tail[2]);
      }
    }
    positions.needsUpdate = true;
    streaks.needsUpdate = true;
    if (!ready.current) { ready.current = true; onReady(); }
  });
  return <>
    <ambientLight intensity={1.5} /><hemisphereLight args={['#d7e8ff', '#062759', 1.3]} /><directionalLight position={[-3, 6, 6]} intensity={3} color="#e4ecfb" />
    <group scale={[stretch, 1, 1]}>
      <SphereTerrain input={input} reduced={reduced} stretch={stretch} />
      <lineSegments geometry={trails}><lineBasicMaterial color="#f16e00" transparent opacity={.12} /></lineSegments>
      <lineSegments geometry={movingTrails} frustumCulled={false}><lineBasicMaterial color="#f16e00" transparent opacity={.65} depthWrite={false} /></lineSegments>
      <points geometry={packetGeometry} frustumCulled={false}><pointsMaterial color="#f16e00" size={2.7} sizeAttenuation={false} transparent opacity={.8} depthWrite={false} toneMapped={false} /></points>
      <SummitFlag reduced={reduced} time={time} locale={locale} stretch={stretch} />
    </group>
  </>;
}

export default function TerrainCanvas(props: Props) {
  return <TerrainBoundary onUnavailable={props.onUnavailable}>
    <Canvas orthographic camera={{ position: [0, 3.8, 14], zoom: 75, near: .1, far: 50 }} dpr={[1, 1.25]} flat
      frameloop={!props.active ? 'never' : props.reduced ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={null}>
      <TerrainScene {...props} />
    </Canvas>
  </TerrainBoundary>;
}
