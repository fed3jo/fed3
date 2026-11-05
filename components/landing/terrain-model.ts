// Shared coordinates keep the surface, contours and packet paths on the same terrain.
export const summit = { x: -.65, y: 4.25, z: -.18 };
export function terrainLayout(width: number, height: number) {
  const zoom = height / 6.1;
  const flagWidth = Math.min(210, width * .32);
  return { zoom, stretch: width / zoom / 12.4, flagScale: Math.min(1, flagWidth / (2.1 * zoom)) };
}
export function terrainPoint(radius: number, angle: number): [number, number, number] {
  const ridge = Math.sin(angle * 5 + .6) * .17 + Math.cos(angle * 9 - radius * 3) * .09;
  const spread = radius * (1 + Math.sin(angle * 3 + .4) * .07);
  const nx = Math.cos(angle) * radius, nz = Math.sin(angle) * radius;
  const shoulder = .95 * Math.exp(-((nx + .37) ** 2 / .018 + (nz - .04) ** 2 / .07))
    + .72 * Math.exp(-((nx - .43) ** 2 / .025 + (nz - .18) ** 2 / .065));
  const falloff = 1.3 + Math.sin(angle * 3 + .5) * .27 + Math.cos(angle * 5) * .14;
  return [
    summit.x + Math.cos(angle) * spread * 6.7,
    radius > 1 ? -(radius - 1) * .9 : summit.y * Math.pow(1 - radius, falloff) + Math.sin(Math.PI * radius) * (ridge * 2.7 + shoulder),
    summit.z + Math.sin(angle) * spread * 3.15,
  ];
}
export type TerrainInput = { x: number; y: number; clientX: number; clientY: number; hover: boolean; scroll: number; impulse: number };

export function buildTerrainSpheres(compact = false) {
  const coordinates: number[] = [], radii: number[] = [];
  const rings = compact ? 32 : 50, density = compact ? 140 : 210;
  for (let ring = 0; ring <= rings; ring++) {
    const radius = ring / rings * 1.19, count = Math.max(1, Math.round(radius * density));
    for (let i = 0; i < count; i++) {
      const angle = (i + (ring % 2) * .5) / count * Math.PI * 2;
      const point = terrainPoint(radius, angle);
      const variation = Math.sin(i * 12.9898 + ring * 78.233) * 43758.5453;
      const noise = variation - Math.floor(variation);
      point[1] += (noise - .5) * .025;
      coordinates.push(...point); radii.push((compact ? .079 : .054) + noise * .015);
    }
  }
  return { base: new Float32Array(coordinates), radii: new Float32Array(radii) };
}
