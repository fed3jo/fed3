import { mkdir, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import sharp from 'sharp';
import { buildTerrainSpheres, summit, terrainLayout } from '../components/landing/terrain-model.ts';

const spheres = buildTerrainSpheres();
const fixed = n => Number(n.toFixed(2));
await mkdir('public/hero/particles', { recursive: true });
for (const [name,width,height] of [['desktop',1440,600],['wide',1920,680],['mobile',390,550],['narrow',320,520]]) {
  const { zoom, stretch, flagScale } = terrainLayout(width,height);
  const camera = new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.1,50);
  camera.zoom=zoom; camera.position.set(.2,4.1,14); camera.lookAt(0,2.7,0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const project=(x,y,z)=>{const p=new THREE.Vector3(x,y,z).project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2,z:p.z};};
  const dots=[];
  for(let i=0;i<spheres.radii.length;i++) {
    const p=project(spheres.base[i*3]*stretch,spheres.base[i*3+1],spheres.base[i*3+2]);
    const r=spheres.radii[i]*zoom;
    if(p.x < -r || p.x > width+r || p.y < -r || p.y > height+r) continue;
    dots.push({...p,r,color:i%71===0?'orange':i%13===0?'light':i%7===0?'mid':'navy'});
  }
  dots.sort((a,b)=>b.z-a.z);
  const body=dots.map(p=>`<circle cx="${fixed(p.x)}" cy="${fixed(p.y)}" r="${fixed(p.r)}" fill="url(#${p.color})"/>`).join('');
  const pole=project(summit.x*stretch,summit.y,summit.z), tip=project(summit.x*stretch,summit.y+.88*flagScale,summit.z);
  const flagW=2.1*flagScale*zoom, flagH=.59*flagScale*zoom;
  const defs=['navy','mid','light','orange'].map((key,i)=>`<radialGradient id="${key}" cx="30%" cy="23%" r="83%"><stop stop-color="${['#416391','#5075a1','#6486b1','#ffae55'][i]}"/><stop offset=".38" stop-color="${['#143966','#214c7b','#2d5889','#f16e00'][i]}"/><stop offset="1" stop-color="${['#061c42','#08264c','#10315a','#b64a00'][i]}"/></radialGradient>`).join('');
  for(const locale of ['ar','en']) {
    const title=locale==='ar'?'بياناتك. قرارك!':'Your data. Your decision!';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs>${body}<path d="M${fixed(pole.x)} ${fixed(pole.y)}V${fixed(tip.y)}" stroke="#062759" stroke-width="2.2" stroke-linecap="round"/><circle cx="${fixed(tip.x)}" cy="${fixed(tip.y)}" r="2.5" fill="#f16e00"/><rect x="${fixed(tip.x+2)}" y="${fixed(tip.y+2)}" width="${fixed(flagW)}" height="${fixed(flagH)}" fill="#f16e00"/><text x="${fixed(tip.x+2+flagW/2)}" y="${fixed(tip.y+2+flagH*.61)}" text-anchor="middle" direction="${locale==='ar'?'rtl':'ltr'}" font-family="Arial,sans-serif" font-weight="bold" font-size="${fixed(flagH*(locale==='ar'?.43:.23))}" fill="#fffdf8">${title}</text></svg>`;
    await writeFile(`public/hero/particles/${name}-${locale}.svg`,svg);
    await sharp(Buffer.from(svg)).webp({quality:88}).toFile(`public/hero/particles/${name}-${locale}.webp`);
  }
}
console.log(`Built responsive first-paint previews from ${spheres.radii.length} shared terrain spheres.`);
