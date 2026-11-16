export const mediaTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' } as const;
export function mediaSignature(bytes:Uint8Array,mime:string) {
  const hex=(start:number,end:number)=>Array.from(bytes.slice(start,end)).map(n=>n.toString(16).padStart(2,'0')).join('');
  const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
  if(mime==='image/png')return hex(0,8)==='89504e470d0a1a0a';
  if(mime==='image/jpeg')return hex(0,3)==='ffd8ff';
  if(mime==='image/webp')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
  if(mime==='image/avif')return ascii(4,8)==='ftyp'&&ascii(8,40).includes('avif');
  if(mime==='video/mp4')return ascii(4,8)==='ftyp'&&['isom','iso2','mp41','mp42','avc1','M4V ','qt  '].includes(ascii(8,12));
  if(mime==='video/webm')return hex(0,4)==='1a45dfa3';
  return false;
}
