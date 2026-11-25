import { useId, type ReactNode } from 'react';
import type { ArtKind } from '../data/types';
import { luminance, shade } from '../lib/util';

// Studio "on the hanger" garment renderings. Each garment is drawn from parametric SVG paths,
// shaded with a fabric-noise filter and a directional sheen, so every product has a consistent,
// recolourable image. A real photograph (product.imageUrl) replaces it when supplied.

const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${300 - Number(x)},${y}`);
const P = ({ d, f, s, w = 1.2, o, dash }: { d: string; f?: string; s?: string; w?: number; o?: number; dash?: string }) => (
  <path d={d} fill={f ?? 'none'} stroke={s ?? 'none'} strokeWidth={s ? w : undefined} opacity={o} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
);
const Pair = (props: { d: string; f?: string; s?: string; w?: number; o?: number; dash?: string }) => (<><P {...props} /><P {...props} d={mirror(props.d)} /></>);

interface Pal { c: string; dk: string; dk2: string; lt: string; a: string; adk: string }
const pal = (c: string, a = '#f3f1ea'): Pal => ({ c, dk: shade(c, -0.22), dk2: shade(c, -0.42), lt: shade(c, 0.18), a, adk: shade(a, -0.18) });
const lapel = (p: Pal) => (luminance(p.c) < 0.22 ? shade(p.c, 0.14) : p.dk);
const stitch = (p: Pal) => (luminance(p.c) < 0.25 ? shade(p.c, 0.25) : p.dk);

function Blazer({ p, fem, inner, tie, buttons }: { p: Pal; fem?: boolean; inner?: string; tie?: string; buttons?: number }) {
  const shirt = inner ?? '#f3f1ea';
  if (fem) return (
    <g>
      <Pair d="M110,72 L94,88 C88,130 84,190 82,256 L100,258 C104,200 108,160 112,130 Z" f={p.c} />
      <Pair d="M82,246 L100,248" s={stitch(p)} w={1} o={0.7} />
      <P d="M110,72 L132,64 L150,108 L168,64 L190,72 L206,88 L198,160 Q194,178 198,190 L206,282 C180,292 120,292 94,282 L102,190 Q106,178 102,160 L94,88 Z" f={p.c} />
      <P d="M132,64 L150,108 L168,64 L160,62 L150,80 L140,62 Z" f={shirt} />
      <Pair d="M132,64 L150,168 L143,168 L124,108 L133,101 L121,80 Z" f={lapel(p)} s={p.dk2} w={0.8} />
      <P d="M150,182 C147,226 141,258 132,288" s={p.dk2} w={1.4} />
      <P d="M150,182 C153,226 159,258 168,288" s={p.dk2} w={1.4} />
      <circle cx="150" cy="180" r="3.4" fill={p.dk2} />
      <Pair d="M108,232 L136,230" s={p.dk2} w={2} o={0.8} />
      <Pair d="M118,120 Q122,170 120,276" s={p.dk} w={1} o={0.45} />
    </g>
  );
  return (
    <g>
      <Pair d="M104,72 L84,86 C78,120 72,180 68,262 L90,266 C94,210 98,160 104,128 Z" f={p.c} />
      <Pair d="M69,250 L91,254" s={stitch(p)} w={1} o={0.7} />
      <P d="M104,72 L130,64 L150,104 L170,64 L196,72 L214,88 L208,180 L212,300 C180,310 120,310 88,300 L92,180 L86,88 Z" f={p.c} />
      <P d="M130,64 L150,104 L170,64 L162,62 L150,76 L138,62 Z" f={shirt} />
      <Pair d="M138,62 L150,76 L145,84 L134,68 Z" f={shade(shirt, -0.08)} />
      {tie && <P d="M146,80 L154,80 L157,88 L154,142 L150,148 L146,142 L143,88 Z" f={tie} />}
      <Pair d="M130,64 L150,152 L141,152 L121,100 L131,94 L119,76 Z" f={lapel(p)} s={p.dk2} w={0.8} />
      <P d="M150,232 C146,262 140,290 132,306" s={p.dk2} w={1.4} />
      <P d="M150,232 C154,262 160,290 168,306" s={p.dk2} w={1.4} />
      <P d="M150,152 L150,232" s={p.dk2} w={1} o={0.6} />
      {Array.from({ length: buttons ?? 2 }).map((_, i) => <circle key={i} cx="150" cy={196 + i * 30} r="3.2" fill={p.dk2} />)}
      <Pair d="M100,240 L140,238 L140,246 L100,248 Z" f={p.dk} />
      <P d="M168,130 L192,128 L192,133 L168,135 Z" f={p.dk} />
      <Pair d="M118,150 Q121,220 120,292" s={p.dk} w={1} o={0.4} />
    </g>
  );
}

function Shirt({ p, fem }: { p: Pal; fem?: boolean }) {
  const k = fem ? 4 : 0;
  return (
    <g>
      <Pair d={`M${108 + k},72 L${88 + k * 2},88 C${82 + k * 2},140 ${78 + k * 2},200 ${76 + k * 2},252 L${96 + k * 2},256 C${98 + k * 2},200 ${102 + k},150 ${108 + k},120 Z`} f={p.c} />
      <Pair d={`M${76 + k * 2},238 L${96 + k * 2},242 L${96 + k * 2},256 L${76 + k * 2},252 Z`} f={p.dk} o={0.55} />
      <P d={fem ? 'M112,72 L136,62 L150,70 L164,62 L188,72 L206,88 L198,170 Q196,184 200,196 L204,292 C180,300 120,300 96,292 L100,196 Q104,184 102,170 L94,88 Z' : 'M108,72 L134,62 L150,70 L166,62 L192,72 L212,88 L206,180 L208,304 C180,312 120,312 92,304 L94,180 L88,88 Z'} f={p.c} />
      <Pair d="M134,62 L150,70 L150,88 L128,76 Z" f={p.lt} s={p.dk} w={0.8} />
      <P d="M150,88 L150,300" s={p.dk} w={1} o={0.7} />
      {[108, 140, 172, 204, 236, 268].map((y) => <circle key={y} cx="150" cy={y} r="2" fill={p.dk2} opacity={0.75} />)}
      {!fem && <P d="M164,122 h22 v22 h-22 z" s={p.dk} w={0.9} o={0.6} />}
      <Pair d="M120,130 Q122,200 120,296" s={p.dk} w={0.8} o={0.3} />
    </g>
  );
}

function Trousers({ p, fem, top = 94, clips = true }: { p: Pal; fem?: boolean; top?: number; clips?: boolean }) {
  const legs = fem
    ? `M106,${top} L194,${top} L212,372 L158,374 L150,${top + 76} L142,374 L88,372 Z`
    : `M104,${top} L196,${top} L202,370 L160,372 L150,${top + 56} L140,372 L98,370 Z`;
  return (
    <g>
      <P d={legs} f={p.c} />
      <P d={`M104,${top - 12} L196,${top - 12} L196,${top} L104,${top} Z`} f={p.dk} />
      <P d={`M150,${top} C150,${top + 30} 146,${top + 44} 142,${top + 48}`} s={p.dk2} w={1} />
      <Pair d={fem ? `M124,${top + 16} L116,368` : `M122,${top + 16} L119,366`} s={p.dk} w={1} o={0.55} />
      {[118, 140, 160, 182].map((x) => <rect key={x} x={x} y={top - 13} width="3" height="14" fill={p.dk2} opacity={0.6} />)}
      {clips && <><rect x="106" y={top - 22} width="10" height="14" rx="2" fill="#b9bcbf" /><rect x="184" y={top - 22} width="10" height="14" rx="2" fill="#b9bcbf" /></>}
    </g>
  );
}

const TrouserPeek = ({ p, fem, y = 290 }: { p: Pal; fem?: boolean; y?: number }) => (
  <g>
    <P d={fem ? `M100,${y} L200,${y} L214,390 L158,390 L150,${y + 30} L142,390 L86,390 Z` : `M98,${y} L202,${y} L206,390 L158,390 L150,${y + 30} L142,390 L94,390 Z`} f={p.c} />
    <Pair d={`M122,${y + 10} L118,388`} s={p.dk} w={1} o={0.5} />
  </g>
);

function Kurta({ p, length = 336, embroidery, sleeve = 262, collarColor }: { p: Pal; length?: number; embroidery?: string; sleeve?: number; collarColor?: string }) {
  return (
    <g>
      <Pair d={`M106,72 L86,88 C80,140 76,200 72,${sleeve} L92,${sleeve + 4} C96,206 100,156 106,124 Z`} f={p.c} />
      <P d={`M106,72 L134,64 Q150,72 166,64 L194,72 L214,88 L206,170 L214,${length} C180,${length + 6} 120,${length + 6} 86,${length} L94,170 L86,88 Z`} f={p.c} />
      <P d="M134,64 Q150,72 166,64 L166,57 Q150,65 134,57 Z" f={collarColor ?? p.dk} />
      <P d="M146,70 L154,70 L154,152 L146,152 Z" f={p.dk} o={0.6} />
      {[86, 104, 122, 140].map((y) => <circle key={y} cx="150" cy={y} r="2" fill={embroidery ?? p.dk2} />)}
      <Pair d={`M94,${length - 46} L90,${length}`} s={p.dk2} w={1.2} />
      <Pair d={`M118,150 Q121,240 118,${length - 4}`} s={p.dk} w={0.9} o={0.35} />
      {embroidery && <>
        <P d={`M90,${length - 12} C120,${length - 6} 180,${length - 6} 210,${length - 12}`} s={embroidery} w={3} dash="1 5" />
        <P d={`M90,${length - 20} C120,${length - 14} 180,${length - 14} 210,${length - 20}`} s={embroidery} w={1} o={0.8} />
        <P d="M142,70 L142,156 M158,70 L158,156" s={embroidery} w={1.2} o={0.9} />
        <P d="M120,96 Q150,124 180,96" s={embroidery} w={2.2} dash="1 6" />
      </>}
    </g>
  );
}

function Churidar({ p, y = 336 }: { p: Pal; y?: number }) {
  return (
    <g>
      <P d={`M106,${y} L194,${y} L188,392 L158,392 L150,${y + 14} L142,392 L112,392 Z`} f={p.a} />
      {[372, 378, 384].map((yy) => <Pair key={yy} d={`M114,${yy} L140,${yy + 2}`} s={p.adk} w={0.8} o={0.7} />)}
    </g>
  );
}

function Jacket({ p, full, trim }: { p: Pal; full?: boolean; trim: string }) {
  return (
    <g>
      {full && <Pair d="M108,72 L88,88 C82,140 78,200 74,262 L94,266 C98,206 102,156 108,124 Z" f={p.c} />}
      <P d={full ? 'M108,72 L134,64 Q150,70 166,64 L192,72 L212,88 L206,180 L210,292 C180,300 120,300 90,292 L94,180 L88,88 Z' : 'M118,72 L136,64 Q150,70 164,64 L182,72 L198,90 C194,120 192,150 200,170 L202,262 C180,270 120,270 98,262 L100,170 C108,150 106,120 102,90 Z'} f={p.c} />
      <P d="M136,64 Q150,70 164,64 L164,56 Q150,63 136,56 Z" f={p.dk} />
      <P d={`M150,70 L150,${full ? 294 : 266}`} s={p.dk2} w={1.2} />
      {[88, 112, 136, 160, 184, ...(full ? [208, 232] : [])].map((y) => <circle key={y} cx="150" cy={y} r="2.8" fill={trim} />)}
      <Pair d={`M112,${full ? 236 : 210} L136,${full ? 234 : 208}`} s={p.dk2} w={2} />
      <P d="M164,124 L184,122" s={p.dk2} w={2} />
      <Pair d={`M122,110 Q126,180 124,${full ? 290 : 262}`} s={p.dk} w={0.9} o={0.4} />
    </g>
  );
}

function Saree({ p }: { p: Pal }) {
  return (
    <g>
      <P d="M86,78 L214,78 C222,160 226,260 232,372 C200,380 170,370 150,378 C130,370 100,380 68,372 C74,260 78,160 86,78 Z" f={p.c} />
      {[108, 128, 172, 196].map((x, i) => <P key={x} d={`M${x},86 C${x + (i % 2 ? 6 : -6)},180 ${x + (i % 2 ? -4 : 4)},280 ${x + (i % 2 ? 8 : -8)},370`} s={p.dk} w={1.4} o={0.5} />)}
      <P d="M70,354 C100,362 130,352 150,360 C170,352 200,362 230,354" s={p.a} w={9} />
      <P d="M70,343 C100,351 130,341 150,349 C170,341 200,351 230,343" s={p.a} w={1.2} o={0.8} />
      <P d="M84,78 L178,78 C180,150 186,210 192,262 L80,250 C82,190 84,130 84,78 Z" f={p.dk} o={0.9} />
      {Array.from({ length: 5 }).flatMap((_, r) => Array.from({ length: 4 }).map((__, c) => <circle key={`${r}${c}`} cx={98 + c * 24 + (r % 2) * 12} cy={104 + r * 28} r="2.6" fill={p.a} opacity={0.85} />))}
      <P d="M81,240 L191,252" s={p.a} w={8} />
      <P d="M81,230 L190,242" s={p.a} w={1} o={0.8} />
    </g>
  );
}

function Anarkali({ p }: { p: Pal }) {
  return (
    <g>
      <Pair d="M116,72 L102,86 C96,120 92,160 90,200 L108,202 C110,170 112,140 116,118 Z" f={p.c} />
      <P d="M112,148 L188,148 C212,220 234,300 250,378 C200,392 100,392 50,378 C66,300 88,220 112,148 Z" f={p.c} />
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => <P key={k} d={`M${150 + k * 8},152 L${150 + k * 23},382`} s={p.dk} w={1} o={0.35} />)}
      <P d="M116,72 L136,64 Q150,80 164,64 L184,72 L198,86 L190,150 L110,150 L102,86 Z" f={p.c} />
      <P d="M128,70 Q150,104 172,70" s={p.a} w={3} dash="1 5" />
      <P d="M116,118 Q150,132 184,118" s={p.a} w={1.5} o={0.9} />
      <P d="M110,146 L190,146 L190,154 L110,154 Z" f={p.a} />
      <P d="M52,368 C100,382 200,382 248,368" s={p.a} w={8} />
      <P d="M56,356 C100,368 200,368 244,356" s={p.a} w={1.2} o={0.8} />
      <P d="M184,70 C200,140 212,240 224,334 L240,330 C228,240 214,140 196,66 Z" f={p.a} o={0.35} />
    </g>
  );
}

function Lehenga({ p }: { p: Pal }) {
  return (
    <g>
      <P d="M110,156 L190,156 C222,230 246,310 260,384 C200,396 100,396 40,384 C54,310 78,230 110,156 Z" f={p.c} />
      {[-5, -3, -1, 1, 3, 5].map((k) => <P key={k} d={`M${150 + k * 6},160 L${150 + k * 22},388`} s={p.dk} w={1.1} o={0.4} />)}
      <P d="M44,372 C100,386 200,386 256,372" s={p.a} w={12} />
      <P d="M48,352 C100,364 200,364 252,352" s={p.a} w={2} />
      {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={66 + i * 21} cy={340 - Math.abs(i - 4) * 1.5} r="3" fill={p.a} />)}
      <P d="M110,146 L190,146 L190,158 L110,158 Z" f={p.a} />
      <Pair d="M120,74 L108,88 L100,118 L114,122 L120,100 Z" f={p.dk} />
      <P d="M120,74 L138,66 Q150,80 162,66 L180,74 L192,88 L186,128 L114,128 L108,88 Z" f={p.dk} />
      <P d="M130,72 Q150,98 170,72" s={p.a} w={2.5} dash="1 4" />
      <P d="M120,74 C150,160 200,240 252,300 L264,286 C214,232 168,150 140,66 Z" f={p.lt} o={0.45} />
      <P d="M140,66 C168,150 214,232 264,286" s={p.a} w={1.5} dash="2 4" />
    </g>
  );
}

function Dress({ p }: { p: Pal }) {
  return (
    <g>
      <Pair d="M118,72 L106,86 C98,110 94,130 92,150 L110,154 C112,130 114,110 118,96 Z" f={p.c} />
      <P d="M114,154 L186,154 C202,220 214,290 222,350 C180,360 120,360 78,350 C86,290 98,220 114,154 Z" f={p.c} />
      {[-2, -1, 0, 1, 2].map((k) => <P key={k} d={`M${150 + k * 12},160 L${150 + k * 26},352`} s={p.dk} w={1} o={0.35} />)}
      <P d="M118,72 L138,66 L150,100 L162,66 L182,72 L194,86 L186,156 L114,156 L106,86 Z" f={p.c} />
      <P d="M138,66 L150,100 L162,66" s={p.a} w={2.5} />
      <P d="M114,150 L186,150 L186,160 L114,160 Z" f={p.a} />
      <P d="M176,160 L170,204 M182,160 L190,200" s={p.a} w={2.5} />
      <P d="M80,342 C120,352 180,352 220,342" s={p.a} w={4} />
    </g>
  );
}

function KurtaW({ p }: { p: Pal }) {
  return (
    <g>
      <P d="M100,320 L200,320 L214,390 L156,390 L150,340 L144,390 L86,390 Z" f={p.a} />
      <Pair d="M112,72 L96,88 C90,130 86,170 84,210 L102,212 C104,176 108,140 112,116 Z" f={p.c} />
      <P d="M112,72 L136,64 Q150,78 164,64 L188,72 L204,88 L198,170 L206,320 C180,326 120,326 94,320 L102,170 L96,88 Z" f={p.c} />
      {Array.from({ length: 7 }).flatMap((_, r) => Array.from({ length: 5 }).map((__, c) => <circle key={`${r}${c}`} cx={110 + c * 20 + (r % 2) * 10} cy={140 + r * 24} r="2.2" fill={p.dk2} opacity={0.5} />))}
      <P d="M134,66 Q150,96 166,66" s={p.a} w={3} />
      <Pair d="M102,280 L98,320" s={p.dk2} w={1.2} />
      <P d="M98,312 C130,318 170,318 202,312" s={p.a} w={3} dash="2 4" />
      <P d="M110,70 C100,150 96,230 94,300 L110,302 C112,230 118,150 128,66 Z" f={p.a} o={0.55} />
    </g>
  );
}

function OccasionSet({ p }: { p: Pal }) {
  return (
    <g>
      <P d="M100,262 L200,262 L204,296 C214,336 226,366 236,390 L160,390 L150,306 L140,390 L64,390 C74,366 86,336 96,296 Z" f={p.dk} />
      <Pair d="M80,330 C100,334 124,334 144,332" s={p.a} w={3} />
      <Pair d="M112,72 L96,88 C90,130 86,190 84,250 L102,252 C106,190 108,140 112,116 Z" f={p.c} />
      <P d="M112,72 L136,64 Q150,78 164,64 L188,72 L204,88 L198,170 L204,272 C180,280 120,280 96,272 L102,170 L96,88 Z" f={p.c} />
      <P d="M126,68 Q150,118 174,68" s={p.a} w={3} />
      <P d="M120,78 Q150,140 180,78" s={p.a} w={2} dash="1 5" />
      <P d="M98,262 C130,270 170,270 202,262" s={p.a} w={4} />
      <Pair d="M84,240 L102,242" s={p.a} w={3} />
      <P d="M186,70 C202,150 214,250 226,340 L242,336 C230,250 216,150 198,66 Z" f={p.a} o={0.3} />
    </g>
  );
}

function Coord({ p }: { p: Pal }) {
  return (
    <g>
      <P d="M104,236 L196,236 L204,390 L158,390 L150,280 L142,390 L96,390 Z" f={p.c} />
      <Pair d="M122,250 L118,388" s={p.dk} w={1} o={0.5} />
      <Pair d="M112,72 L96,88 C90,130 86,170 84,210 L102,212 C104,176 108,140 112,116 Z" f={p.c} />
      <P d="M112,72 L136,64 L150,96 L164,64 L188,72 L204,88 L198,170 L204,244 C180,250 120,250 96,244 L102,170 L96,88 Z" f={p.c} />
      <P d="M136,64 L150,96 L164,64 L156,62 L150,74 L144,62 Z" f={p.a} />
      <P d="M150,96 L176,246" s={p.dk2} w={1.3} />
      <P d="M100,168 L200,168 L200,176 L100,176 Z" f={p.dk} />
      <P d="M170,176 L164,214 M176,176 L184,210" s={p.dk} w={2.4} />
    </g>
  );
}

function Hanger({ wood = '#b08a5a' }: { wood?: string }) {
  return (
    <g>
      <P d="M150,50 L150,34 C150,22 163,20 165,28 C167,35 160,38 156,35" s="#a8a29a" w={3} />
      <P d="M150,48 L82,76 Q78,80 85,81 L215,81 Q222,80 218,76 Z" f={wood} />
      <P d="M150,48 L82,76" s={shade(wood, 0.2)} w={1} o={0.7} />
    </g>
  );
}

function Garment({ kind, p }: { kind: ArtKind; p: Pal }) {
  const neutral = pal('#2b2d30');
  switch (kind) {
    case 'blazer': return <Blazer p={p} inner={p.a} />;
    case 'blazer-w': return <Blazer p={p} fem inner={p.a} />;
    case 'shirt': return <Shirt p={p} />;
    case 'shirt-w': return <Shirt p={p} fem />;
    case 'trousers': return <Trousers p={p} />;
    case 'trousers-w': return <Trousers p={p} fem />;
    case 'suit': return <><TrouserPeek p={p} /><Blazer p={p} inner={p.a} tie={shade(p.c, -0.5)} /></>;
    case 'pantsuit': return <><TrouserPeek p={p} fem y={276} /><Blazer p={p} fem inner={p.a} /></>;
    case 'interview-set': return <><TrouserPeek p={pal('#3a3d40')} /><Blazer p={p} inner={p.a} tie="#6b2737" /></>;
    case 'corporate-set': return <><TrouserPeek p={neutral} fem y={276} /><Blazer p={p} fem inner={p.a} /></>;
    case 'kurta': return <><Churidar p={p} /><Kurta p={p} /></>;
    case 'kurta-embroidered': return <><Churidar p={p} /><Kurta p={p} embroidery={p.a === '#e8e1cf' ? shade(p.c, -0.35) : p.a} /></>;
    case 'sherwani': return <><Churidar p={pal(p.c, shade(p.c, 0.05))} y={352} /><Kurta p={p} length={352} embroidery={p.a} collarColor={p.a} /></>;
    case 'nehru': return <><Churidar p={pal(p.a, p.a)} /><Kurta p={pal(p.a)} /><Jacket p={p} trim="#c7a764" /></>;
    case 'ethnic-set-m': return <><Churidar p={p} /><Kurta p={p} /><Jacket p={pal(p.a)} trim="#d1ad62" /></>;
    case 'bandhgala': return <><TrouserPeek p={p} /><Jacket p={p} full trim={p.a} /></>;
    case 'saree': return <Saree p={p} />;
    case 'anarkali': return <Anarkali p={p} />;
    case 'kurta-w': return <KurtaW p={p} />;
    case 'dress': return <Dress p={p} />;
    case 'lehenga': return <Lehenga p={p} />;
    case 'occasion-set-w': return <OccasionSet p={p} />;
    case 'coord-w': return <Coord p={p} />;
  }
}

const BACKDROPS = ['#E7E2D6', '#DCE4D7', '#E6DAD0', '#E2E0E6', '#E9E5DA'];
export function backdropFor(hex: string, seed: string): string {
  const i = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0) % BACKDROPS.length;
  const b = BACKDROPS[i];
  return luminance(hex) > 0.82 ? shade(b, -0.08) : b;
}

export interface ArtProps { kind: ArtKind; color: string; accent?: string; seed?: string; view?: 'front' | 'detail' | 'swatch'; backdrop?: string | false; className?: string; title?: string; children?: ReactNode }

export function GarmentArt({ kind, color, accent, seed = kind, view = 'front', backdrop, className, title }: ArtProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (s: string) => `${s}${raw}`;
  const p = pal(color, accent);
  const bg = backdrop === false ? 'transparent' : backdrop ?? backdropFor(color, seed);
  const vb = view === 'detail' ? '86 40 128 160' : '0 0 300 400';
  if (view === 'swatch') {
    return (
      <svg viewBox="0 0 300 400" className={className} role="img" aria-label={title ?? 'Fabric swatch'} preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={id('w')}><feTurbulence type="fractalNoise" baseFrequency="1.4 0.25" numOctaves="2" seed="7" /><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
          <linearGradient id={id('sw')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.18" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.22" /></linearGradient>
        </defs>
        <rect width="300" height="400" fill={bg} />
        <g transform="rotate(-8 150 200)">
          <rect x="40" y="60" width="220" height="280" rx="4" fill={p.c} />
          <rect x="40" y="60" width="220" height="280" rx="4" fill={p.c} filter={`url(#${id('w')})`} />
          {accent && <rect x="40" y="300" width="220" height="16" fill={p.a} opacity="0.9" />}
          <rect x="40" y="60" width="220" height="280" rx="4" fill={`url(#${id('sw')})`} />
          <path d="M40,340 L260,340" stroke={p.dk2} strokeWidth="2" strokeDasharray="3 4" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox={vb} className={className} role="img" aria-label={title ?? 'Garment'} preserveAspectRatio={backdrop === false ? 'xMidYMin meet' : 'xMidYMid meet'}>
      <defs>
        <radialGradient id={id('bg')} cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor={shade(bg === 'transparent' ? '#ffffff' : bg, 0.25)} /><stop offset="1" stopColor={bg} /></radialGradient>
        <filter id={id('t')} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" result="na" />
          <feComposite in="na" in2="SourceGraphic" operator="in" result="tex" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="tex" /></feMerge>
        </filter>
        <filter id={id('s')} x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#1b241f" floodOpacity="0.22" /></filter>
        <filter id={id('wh')}><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" /></filter>
        <linearGradient id={id('sh')} x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stopColor="#fff" stopOpacity="0.2" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /><stop offset="0.75" stopColor="#000" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0.22" /></linearGradient>
        <mask id={id('m')}><use href={`#${id('g')}`} filter={`url(#${id('wh')})`} /></mask>
      </defs>
      {bg !== 'transparent' && <rect x="0" y="0" width="300" height="400" fill={`url(#${id('bg')})`} />}
      {bg !== 'transparent' && <ellipse cx="150" cy="394" rx="96" ry="6" fill="#1b241f" opacity="0.08" />}
      <Hanger />
      <g filter={`url(#${id('s')})`}>
        <g id={id('g')} filter={`url(#${id('t')})`}><Garment kind={kind} p={p} /></g>
      </g>
      <rect x="0" y="0" width="300" height="400" fill={`url(#${id('sh')})`} mask={`url(#${id('m')})`} />
    </svg>
  );
}
