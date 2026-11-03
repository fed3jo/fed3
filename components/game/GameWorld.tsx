'use client';

import { memo, useId } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { concerns, type GameState } from '@/lib/fed3/game';
import { people, sceneCopy, type PersonId } from '@/lib/fed3/game-copy';
import styles from './game.module.css';

const point = (x: number, y: number, z = 0) => `${460 + x - y},${230 + (x + y) / 2 - z}`;
const position = (x: number, y: number) => ({ x: 460 + x - y, y: 230 + (x + y) / 2 });
function Box({ x, y, w, d, h, z = 0, color = '#d5bd95', top = '#f4e4c5', side = '#b89b70' }: { x: number; y: number; w: number; d: number; h: number; z?: number; color?: string; top?: string; side?: string }) {
  return <g><polygon points={`${point(x, y + d, z)} ${point(x + w, y + d, z)} ${point(x + w, y + d, z + h)} ${point(x, y + d, z + h)}`} fill={color} /><polygon points={`${point(x + w, y, z)} ${point(x + w, y + d, z)} ${point(x + w, y + d, z + h)} ${point(x + w, y, z + h)}`} fill={side} /><polygon points={`${point(x, y, z + h)} ${point(x + w, y, z + h)} ${point(x + w, y + d, z + h)} ${point(x, y + d, z + h)}`} fill={top} /></g>;
}
function Table({ x, y, w = 95, d = 48 }: { x: number; y: number; w?: number; d?: number }) {
  return <g>{[[x + 5, y + 5], [x + w - 10, y + 5], [x + 5, y + d - 10], [x + w - 10, y + d - 10]].map(([a, b], i) => <Box key={i} x={a} y={b} w={6} d={6} h={42} color="#ae8355" top="#d9b581" side="#88653e" />)}<Box x={x} y={y} w={w} d={d} h={6} z={42} color="#c99e6a" top="#e5c697" side="#ad804d" /></g>;
}
function Plant({ x, y, large = false }: { x: number; y: number; large?: boolean }) {
  const p = position(x, y);
  return <g transform={`translate(${p.x} ${p.y}) scale(${large ? 1.2 : .75})`}><ellipse cx="0" cy="1" rx="22" ry="9" fill="#302819" opacity=".1" /><path d="M-15-27 15-27 10 0Q0 8-10 0Z" fill="#ba9271" /><ellipse cy="-27" rx="15" ry="6" fill="#dfbc90" /><path d="M0-28V-91" stroke="#71805a" strokeWidth="3" />{[-76, -58, -42].map((n, i) => <g key={n}><ellipse cx={-8} cy={n} rx="7" ry="17" fill={i % 2 ? '#789269' : '#849e72'} transform={`rotate(-35 -8 ${n})`} /><ellipse cx={10} cy={n - 10} rx="7" ry="17" fill="#627c57" transform={`rotate(35 10 ${n - 10})`} /></g>)}</g>;
}
function Laptop({ x, y }: { x: number; y: number }) {
  return <g><Box x={x} y={y} w={35} d={24} h={3} z={48} color="#264c68" top="#779bad" side="#173c59" /><polygon points={`${point(x, y, 51)} ${point(x + 35, y, 51)} ${point(x + 35, y - 3, 80)} ${point(x, y - 3, 80)}`} fill="#153c59" /><polygon points={`${point(x + 3, y - 3, 55)} ${point(x + 31, y - 3, 55)} ${point(x + 31, y - 5, 76)} ${point(x + 3, y - 5, 76)}`} fill="#5ba7bc" /></g>;
}
function Stall({ x, y, second = false }: { x: number; y: number; second?: boolean }) {
  return <g><Table x={x} y={y} w={100} d={45} />{[[x, y], [x + 96, y], [x, y + 41], [x + 96, y + 41]].map(([a, b], i) => <Box key={i} x={a} y={b} w={4} d={4} h={118} color="#967a50" side="#7b6040" />)}<Box x={x - 8} y={y - 5} w={116} d={57} h={5} z={115} top={second ? '#d6a070' : '#ce896e'} color="#b67058" side="#a56551" />{[0, 1, 2, 3, 4].map(n => <polygon key={n} points={`${point(x - 8 + n * 24, y + 52, 115)} ${point(x + 10 + n * 24, y + 52, 115)} ${point(x + 10 + n * 24, y + 52, 105)} ${point(x + 1 + n * 24, y + 52, 101)} ${point(x - 8 + n * 24, y + 52, 105)}`} fill={n % 2 ? '#eed0a8' : '#b9755d'} />)}{[0, 1, 2].map(n => <g key={n}><Box x={x + 12 + n * 26} y={y + 17} w={18} d={16} h={8} z={48} color={second ? '#7d8d53' : '#bb9765'} top={second ? '#b3be74' : '#edd9a6'} side="#9f8054" /></g>)}</g>;
}
export function Character({ person, mood = 'neutral', selected = false, portrait = false }: { person: PersonId; mood?: 'neutral' | 'concerned' | 'happy'; selected?: boolean; portrait?: boolean }) {
  const p = people.find(item => item.id === person)!;
  const elder = person === 'um-yousef';
  const woman = ['salma', 'um-yousef', 'rana'].includes(person);
  const skin = person === 'omar' ? '#b98459' : person === 'karim' ? '#c89366' : '#d6a67b';
  return <g data-character={person} className={portrait ? undefined : styles.character}>
    {!portrait && <ellipse cx="0" cy="1" rx="22" ry="8" fill={selected ? '#f16e00' : '#352632'} opacity={selected ? '.24' : '.12'} />}
    <path d="M-13-34-12-4-3-4 0-33 5-4 14-4 13-36Z" fill={elder ? '#576545' : '#30465a'} />
    <path d="M-13-6-16 0Q-16 4-3 3L-3-5M5-5 5 2Q19 5 19 0L13-6" fill="#253b4d" />
    <path d={elder ? 'M-11-64Q0-70 12-63L22-23Q0-15-22-23Z' : 'M-14-66Q0-72 15-64L17-33Q0-26-17-33Z'} fill={p.color} />
    <path d="M-11-64Q0-58 11-64L7-41-7-41Z" fill={elder ? '#93a17f' : '#f5ead7'} />
    <path d="M-14-61Q-22-58-24-44L-17-41-10-57" fill={p.color} /><path d={selected ? 'M14-61Q23-60 26-72L33-69Q29-47 16-45Z' : 'M14-61Q23-56 24-41L17-38 10-56Z'} fill={p.color} />
    <ellipse cx="-21" cy="-40" rx="4.5" ry="6" fill={skin} /><ellipse cx={selected ? 30 : 21} cy={selected ? -73 : -37} rx="4.5" ry="6" fill={skin} />
    <rect x="-5" y="-76" width="10" height="15" rx="4" fill={skin} />
    {woman && !elder && <ellipse cx="1" cy="-86" rx="20" ry="24" fill={person === 'rana' ? '#46382f' : '#273440'} />}
    {elder && <path d="M-21-65-22-90Q-20-114 1-113 24-111 25-88L21-62 9-68-7-65Z" fill="#eee4cc" />}
    <path d="M-16-93Q-16-108 0-108 18-108 18-91L16-77Q8-66-3-72-16-76-16-93" fill={skin} />
    <path d="M0-106Q19-107 18-88L15-77Q9-69 3-72 15-81 10-105" fill="#ad7957" opacity=".28" />
    {!elder && <path d={woman ? 'M-17-85Q-24-109-5-113 19-118 20-91L13-98Q-3-98-10-104L-12-83Z' : 'M-17-88Q-24-110-6-114 9-120 18-109L22-101 14-98Q-3-96-11-104L-13-88Z'} fill={person === 'yaser' ? '#43362e' : '#29353b'} />}
    {elder && <path d="M-20-84Q-27-106-7-113 21-118 25-89L18-82 15-102Q-3-110-15-98L-16-81Z" fill="#f4ecd9" />}
    <ellipse cx="-6" cy="-90" rx="1.5" ry={mood === 'happy' ? .9 : 1.8} fill="#3e352f" /><ellipse cx="8" cy="-88" rx="1.5" ry={mood === 'happy' ? .9 : 1.8} fill="#3e352f" />
    <path d={mood === 'concerned' ? 'M-4-78Q1-82 7-78' : 'M-4-80Q2-75 7-80'} fill="none" stroke="#79513e" strokeWidth="1.4" strokeLinecap="round" />
    <path d="m2-89-1 6 4 1" stroke="#b67d59" strokeWidth="1.2" fill="none" />
    {person === 'yaser' && <g fill="none" stroke="#363c47" strokeWidth="2"><rect x="-13" y="-95" width="11" height="9" rx="3" /><rect x="3" y="-93" width="11" height="9" rx="3" /><path d="m-2-90 5 1" /></g>}
    {person === 'salma' && <><path d="m-10-64 26 31" stroke="#cf8246" strokeWidth="4" /><rect x="8" y="-44" width="15" height="17" rx="3" fill="#df9652" /></>}
    {person === 'karim' && <rect x="-8" y="-49" width="17" height="20" rx="2" fill="#d8bd80" />}
    {person === 'rana' && <rect x="-25" y="-46" width="10" height="17" rx="2" fill="#304967" />}
    {selected && !portrait && <><path d="m-6-137 6 7 6-7" fill="#f16e00" /><circle cy="-145" r="3" fill="#f16e00" /></>}
  </g>;
}
const Room = memo(function Room() {
  const id = useId().replaceAll(':', '');
  return <g><defs><linearGradient id={`${id}floor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f1e4c9" /><stop offset="1" stopColor="#d7c29f" /></linearGradient><linearGradient id={`${id}wall`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eadbbc" /><stop offset="1" stopColor="#d2bc97" /></linearGradient></defs>
    <ellipse cx="535" cy="587" rx="345" ry="62" fill="#47342c" opacity=".08" />
    <Box x={-7} y={-7} w={494} d={374} h={18} z={-18} color="#bea780" top={`url(#${id}floor)`} side="#ab9271" />
    <polygon points={`${point(0, 0)} ${point(0, 360)} ${point(0, 360, 160)} ${point(0, 0, 160)}`} fill={`url(#${id}wall)`} />
    <polygon points={`${point(0, 0)} ${point(480, 0)} ${point(480, 0, 160)} ${point(0, 0, 160)}`} fill="#ebddc2" />
    <polygon points={`${point(0, 0, 160)} ${point(0, 360, 160)} ${point(-9, 360, 160)} ${point(-9, -9, 160)}`} fill="#f8efd9" />
    <polygon points={`${point(0, 0, 160)} ${point(480, 0, 160)} ${point(480, -9, 160)} ${point(-9, -9, 160)}`} fill="#f8efd9" />
    {Array.from({ length: 11 }, (_, i) => <path key={`x${i}`} d={`M${point((i + 1) * 40, 0)} ${point((i + 1) * 40, 360)}`} stroke="#bca682" opacity=".3" strokeWidth=".7" />)}
    {Array.from({ length: 8 }, (_, i) => <path key={`y${i}`} d={`M${point(0, (i + 1) * 40)} ${point(480, (i + 1) * 40)}`} stroke="#bca682" opacity=".3" strokeWidth=".7" />)}
    <path d="M139 112Q490 197 861 214" fill="none" stroke="#b7a37e" strokeWidth="1.5" />
    {Array.from({ length: 15 }, (_, i) => { const x = 160 + i * 45; const y = 113 + (x - 139) * .16; return <path key={i} d={`M${x} ${y}l20 4-7 29Z`} fill={['#062759', '#f16e00', '#84915d', '#562474', '#e3c990'][i % 5]} />; })}
    <Plant x={12} y={310} large /><Plant x={450} y={24} />
    <Table x={25} y={170} w={113} d={48} /><Laptop x={49} y={181} />
    <Box x={101} y={178} w={15} d={23} h={2} z={48} color="#163d5d" top="#417a98" />
    <Table x={355} y={45} w={105} d={48} /><Laptop x={383} y={56} />
    <Table x={330} y={235} w={117} d={67} />
    <Box x={344} y={253} w={25} d={19} h={3} z={48} top="#a082b7" side="#6f5087" />
    <Box x={389} y={260} w={24} d={17} h={3} z={48} top="#fbf1d7" side="#d7b992" />
    {[[331, 310], [409, 310]].map(([x, y], i) => <Table key={i} x={x} y={y} w={25} d={23} />)}
    <Stall x={50} y={285} /><Stall x={181} y={285} second />
    {[[170, 20], [220, 20], [270, 20]].map(([x, y], i) => <g key={i}><polygon points={`${point(x, y, 40)} ${point(x + 40, y, 40)} ${point(x + 40, y, 92)} ${point(x, y, 92)}`} fill="#ac906a" /><polygon points={`${point(x + 4, y + 1, 44)} ${point(x + 36, y + 1, 44)} ${point(x + 36, y + 1, 88)} ${point(x + 4, y + 1, 88)}`} fill="#f7ecd4" /><polygon points={`${point(x + 8, y + 2, 49)} ${point(x + 32, y + 2, 49)} ${point(x + 32, y + 2, 73)} ${point(x + 8, y + 2, 73)}`} fill={['#819775', '#bb9b79', '#7b91a0'][i]} /></g>)}
    <Plant x={300} y={25} />
  </g>;
});
const coordinates: Record<PersonId, [number, number]> = { salma: [423, 231], karim: [105, 253], 'um-yousef': [155, 115], yaser: [432, 108], rana: [319, 245], omar: [224, 206] };
const destinations: Partial<Record<GameState['stage'], Partial<Record<PersonId, [number, number]>>>> = {
  consent: { karim: [145, 237], omar: [245, 203], salma: [400, 231] },
  photos: { 'um-yousef': [194, 143], karim: [123, 253], rana: [308, 237] },
  network: { yaser: [367, 140], salma: [403, 218], omar: [240, 216] },
  cloud: { omar: [277, 167], yaser: [367, 108], 'um-yousef': [177, 124] },
  community: { rana: [290, 212], yaser: [355, 171], salma: [393, 230] },
  ending: { karim: [150, 252], 'um-yousef': [205, 171], yaser: [370, 156], rana: [310, 237], omar: [261, 218], salma: [405, 238] },
};
export const GameWorld = memo(function GameWorld({ state, locale, selected, onPerson, calm = false, paused = false }: { state: GameState; locale: Locale; selected: PersonId; onPerson: (id: PersonId) => void; calm?: boolean; paused?: boolean }) {
  const risks = concerns(state).length;
  const day = state.stage === 'intro' || state.stage === 'ending';
  const light = day ? 'day' : ['consent', 'photos'].includes(state.stage) ? 'dusk' : 'night';
  const server = position(295, 35);
  const id = useId().replaceAll(':', '');
  return <svg className={styles.world} data-world data-light={light} data-calm={calm || paused} viewBox="60 25 940 680" role="group" aria-label={locale === 'ar' ? 'مركز حكايات وسوق. اضغط الشخصية لتفتح مهمتها.' : 'Stories and Market center. Tap a character to open their task.'}>
    <defs><radialGradient id={`${id}halo`}><stop stopColor="#f7e8c5" stopOpacity=".6" /><stop offset="1" stopColor="#d4c5b0" stopOpacity="0" /></radialGradient><linearGradient id={`${id}night`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#40588d" /><stop offset="1" stopColor="#1d234f" /></linearGradient><clipPath id={`${id}room-light`}><polygon points="460,70 940,310 940,470 580,650 100,410 100,250" /></clipPath></defs>
    <ellipse cx="525" cy="400" rx="470" ry="330" fill={`url(#${id}halo)`} />
    <Room />
    <g data-server transform={`translate(${server.x} ${server.y})`}><ellipse cy="4" rx="48" ry="16" fill="#291e44" opacity=".18" /><path d="M-32-129 0-145 38-125 6-108Z" fill="#9663b9" /><path d="M-32-129 6-108 6 0-32-20Z" fill="#68378d" /><path d="M6-108 38-125 38-15 6 0Z" fill="#462666" />{[0, 1, 2, 3].map(n => <g key={n}><path d={`M-25 ${-112 + n * 24}l23 12v13l-23-12Z`} fill="#512b72" /><path d={`M-21 ${-106 + n * 24}l10 5`} stroke="#ad7fc6" strokeWidth="2" /><circle cx="-6" cy={-94 + n * 24} r="2" fill={state.stage === 'cloud' && !state.answers.restored ? '#e8a45c' : '#b4dbb5'} className={styles.serverLight} /></g>)}</g>
    <g transform={`translate(${position(372, 259).x} ${position(372, 259).y - 49})`}><path d="m-7-6 14 7-7 5-14-7Z" fill={state.answers.backup === 'prepared' ? '#8fb8a2' : '#bba9c2'} /><path d="m-14-1 14 7v5l-14-7Z" fill="#728691" /><circle cx="-9" cy="0" r="1.4" fill={state.answers.restored ? '#f5e5aa' : '#62577d'} /></g>
    {people.map(person => { const p = position(...(destinations[state.stage]?.[person.id] || coordinates[person.id])); const active = person.id === sceneCopy[state.stage].speaker; return <g key={person.id} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} data-person={person.id} data-active={active} role="button" tabIndex={0} aria-label={`${person[locale]} / ${person.role[locale]}`} aria-pressed={person.id === selected} onClick={() => onPerson(person.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPerson(person.id); } }} className={styles.personTarget}><title>{person[locale]} / {person.role[locale]}</title><rect x="-26" y="-123" width="52" height="137" rx="15" fill="transparent" /><ellipse className={styles.activeRing} cy="3" rx="35" ry="12" fill="none" stroke="#e89536" strokeWidth="3" opacity={active ? 1 : 0} /><Character person={person.id} selected={active} mood={state.stage === 'ending' && risks === 0 ? 'happy' : risks > 3 ? 'concerned' : 'neutral'} />{active && <g className={styles.personBubble} transform="translate(0 -169)" aria-hidden="true"><rect x="-47" y="-18" width="94" height="30" rx="15" fill="#fff9ed" stroke="#d4a35c" /><text textAnchor="middle" y="2" fontSize="13" fill="#173e59">{person[locale]} ↗</text></g>}</g>; })}
    {light !== 'day' && <rect x="60" y="25" width="940" height="680" clipPath={`url(#${id}room-light)`} fill={`url(#${id}night)`} opacity={light === 'night' ? '.27' : '.12'} pointerEvents="none" className={styles.nightTint} />}
    {risks > 0 && <g className={styles.shadow} transform={`translate(${120 + Math.min(risks, 6) * 22} ${398 + Math.min(risks, 6) * 13}) scale(${.7 + risks * .055})`} opacity={Math.min(.18 + risks * .07, .7)} aria-hidden="true"><path d="M-43 81Q-28 1-27-25-21-65 5-68 41-63 36-20L65 88Q20 111-43 81" fill="#251d3c" /><ellipse cx="-2" cy="-29" rx="4" ry="2" fill="#dfaa73" /><ellipse cx="18" cy="-30" rx="4" ry="2" fill="#dfaa73" /></g>}
    {state.answers.restored && <g transform="translate(695 248)" className={styles.recovered} aria-hidden="true"><circle r="15" fill="#eef0d9" /><path d="m-7 0 5 5 10-11" fill="none" stroke="#547c65" strokeWidth="3" strokeLinecap="round" /></g>}
  </svg>;
});
