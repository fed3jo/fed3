'use client';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildTerrainSpheres, type TerrainInput } from './terrain-model';

export function SphereTerrain({ input, reduced, stretch }: { input: RefObject<TerrainInput>; reduced: boolean; stretch: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { camera, size, gl, invalidate } = useThree();
  const data = useMemo(buildTerrainSpheres, []);
  const positions = useMemo(() => data.base.slice(), [data]);
  const velocities = useMemo(() => new Float32Array(data.base.length), [data]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const unsettled = useRef(true);
  const wasHovering = useRef(false);
  const count = data.radii.length;
  useEffect(() => {
    const spheres = mesh.current;
    if (!spheres) return;
    const color = new THREE.Color();
    spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < count; i++) {
      color.set(i % 71 === 0 ? '#f16e00' : i % 13 === 0 ? '#183f73' : i % 7 === 0 ? '#0c3265' : '#062759');
      spheres.setColorAt(i, color);
    }
    if (spheres.instanceColor) spheres.instanceColor.needsUpdate = true;
    unsettled.current = true; invalidate();
  }, [count, invalidate, stretch, reduced]);
  useFrame((_, delta) => {
    const spheres = mesh.current;
    if (!spheres) return;
    const hovering = input.current.hover && !reduced;
    if (hovering !== wasHovering.current) { unsettled.current = true; wasHovering.current = hovering; }
    if (!hovering && !unsettled.current) return;
    const rect = gl.domElement.getBoundingClientRect();
    const mx = (input.current.clientX - rect.left) / rect.width * 2 - 1;
    const my = -((input.current.clientY - rect.top) / rect.height * 2 - 1);
    const zoom = (camera as THREE.OrthographicCamera).zoom;
    const radius = size.width < 800 ? 70 : 100;
    const dt = Math.min(delta, .032), up = camera.matrixWorld.elements;
    let energy = 0;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      let tx = data.base[k], ty = data.base[k + 1], tz = data.base[k + 2];
      if (hovering) {
        projected.set(tx * stretch, ty, tz).project(camera);
        const dx = (projected.x - mx) * size.width * .5, dy = (projected.y - my) * size.height * .5;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius) {
          const force = Math.pow(1 - distance / radius, 1.4) * 115 / zoom;
          const safeDistance = Math.max(distance, .5), x = dx / safeDistance * force, y = dy / safeDistance * force;
          tx += (up[0] * x + up[4] * y) / stretch;
          ty += up[1] * x + up[5] * y;
          tz += up[2] * x + up[6] * y + .10 * force;
        }
      }
      for (let axis = 0; axis < 3; axis++) {
        const j = k + axis, difference = (axis === 0 ? tx : axis === 1 ? ty : tz) - positions[j];
        if (reduced) { positions[j] = data.base[j]; velocities[j] = 0; }
        else { velocities[j] += (difference * 70 - velocities[j] * 13) * dt; positions[j] += velocities[j] * dt; }
        energy += Math.abs(difference) + Math.abs(velocities[j]);
      }
      dummy.position.set(positions[k], positions[k + 1], positions[k + 2]);
      // Compensate for the terrain's responsive horizontal spread: every ball stays round.
      dummy.scale.set(data.radii[i] / stretch, data.radii[i], data.radii[i]);
      dummy.updateMatrix(); spheres.setMatrixAt(i, dummy.matrix);
    }
    spheres.instanceMatrix.needsUpdate = true;
    unsettled.current = energy > .03;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
    <sphereGeometry args={[1, 8, 6]} />
    <meshStandardMaterial color="#ffffff" roughness={.36} metalness={.24} />
  </instancedMesh>;
}

