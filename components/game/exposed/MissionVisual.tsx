import styles from './exposed.module.css';

export type VisualKind = 'delivery' | 'stealth' | 'pulse' | 'navigation' | 'contacts' | 'files';

function Folder({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M-19-13h16l6 6h18v30h-40z" fill="#1e4355" stroke="#b7ded5" strokeWidth="2" /><path d="M-10 3h20M-10 10H5" stroke="#b7ded5" strokeWidth="2" /></g>;
}
function Drone({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`} stroke="#f7aa72" strokeWidth="2" fill="#24394c"><path d="m-20-8 12 9m28-9L8 1M-8 4l-12 8M8 4l12 8" /><ellipse cx="0" cy="1" rx="11" ry="7" /><path d="M-28-9h16M12-9h16M-28 13h16M12 13h16" /><circle cy="4" r="2" fill="#ffac6b" /></g>;
}

export default function MissionVisual({ kind, label }: { kind: VisualKind; label: string }) {
  return <svg className={styles.missionVisual} viewBox="0 0 280 130" role="img" aria-label={label} data-visual={kind}>
    <path d="M8 116H272M32 115V90h21v25m177 0V85h23v30" stroke="#7897a333" strokeWidth="2" fill="none" />
    {kind === 'delivery' && <>
      <path d="M63 77h120q20 0 20-22V39" fill="none" stroke="#f59b59" strokeWidth="2" strokeDasharray="5 5" />
      <Folder x={43} y={68} /><g stroke="#b7ded5" strokeWidth="2" fill="#173c4d"><path d="m209 35 28-18 28 18v49h-56z" /><path d="M229 84V60h16v24M220 45h8m16 0h8" /></g>
      <circle className={styles.routePacket} cx="78" cy="77" r="4" fill="#ffac6b" /><path d="m194 47 9-10 9 10" stroke="#f59b59" strokeWidth="2" fill="none" />
    </>}
    {kind === 'stealth' && <>
      <path className={styles.scanCone} d="m206 41-44 65h88z" fill="#f28a3b18" stroke="#f28a3b44" /><Drone x={206} y={29} />
      <path d="M89 116V49h49v67" fill="#1c3a4b" stroke="#7097a8" strokeWidth="2" /><path d="M99 61h9m12 0h9M99 75h9m12 0h9" stroke="#aac1cb" />
      <circle cx="69" cy="80" r="7" fill="#b7ded5" /><path d="M69 88v15m0-7-9 13m9-13 9 13" stroke="#b7ded5" strokeWidth="3" /><path d="m52 56 5 5 10-12" stroke="#a8d9b8" strokeWidth="3" fill="none" />
    </>}
    {kind === 'pulse' && <>
      <path d="m51 73 18-28-3 21h17L61 98l5-25z" fill="#ffb36e" />
      {[30, 47, 64].map((radius, i) => <path key={radius} className={styles.pulseWave} style={{ animationDelay: `${i * .25}s` }} d={`M${92 + radius * .4} ${70 - radius / 2}q${radius / 2} ${radius / 2} 0 ${radius}`} fill="none" stroke="#8ed7e4" strokeWidth="2" />)}
      <Drone x={214} y={65} /><path d="m204 91 6 7 15-17" stroke="#a8d9b8" strokeWidth="3" fill="none" />
    </>}
    {kind === 'navigation' && <>
      <path d="m23 34 33-10 33 10 33-10v73l-33 10-33-10-33 10z" fill="#183b4c" stroke="#7caaad" strokeWidth="2" /><path d="M56 26v70m33-60v69" stroke="#7caaad66" />
      <path d="M39 83V52h62" stroke="#f5a15f" strokeWidth="3" strokeDasharray="5 4" fill="none" /><circle cx="39" cy="83" r="4" fill="#f5a15f" />
      <path className={styles.scanCone} d="m134 54 12-10m-9 25 17-4m-18 17 14 6" stroke="#f5a15f" strokeWidth="2" /><Drone x={213} y={56} />
    </>}
    {kind === 'contacts' && <>
      {[42, 76, 110].map((x, i) => <g key={x}><circle cx={x} cy={49 + i % 2 * 8} r="10" fill="#a9d2c7" /><path d={`M${x - 14} 91v-14q14-17 28 0v14`} fill="#1e4355" stroke="#a9d2c7" strokeWidth="2" /></g>)}
      <path d="M141 66h35m-9-8 9 8-9 8" stroke="#f5a15f" strokeWidth="2" fill="none" /><Drone x={223} y={48} /><Drone x={223} y={91} />
    </>}
    {kind === 'files' && <>
      <rect x="12" y="13" width="117" height="99" rx="8" fill="#a8d9b810" stroke="#a8d9b84d" /><Folder x={70} y={53} /><path d="m56 87 8 7 19-19" stroke="#a8d9b8" strokeWidth="3" fill="none" />
      <path d="M169 67h66a13 13 0 0 0 0-26 22 22 0 0 0-41-8 18 18 0 0 0-25 34z" fill="#183b4c" stroke="#f5a15f" strokeWidth="2" />
      <rect x="193" y="79" width="22" height="20" rx="3" stroke="#f5a15f" strokeWidth="2" fill="#1e3547" /><path d="M198 79v-5a6 6 0 0 1 12 0v5" stroke="#f5a15f" strokeWidth="2" fill="none" />
    </>}
  </svg>;
}
