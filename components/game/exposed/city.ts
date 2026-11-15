import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { checkpoints, type Bounds } from '@/lib/fed3/exposed';

export type City = { bounds: Bounds[]; beacons: THREE.Group[]; drones: THREE.Group[]; gun: THREE.Group; sun: THREE.DirectionalLight; ready: Promise<void>; dispose: () => void };
export function buildCity(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mobile: boolean, ar: boolean): City {
  const bounds: Bounds[] = [], beacons: THREE.Group[] = [], drones: THREE.Group[] = [];
  const textures: THREE.Texture[] = [], materials: THREE.Material[] = [], geometries: THREE.BufferGeometry[] = [];
  const loader = new THREE.TextureLoader();
  const pending: Promise<unknown>[] = [];
  const load = (file: string, color = false, repeat = 1) => {
    let finish: () => void;
    const loaded = new Promise<void>(resolve => { finish = resolve; });
    const t = loader.load(`/game/exposed/textures/${file}`, () => finish(), undefined, () => finish());
    pending.push(loaded);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t); return t;
  };
  const material = (options: THREE.MeshStandardMaterialParameters) => { const m = new THREE.MeshStandardMaterial(options); materials.push(m); return m; };
  const concreteMap = load('concrete_floor_worn_001_diff_1k.jpg', true, 2);
  const concrete = material({ map: concreteMap, color: '#b5ae9e', roughness: .93, normalMap: mobile ? null : load('concrete_floor_worn_001_nor_gl_1k.jpg', false, 2), normalScale: new THREE.Vector2(.35, .35) });
  const pale = material({ map: concreteMap, color: '#d5c9b4', roughness: .87 });
  const brick = material({ map: load('brick_wall_001_diffuse_1k.jpg', true, 3), normalMap: mobile ? null : load('brick_wall_001_nor_gl_1k.jpg', false, 3), roughness: .9, color: '#b7a08b' });
  const road = material({ map: load('asphalt_02_diff_1k.jpg', true, 21), normalMap: mobile ? null : load('asphalt_02_nor_gl_1k.jpg', false, 21), roughnessMap: load('asphalt_02_rough_1k.jpg', false, 21), color: '#7a858c', roughness: .85 });
  const navy = material({ color: '#10243b', metalness: .65, roughness: .35 });
  const metal = material({ color: '#52606c', metalness: .8, roughness: .38 });
  const rubber = material({ color: '#10171c', roughness: .95 });
  const glass = material({ color: '#2e4c60', metalness: .65, roughness: .23 });
  const lit = material({ color: '#dfc697', emissive: '#efb867', emissiveIntensity: .38, roughness: .45 });
  const orange = material({ color: '#ef791f', emissive: '#cf4a07', emissiveIntensity: .3, metalness: .3, roughness: .4 });
  const white = material({ color: '#d6d3bb', roughness: .8 });
  const red = material({ color: '#9c4139', metalness: .35, roughness: .4 });
  const boxGeo = new THREE.BoxGeometry(1, 1, 1), cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10), sphereGeo = new THREE.SphereGeometry(1, 10, 7);
  const roundedGeo = new RoundedBoxGeometry(1, 1, 1, 2, .12); geometries.push(roundedGeo);
  geometries.push(boxGeo, cylGeo, sphereGeo);
  const batches = new Map<string, { geo: THREE.BufferGeometry; mat: THREE.Material; matrices: THREE.Matrix4[] }>();
  const dummy = new THREE.Object3D();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, rz = 0) => {
    const key = geo.uuid + mat.uuid;
    if (!batches.has(key)) batches.set(key, { geo, mat, matrices: [] });
    dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(0, ry, rz); dummy.updateMatrix(); batches.get(key)!.matrices.push(dummy.matrix.clone());
  };
  const box = (m: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) => add(boxGeo, m, x, y, z, w, h, d, ry);
  const cylinder = (m: THREE.Material, x: number, y: number, z: number, r: number, h: number, ry = 0) => add(cylGeo, m, x, y, z, r, h, r, ry);
  const solid = (x: number, z: number, w: number, d: number, height: number) => bounds.push({ x, z, w, d, height });
  const sign = (text: string, sub: string, x: number, y: number, z: number, width: number, ry = 0, dark = true) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = dark ? '#082039' : '#d4c5a6'; ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = '#f47b24'; ctx.fillRect(0, 0, 12, 256);
    ctx.textAlign = 'center'; ctx.direction = ar ? 'rtl' : 'ltr'; ctx.fillStyle = dark ? '#fff0d4' : '#102b44';
    ctx.font = '600 66px "IBM Plex Arabic", sans-serif'; ctx.fillText(text, 512, 116, 950);
    ctx.font = '26px sans-serif'; ctx.fillStyle = dark ? '#a8b7c4' : '#5b625f'; ctx.fillText(sub, 512, 190, 950);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; textures.push(t);
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: .6, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: .16 }); materials.push(m);
    const geo = new THREE.PlaneGeometry(width, width / 4); geometries.push(geo);
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); mesh.rotation.y = ry; scene.add(mesh);
  };
  let seed = 9182;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const foliageCanvas = document.createElement('canvas'); foliageCanvas.width = foliageCanvas.height = 256;
  const foliageContext = foliageCanvas.getContext('2d')!;
  for (let i = 0; i < 1800; i++) {
    const angle = rand() * Math.PI * 2, radius = Math.sqrt(rand());
    const x = 128 + Math.cos(angle) * radius * 118, y = 128 + Math.sin(angle) * radius * 112;
    foliageContext.fillStyle = ['#435538', '#596849', '#71825b', '#303f2c', '#8a956b'][Math.floor(rand() * 5)];
    foliageContext.beginPath(); foliageContext.ellipse(x, y, 2 + rand() * 4, 1.5 + rand() * 2, rand() * 3, 0, Math.PI * 2); foliageContext.fill();
  }
  const foliageTexture = new THREE.CanvasTexture(foliageCanvas); foliageTexture.colorSpace = THREE.SRGBColorSpace; textures.push(foliageTexture);
  const leaf = material({ map: foliageTexture, alphaTest: .5, side: THREE.DoubleSide, roughness: 1 });
  const leafGeo = new THREE.PlaneGeometry(1, 1); geometries.push(leafGeo);
  box(road, 0, -.15, -63, 110, .3, 190);
  for (const side of [-1, 1]) {
    for (const [z, d] of [[-10, 52], [-63, 26], [-111, 42]] as const) {
      box(concrete, side * 7.5, .09, z, 3.1, .2, d);
      box(pale, side * 5.95, .12, z, .22, .24, d);
    }
    for (const z of [-3, -23, -61, -101, -121, -142]) {
      const w = 10 + rand() * 3, d = 13 + rand() * 2, h = 9 + rand() * 15, x = side * (8.4 + w / 2);
      const face = side < 0 ? x + w / 2 + .05 : x - w / 2 - .05;
      const facade = rand() > .6 ? brick : rand() > .45 ? pale : concrete;
      box(facade, x, h / 2, z, w, h, d); solid(x, z, w, d, h);
      box(navy, face, 1.75, z, .12, 2.8, d - 1);
      for (let zz = z - d / 2 + 1.6; zz < z + d / 2 - .8; zz += 2.55) {
        box(metal, face + side * -.08, 1.8, zz, .15, 2.7, .06);
        for (let yy = 4.2; yy < h - 1; yy += 3.15) {
          box(navy, face - side * .05, yy, zz, .16, 1.9, 1.4);
          box(rand() > .65 ? lit : glass, face - side * .15, yy, zz, .07, 1.65, 1.18);
          box(concrete, face - side * .2, yy - 1.06, zz, .45, .16, 1.7);
          if (yy < 9 && rand() > .6) {
            box(pale, face - side * .6, yy - 1.14, zz, 1.3, .15, 2);
            box(metal, face - side * 1.2, yy - .6, zz, .07, 1, 1.9);
          }
        }
      }
      box(pale, x, h + .15, z, w + .35, .3, d + .35);
      box(navy, x + 1, h + .7, z, 2.5, 1.1, 1.7);
      cylinder(metal, x - 2, h + 1, z + 2, .7, 1.8);
      box(orange, face - side * .8, 3.25, z, 1.8, .13, d - .7);
      for (const far of [1, 2]) {
        const fh = 16 + rand() * 30, fx = side * (28 + far * 10);
        box(rand() > .5 ? pale : concrete, fx, fh / 2, z - far * 3, 8, fh, 11);
        solid(fx, z - far * 3, 8, 11, fh);
        for (let y = 4; y < fh; y += 3) box(glass, fx - side * 4.03, y, z - far * 3, .05, 1.4, 8);
      }
    }
  }
  for (let z = 17; z > -145; z -= 7) {
    box(white, 0, .015, z, .13, .022, 2.4);
    box(white, -5.25, .015, z - 2, .08, .022, 6.5); box(white, 5.25, .015, z - 2, .08, .022, 6.5);
  }
  for (const z of [-43, -83]) {
    for (let x = -4.8; x < 5; x += 1.3) {
      box(white, x, .02, z + 6, .6, .025, 2); box(white, x, .02, z - 6, .6, .025, 2);
    }
    for (let x = -32; x < 33; x += 6) box(white, x, .02, z, 2, .025, .12);
  }
  for (const side of [-1, 1]) for (const z of [9, -16, -51, -71, -94, -114, -136]) {
    const x = side * 6.7;
    cylinder(navy, x, 2.7, z, .075, 5.4); box(navy, x - side * .55, 5.35, z, 1.2, .1, .13);
    box(lit, x - side * 1.03, 5.3, z, .5, .07, .23);
    box(concrete, side * 7.65, .35, z + 3, 1.5, .7, 1.5); solid(side * 7.65, z + 3, 1.5, 1.5, .7);
    cylinder(brick, side * 7.65, 1.5, z + 3, .11, 2.4);
    for (let j = 0; j < 4; j++) add(leafGeo, leaf, side * 7.65, 3.5, z + 3, 3.1, 3.4, 1, j * Math.PI / 4);
    cylinder(metal, side * 5.9, .4, z + 1.8, .09, .8);
  }
  const car = (x: number, z: number, m: THREE.Material, angle = 0) => {
    const g = new THREE.Group();
    const part = (mat: THREE.Material, xx: number, yy: number, zz: number, w: number, h: number, d: number) => { const mesh = new THREE.Mesh(roundedGeo, mat); mesh.position.set(xx, yy, zz); mesh.scale.set(w, h, d); mesh.castShadow = true; g.add(mesh); };
    part(m, 0, .62, 0, 1.85, .65, 4.1); part(m, 0, 1.1, -.18, 1.65, .65, 2.2);
    part(glass, 0, 1.16, -.18, 1.67, .48, 1.99); part(m, 0, 1.48, -.2, 1.67, .13, 2.1);
    part(metal, 0, .52, 2.05, 1.65, .16, .1); part(lit, -.6, .78, 2.08, .4, .15, .06); part(lit, .6, .78, 2.08, .4, .15, .06);
    part(red, -.65, .78, -2.08, .3, .14, .06); part(red, .65, .78, -2.08, .3, .14, .06);
    for (const xx of [-.92, .92]) for (const zz of [-1.3, 1.3]) {
      const wheel = new THREE.Mesh(cylGeo, rubber); wheel.rotation.z = Math.PI / 2; wheel.scale.set(.34, .22, .34); wheel.position.set(xx, .37, zz); g.add(wheel);
    }
    g.position.set(x, 0, z); g.rotation.y = angle; scene.add(g); solid(x, z, angle ? 4.3 : 2, angle ? 2 : 4.3, 1.5);
  };
  car(-4.35, -14, navy); car(4.35, -57, white); car(-4.35, -105, red); car(24, -47.5, navy, Math.PI / 2);
  for (const z of [-32, -70, -112]) {
    box(metal, -7.1, .54, z, .7, 1.08, 1.2); solid(-7.1, z, .7, 1.2, 1.08);
    for (let j = 0; j < 9; j++) box(rubber, -5.7 + j * .08, .022, z + 2, .035, .02, .65);
    for (const side of [-1, 1]) {
      box(brick, side * 7.1, .62, z - 1, .9, 1.24, 1.1); solid(side * 7.1, z - 1, .9, 1.1, 1.24);
    }
  }
  // Overhead utility cables give the streets scale without extra simulation.
  for (const z of [-30, -67, -108]) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-9, 8, z), new THREE.Vector3(0, 6.8, z), new THREE.Vector3(9, 8, z)]);
    const geo = new THREE.TubeGeometry(curve, 14, .018, 3, false); geometries.push(geo); scene.add(new THREE.Mesh(geo, rubber));
  }
  box(pale, 0, 6, -142, 15, 12, 12); solid(0, -142, 15, 12, 12);
  box(navy, 0, 2.3, -135.95, 5, 4.6, .1);
  sign(ar ? 'بياناتك. قرارك.' : 'Your data. Your decision.', 'FED3 / COMMUNITY HUB', 0, 5.7, -135.8, 10);
  sign(ar ? 'المقرّ المجتمعي' : 'Community hub', '127 / AL MADINA', 0, 2.5, -135.8, 4);
  sign(ar ? 'المدينة بتعرفك' : 'The city knows you', 'NEXA / CONNECTED LIVING', -8.35, 7, -23, 7, Math.PI / 2);
  sign(ar ? 'كل شي أسهل مع نكسا' : 'Everything is easier with NEXA', 'YOUR CITY. CONNECTED.', 8.35, 8, -64, 7, -Math.PI / 2);
  sign(ar ? 'شارع الأرشيف' : 'Archive street', 'ARCHIVE  →  /  043', 0, 4.5, -34, 4.5);
  sign(ar ? 'محطة الملفات' : 'Transfer station', '←  TRANSFER  /  083', 0, 4.5, -74, 4.5);
  for (let i = 0; i < checkpoints.length; i++) {
    const cp = checkpoints[i];
    box(navy, cp.x, .95, cp.z, .8, 1.9, .65); solid(cp.x, cp.z, .8, .65, 1.9);
    box(orange, cp.x, 1.6, cp.z + .34, .62, .4, .02);
    sign(ar ? cp.ar : cp.en, `FED3 / 0${i + 1}`, cp.x, 2.5, cp.z + .36, 2.5);
    const group = new THREE.Group(); group.position.set(cp.x, .04, cp.z);
    const ringGeo = new THREE.RingGeometry(1.35, 1.48, 48); geometries.push(ringGeo);
    const bm = new THREE.MeshBasicMaterial({ color: '#fc8a3a', transparent: true, opacity: .8, side: THREE.DoubleSide }); materials.push(bm);
    const ring = new THREE.Mesh(ringGeo, bm); ring.rotation.x = -Math.PI / 2; group.add(ring);
    const pillarGeo = new THREE.CylinderGeometry(.035, .035, 9, 5); geometries.push(pillarGeo);
    const pillar = new THREE.Mesh(pillarGeo, bm); pillar.position.y = 4.5; group.add(pillar);
    scene.add(group); beacons.push(group);
  }
  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(boxGeo, navy); body.scale.set(.8, .24, .6); group.add(body);
    for (const x of [-.6, .6]) for (const z of [-.5, .5]) {
      const arm = new THREE.Mesh(boxGeo, metal); arm.position.set(x / 2, 0, z / 2); arm.scale.set(.8, .06, .07); arm.rotation.y = x * z > 0 ? -.7 : .7; group.add(arm);
      const rotor = new THREE.Mesh(cylGeo, rubber); rotor.position.set(x, .12, z); rotor.scale.set(.33, .025, .33); group.add(rotor);
    }
    const eye = new THREE.Mesh(sphereGeo, orange); eye.scale.set(.13, .13, .13); eye.position.set(0, -.08, .35); group.add(eye);
    const coneGeo = new THREE.ConeGeometry(2.5, 6, 24, 1, true); geometries.push(coneGeo);
    const cm = new THREE.MeshBasicMaterial({ color: '#ff9c58', transparent: true, opacity: .045, side: THREE.DoubleSide, depthWrite: false }); materials.push(cm);
    const cone = new THREE.Mesh(coneGeo, cm); cone.position.y = -3.1; group.add(cone);
    scene.add(group); drones.push(group);
  }
  for (const batch of batches.values()) {
    const mesh = new THREE.InstancedMesh(batch.geo, batch.mat, batch.matrices.length);
    batch.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix)); mesh.castShadow = batch.mat !== white && batch.mat !== lit; mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh);
  }
  const sun = new THREE.DirectionalLight('#ffe0b3', 3.4); sun.position.set(-24, 35, 4); sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -32; sun.shadow.camera.right = 32; sun.shadow.camera.top = 32; sun.shadow.camera.bottom = -32; sun.shadow.camera.near = 1; sun.shadow.camera.far = 110; sun.shadow.normalBias = .045; sun.shadow.bias = -.0002;
  scene.add(sun, sun.target); scene.add(new THREE.HemisphereLight('#c2def5', '#6e6554', 1.6));
  const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff0cb', fog: false })); sunDisk.position.set(-120, 75, -250); scene.add(sunDisk); geometries.push(sunDisk.geometry); materials.push(sunDisk.material);
  const gun = new THREE.Group();
  const gunPart = (m: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number) => { const mesh = new THREE.Mesh(roundedGeo, m); mesh.position.set(x, y, z); mesh.scale.set(w, h, d); gun.add(mesh); };
  gunPart(navy, 0, 0, 0, .13, .13, .4); gunPart(metal, 0, .04, -.2, .1, .09, .18); gunPart(orange, 0, .105, -.05, .025, .018, .25); gunPart(rubber, 0, -.1, .08, .09, .2, .1); gunPart(metal, 0, .1, -.15, .08, .025, .08);
  for (let i = 0; i < 3; i++) { const ring = new THREE.Mesh(cylGeo, i === 1 ? orange : metal); ring.rotation.x = Math.PI / 2; ring.position.set(0, .04, -.2 - i * .045); ring.scale.set(.065, .025, .065); gun.add(ring); }
  const glove = new THREE.Mesh(roundedGeo, rubber); glove.scale.set(.115, .14, .17); glove.rotation.x = -.25; glove.position.set(.025, -.13, .11); gun.add(glove);
  gun.position.set(.28, -.28, -.55); camera.add(gun); scene.add(camera);
  let disposed = false, environment: THREE.WebGLRenderTarget | null = null;
  pending.push(new Promise<void>(resolve => {
    new HDRLoader().load('/game/exposed/textures/industrial_sunset_02_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      if (!disposed) { const pmrem = new THREE.PMREMGenerator(renderer); environment = pmrem.fromEquirectangular(texture); scene.environment = environment.texture; scene.environmentIntensity = .55; scene.background = texture; scene.backgroundIntensity = .65; scene.backgroundBlurriness = .06; textures.push(texture); pmrem.dispose(); }
      else texture.dispose(); resolve();
    }, undefined, () => resolve());
  }));
  return { bounds, beacons, drones, gun, sun, ready: Promise.all(pending).then(() => undefined), dispose: () => { disposed = true; environment?.dispose(); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometries.forEach(g => g.dispose()); } };
}
