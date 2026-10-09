#!/usr/bin/env node
/**
 * Contrast and colour-blind-safety gate for tokens.css.
 *
 * Computes, for Light and Dark, from the token file itself:
 *   1. WCAG 1.4.3  text on its background           >= 4.5:1
 *   2. WCAG 1.4.11 control / focus / status strokes  >= 3:1   (and chart series on the surface)
 *   3. Chart series separation under normal vision, deuteranopia, protanopia and
 *      tritanopia (CIEDE2000)                        >= 6
 *   4. The resting border of fields, checkboxes, radios and switches uses
 *      `--color-stroke-control` (never the decorative `--color-stroke-default`)
 *
 * Exempt by WCAG: disabled text and decorative dividers, so they are not listed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const components = fs.readFileSync(path.join(root, 'src/styles/components.css'), 'utf8');
const lines = css.split('\n');
const iLight = lines.findIndex((l) => l.startsWith(":root[data-theme='light']"));
const iDark = lines.findIndex((l) => l.startsWith(":root[data-theme='dark']"));
const iEnd = lines.findIndex((l, i) => i > iDark && l.startsWith(':root'));
const slice = (a, b) => lines.slice(a, b).join('\n');

const prim = {};
for (const m of css.matchAll(/(--primitive-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) prim[m[1]] = m[2];
const parse = (txt) => Object.fromEntries([...txt.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const modes = { Light: parse(slice(iLight, iDark)), Dark: parse(slice(iDark, iEnd === -1 ? lines.length : iEnd)) };
function resolve(v, map, depth = 0) {
  if (depth > 6 || !v) return null;
  if (v.startsWith('#')) return v.length === 7 ? v : null;
  const m = v.match(/var\((--[\w-]+)\)/);
  if (!m) return null;
  return prim[m[1]] ?? (map[m[1]] ? resolve(map[m[1]], map, depth + 1) : null);
}
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const TEXT_ON_PAGE = ['primary', 'secondary', 'tertiary', 'brand', 'link', 'positive', 'warning', 'negative', 'ai', 'sourced', 'editable'];
const TEXT_PAIRS = [
  ...TEXT_ON_PAGE.flatMap((t) => [[`text-${t}`, 'bg-page'], [`text-${t}`, 'bg-surface']]),
  ['text-on-brand', 'bg-brand'], ['text-on-brand', 'bg-brand-hover'], ['text-on-brand', 'bg-brand-pressed'],
  ['text-on-positive', 'bg-positive'], ['text-on-negative', 'bg-negative'], ['text-on-warning', 'bg-warning'], ['text-on-ai', 'bg-ai'],
  ['text-brand', 'bg-brand-subtle'], ['text-positive', 'bg-positive-subtle'], ['text-negative', 'bg-negative-subtle'], ['text-warning', 'bg-warning-subtle'],
  ['text-primary', 'bg-subtle'], ['text-tertiary', 'bg-subtle'],
  ['text-on-brand', 'bg-on-brand'], ['text-on-brand-muted', 'bg-on-brand'], ['text-on-brand-inactive', 'bg-on-brand'], ['text-on-brand-subtle', 'bg-on-brand'],
];
const STROKES = ['control', 'focus', 'brand', 'positive', 'warning', 'negative', 'ai'];

const lin=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const rgb=h=>[1,3,5].map(i=>lin(parseInt(h.slice(i,i+2),16)/255));
const M={deut:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],prot:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],trit:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.3039]]};
const sim=(c,t)=>t?M[t].map(r=>Math.min(1,Math.max(0,r[0]*c[0]+r[1]*c[1]+r[2]*c[2]))):c;
const lab=c=>{const [r,g,b]=c;let x=(.4124*r+.3576*g+.1805*b)/.95047,y=.2126*r+.7152*g+.0722*b,z=(.0193*r+.1192*g+.9505*b)/1.08883;const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;return[116*f(y)-16,500*(f(x)-f(y)),200*(f(y)-f(z))]};
function de2000(l1,l2){const [L1,a1,b1]=l1,[L2,a2,b2]=l2,r=Math.PI/180;const C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cb=(C1+C2)/2,G=.5*(1-Math.sqrt(Cb**7/(Cb**7+25**7)));const ap1=(1+G)*a1,ap2=(1+G)*a2,Cp1=Math.hypot(ap1,b1),Cp2=Math.hypot(ap2,b2);const hp=(b,a)=>{const h=Math.atan2(b,a)/r;return h<0?h+360:h};const h1=hp(b1,ap1),h2=hp(b2,ap2);let dh=h2-h1;if(Cp1*Cp2===0)dh=0;else if(dh>180)dh-=360;else if(dh<-180)dh+=360;const dL=L2-L1,dC=Cp2-Cp1,dH=2*Math.sqrt(Cp1*Cp2)*Math.sin(dh*r/2);const Lb=(L1+L2)/2,Cpb=(Cp1+Cp2)/2;let hb=h1+h2;if(Cp1*Cp2===0)hb=h1+h2;else if(Math.abs(h1-h2)>180)hb=(h1+h2+(h1+h2<360?360:-360))/2;else hb=(h1+h2)/2;const T=1-.17*Math.cos((hb-30)*r)+.24*Math.cos(2*hb*r)+.32*Math.cos((3*hb+6)*r)-.2*Math.cos((4*hb-63)*r);const dt=30*Math.exp(-(((hb-275)/25)**2));const Rc=2*Math.sqrt(Cpb**7/(Cpb**7+25**7));const Sl=1+.015*(Lb-50)**2/Math.sqrt(20+(Lb-50)**2),Sc=1+.045*Cpb,Sh=1+.015*Cpb*T;const Rt=-Math.sin(2*dt*r)*Rc;return Math.sqrt((dL/Sl)**2+(dC/Sc)**2+(dH/Sh)**2+Rt*(dC/Sc)*(dH/Sh))}
const dE=(a,b,t)=>de2000(lab(sim(rgb(a),t)),lab(sim(rgb(b),t)));
function report(set,extra={}){let min=99,worst;const ks=Object.keys(set);for(const t of ['deut','prot','trit'])for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++){const d=dE(set[ks[i]],set[ks[j]],t);if(d<min){min=d;worst=[ks[i],ks[j],t]}}return{min,worst}}

const failures = [];
let checks = 0;
const need = (mode, label, value, min) => { checks++; if (value === null || value < min) failures.push(`${mode}: ${label} = ${value === null ? 'unresolved' : value.toFixed(2)} (need >= ${min})`); };

for (const [mode, map] of Object.entries(modes)) {
  const get = (n) => resolve(map[`--color-${n}`], map);
  for (const [t, b] of TEXT_PAIRS) {
    const tc = get(t), bc = get(b);
    if (!tc || !bc) { if (map[`--color-${t}`] && map[`--color-${b}`]) failures.push(`${mode}: cannot resolve ${t} / ${b}`); continue; }
    need(mode, `${t} on ${b}`, ratio(tc, bc), 4.5);
  }
  for (const s of STROKES) for (const bg of ['bg-page', 'bg-surface']) {
    const sc = get(`stroke-${s}`), bc = get(bg);
    if (sc && bc) need(mode, `stroke-${s} on ${bg}`, ratio(sc, bc), 3);
  }
  const surface = get('bg-surface');
  const series = [];
  for (let i = 1; i <= 8; i++) {
    const c = get(`chart-series-${i}`);
    if (!c) { failures.push(`${mode}: chart-series-${i} unresolved`); continue; }
    series.push(c);
    need(mode, `chart-series-${i} on bg-surface`, ratio(c, surface), 3);
  }
  const neg = get('chart-negative');
  const kinds = [undefined, 'deut', 'prot', 'trit'];
  for (let i = 0; i < series.length; i++) {
    if (neg) need(mode, `chart-series-${i + 1} vs chart-negative (normal vision)`, dE(series[i], neg), 6);
    for (let j = i + 1; j < series.length; j++) {
      const d = Math.min(...kinds.map((k) => dE(series[i], series[j], k)));
      need(mode, `chart-series-${i + 1} vs ${j + 1} (worst of normal/deut/prot/trit, deltaE2000)`, d, 6);
    }
  }
}

// 4. Resting borders of form controls.
for (const sel of ['.scalar-field', '.scalar-choice', '.scalar-switch']) {
  checks++;
  const block = components.match(new RegExp(`^${sel.replace('.', '\\.')} \\{[^}]*\\}`, 'm'));
  const border = block?.[0].match(/^\s*border:[^;]*;/m)?.[0] ?? '';
  if (!border.includes('--color-stroke-control')) failures.push(`${sel}: resting border must use --color-stroke-control, found "${border.trim() || 'none'}"`);
}

if (failures.length) {
  console.error(`✗ contrast/CVD gate failed (${failures.length} of ${checks} checks)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`✓ contrast + colour-blind gate clean — ${checks} checks across Light and Dark`);
