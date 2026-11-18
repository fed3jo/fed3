import { BufferGeometry, CircleGeometry, Color, Float32BufferAttribute, type Material } from 'three';
import type { Bounds } from '@/lib/fed3/exposed';

type Shape = (m: Material, x: number, y: number, z: number, width: number, height: number, depth: number, angle?: number) => void;

type LandmarkScene = {
  box: Shape;
  round: Shape;
  mesh: (geometry: BufferGeometry, material: Material, x?: number, y?: number, z?: number) => void;
  stone: Material;
  pale: Material;
  glass: Material;
  curtainWall: Material;
  tierStone: Material;
  navy: Material;
  lit: Material;
};

type Vertex = [number, number, number];

function rotanaFacade(x: number, z: number) {
  const panels: number[] = [], colors: number[] = [];
  const columns = 36, floors = 29;
  const palette = ['#1e333f', '#2d4a5d', '#3b5460', '#263e50'].map(hex => new Color(hex));
  const mullion = new Color('#5a5750'), warm = new Color('#c5a164'), spandrel = new Color('#26363c');
  const point = (column: number, floor: number): Vertex => {
    const angle = column / columns * Math.PI * 2;
    const t = floor / floors;
    const width = 4.5 + .75 * Math.sin(t * Math.PI) - .85 * Math.pow(t, 5);
    return [x + .42 * t + Math.sin(angle) * width,
      2.8 + t * (28.5 - 2.25 * Math.sin(angle) - .28 * Math.cos(angle)),
      z + Math.cos(angle) * (3.52 - .45 * t * t)];
  };
  const panel = (column: number, floor: number, toColumn: number, toFloor: number, color: Color) => {
    const a = point(column, floor), b = point(toColumn, floor);
    const c = point(toColumn, toFloor), d = point(column, toFloor);
    panels.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
  };
  for (let column = 0; column < columns; column++) {
    for (let floor = 0; floor < floors; floor++) {
      const tone = (column * 13 + floor * 7) % 23 === 0 ? warm : palette[(column + Math.floor(floor / 6)) % palette.length];
      panel(column, floor, column + .13, floor + 1, mullion);
      panel(column + .13, floor, column + 1, floor + .08, spandrel);
      panel(column + .13, floor + .08, column + 1, floor + 1, tone);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(panels, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function addRotana({ box, mesh, stone, glass, curtainWall, navy, lit }: LandmarkScene): Bounds {
  const x = -12.2, z = -55;
  mesh(rotanaFacade(x, z), curtainWall);
  box(stone, x, .29, z, 13, .58, 10);
  box(navy, x, 1.55, z, 11.2, 2.2, 8.4);
  box(glass, x, 1.6, z + 4.22, 10.4, 1.64, .09);
  box(stone, x, 2.81, z, 12.1, .35, 9.1);
  box(lit, x, 2.59, z + 4.25, 10.9, .055, .1);
  for (let offset = -4.5; offset <= 4.5; offset += 1.12) box(stone, x + offset, 1.53, z + 4.29, .14, 2.1, .18);
  return { x, z, w: 13, d: 10, height: 34 };
}

function addRoyal({ box, round, mesh, stone, pale, glass, navy, lit }: LandmarkScene): Bounds {
  const x = 11.6, z = -54.5;
  round(stone, x, 1.05, z, 6.85, 2.1, 6.1);
  round(pale, x, 5.8, z, 5.55, 8.8, 5.15);
  round(stone, x, 10.5, z, 5.6, .47, 5.22);
  round(pale, x, 18.25, z, 3.85, 15.1, 3.85);
  round(stone, x, 25.93, z, 3.92, .24, 3.92);
  round(pale, x, 26.68, z, 3.69, 1.42, 3.69);
  round(stone, x, 27.39, z, 3.48, .16, 3.48);

  box(glass, x, 1.05, z + 6.11, 2.8, 1.48, .12);
  box(stone, x, 1.95, z + 6.1, 3.3, .24, .75);
  for (const floor of [3.65, 5.55, 7.5]) {
    box(glass, x, floor, z + 5.18, 2.5, 1.15, .16);
    for (let pane = -2; pane <= 2; pane++) box(pale, x + pane * .44, floor, z + 5.28, .085, 1.26, .13);
  }

  for (let bay = 1; bay < 20; bay++) {
    const angle = bay * Math.PI / 10;
    const sx = Math.sin(angle), sz = Math.cos(angle);
    for (let floor = 3.2; floor <= 9.6; floor += 1.4) {
      box(glass, x + sx * 5.54, floor, z + sz * 5.14, .48, floor > 9 ? .9 : .49, .14, angle);
    }
  }
  for (let floor = 11.8; floor < 25; floor += 1.31) {
    box(navy, x, floor, z + 3.88, 2.12, .56, .16);
    box(pale, x, floor - .32, z + 4.01, 2.33, .13, .57);
    for (let bay = 2; bay < 18; bay++) {
      const angle = bay * Math.PI / 10;
      box((bay + Math.round(floor)) % 11 === 0 ? lit : glass,
        x + Math.sin(angle) * 3.845, floor, z + Math.cos(angle) * 3.845, .31, .7, .13, angle);
    }
  }
  mesh(new CircleGeometry(.61, 28), stone, x, 24.82, z + 4.04);
  mesh(new CircleGeometry(.51, 28), glass, x, 24.82, z + 4.06);
  box(pale, x, 24.82, z + 4.08, .055, 1, .05);
  box(pale, x, 24.82, z + 4.08, 1, .055, .05);

  // The ascending terrace is visible around the right side of the lower drum.
  for (let piece = 0; piece < 15; piece++) {
    const angle = .42 + piece * .13;
    box(stone, x + Math.sin(angle) * 5.6, 2.12 + piece * .27, z + Math.cos(angle) * 5.35, .92, .28, .54, angle);
  }
  return { x, z, w: 13.7, d: 12.2, height: 28 };
}

function addIskan({ box, stone, pale, glass }: LandmarkScene): Bounds {
  const x = 11.2, z = -99;
  for (let floor = 0; floor < 12; floor++) {
    const setback = Math.floor(floor / 3);
    const y = floor * 1.47 + .73;
    const width = 10.5 - setback * 1.08;
    const depth = 8.9 - setback * .83;
    box(stone, x, y, z, width, 1.46, depth);
    box(glass, x, y + .11, z + depth / 2 + .04, width - .68, .73, .11);
    box(pale, x, y - .42, z + depth / 2 + .11, width + .43, .27, .41);
    for (let bay = -width / 2 + .72; bay < width / 2 - .35; bay += 1.08) {
      box(pale, x + bay, y + .11, z + depth / 2 + .11, .15, .83, .14);
    }
  }
  return { x, z, w: 10.5, d: 8.9, height: 17.7 };
}

function addTheatre({ box, mesh, stone, pale, navy, tierStone }: LandmarkScene) {
  const z = -143;
  box(stone, 0, .43, z + 3, 33, .86, 7.6);
  box(pale, 0, 1.02, z + .8, 27.6, .29, 5.2);
  box(stone, 0, 1.31, z + 4.13, 31, 1.82, 1);
  for (let column = -13.5; column <= 13.5; column += 2.25) {
    box(navy, column, 1.46, z + 4.66, .77, 1.16, .035);
    box(pale, column - .75, 1.34, z + 4.81, .32, 1.51, .49);
    box(pale, column, 2.14, z + 4.72, .9, .21, .27);
  }
  box(pale, 0, 2.31, z + 4.49, 31.2, .31, 1.06);

  const vertices: number[] = [], colors: number[] = [];
  const tread = new Color('#cabba1'), riser = new Color('#a99a84'), aisleStone = new Color('#b5aa96');
  const stepEdge = new Color('#746a57'), promenadeEdge = new Color('#d2c6ae');
  const variations = [tread, new Color('#c4b9a7'), new Color('#d1c7b4')];
  const masonry = [new Color('#a99477'), new Color('#b39d81'), new Color('#a88f71')];
  const point = (angle: number, radius: number, height: number): Vertex => [Math.sin(angle) * radius, height, z - Math.cos(angle) * radius];
  const quad = (a: Vertex, b: Vertex, c: Vertex, d: Vertex, color: Color) => {
    vertices.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
  };
  const sections = 38;
  let inner = 3.82, previousY = 1.19;
  for (let row = 0; row < 34; row++) {
    const band = Math.floor(row / 12);
    const outer = 4.2 + row * .364 + band * 1.07;
    const height = 1.29 + row * .315 + band * .47;
    for (let segment = 0; segment < sections; segment++) {
      const a = segment / sections * Math.PI - Math.PI / 2, b = a + Math.PI / sections;
      const aisle = row > 1 && (segment === 6 || segment === 15 || segment === 22 || segment === 31);
      const elevation = aisle ? height - .17 : height;
      const color = aisle ? aisleStone : variations[(segment * 7 + row) % variations.length];
      const base = row > 2 && aisle ? previousY - .17 : previousY;
      const edge = elevation - Math.min(.095, (elevation - base) * .42);
      quad(point(a, inner, base), point(b, inner, base), point(b, inner, edge), point(a, inner, edge), riser);
      quad(point(a, inner, edge), point(b, inner, edge), point(b, inner, elevation), point(a, inner, elevation), row % 12 === 0 ? promenadeEdge : stepEdge);
      quad(point(a, inner, elevation), point(b, inner, elevation), point(b, outer, elevation), point(a, outer, elevation), color);
      if (aisle) {
        quad(point(a, inner, elevation), point(a, outer, elevation), point(a, outer, height), point(a, inner, height), riser);
        quad(point(b, outer, elevation), point(b, inner, elevation), point(b, inner, height), point(b, outer, height), riser);
      }
    }
    for (const side of [-1, 1]) {
      const left = side < 0 ? -outer : inner, right = side < 0 ? -inner : outer;
      const front = z - .035;
      for (let course = 0, y = .36; y < height; course++, y += .74) {
        const top = Math.min(height, y + .74);
        quad([left,y,front], [right,y,front], [right,top,front], [left,top,front], masonry[(course + Math.floor(row / 3)) % masonry.length]);
      }
    }
    inner = outer;
    previousY = height;
  }
  for (let segment = 0; segment < sections; segment++) {
    const a = segment / sections * Math.PI - Math.PI / 2, b = a + Math.PI / sections;
    quad(point(b, inner, .36), point(a, inner, .36), point(a, inner, previousY), point(b, inner, previousY), masonry[1]);
    quad(point(a, inner - .3, previousY), point(b, inner - .3, previousY), point(b, inner - .3, previousY + .43), point(a, inner - .3, previousY + .43), promenadeEdge);
  }
  const bowl = new BufferGeometry();
  bowl.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  bowl.setAttribute('color', new Float32BufferAttribute(colors, 3));
  bowl.computeVertexNormals();
  mesh(bowl, tierStone);

  // A small arched recess interrupts the rear retaining wall.
  const rear = z - 17.25;
  box(stone, 0, 12.56, rear, 3, 2.5, .84);
  box(navy, 0, 12.65, rear + .43, .88, 1.32, .06);
  for (let part = 0; part < 9; part++) {
    const angle = part / 8 * Math.PI;
    box(pale, Math.cos(angle) * .58, 13.24 + Math.sin(angle) * .58, rear + .56, .21, .23, .17);
  }
}

export function buildAmmanLandmarks(scene: LandmarkScene): Bounds[] {
  const bounds = [addRotana(scene), addRoyal(scene), addIskan(scene)];
  addTheatre(scene);
  return bounds;
}
