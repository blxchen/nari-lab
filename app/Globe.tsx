'use client';

import { useEffect, useRef } from 'react';
import type { Storm } from './data';

type Props = { storm: Storm; index: number; playing: boolean; layer: string };

export default function TyphoonGlobe({ storm, index, playing, layer }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef({ down: false, x: 0, rotation: 0 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let raf = 0;
    const particles = Array.from({ length: 310 }, (_, i) => ({
      a: (i / 310) * Math.PI * 15,
      r: 15 + (i % 52) * 2.35,
      s: .0032 + (i % 10) * .00062,
      o: .1 + (i % 9) * .035,
    }));

    const draw = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const box = canvas.getBoundingClientRect();
      if (canvas.width !== Math.round(box.width * dpr) || canvas.height !== Math.round(box.height * dpr)) {
        canvas.width = Math.round(box.width * dpr); canvas.height = Math.round(box.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = box.width, h = box.height;
      const cx = w * .51, cy = h * .47, r = Math.min(w, h) * .405;
      const rot = drag.current.rotation;
      ctx.clearRect(0, 0, w, h);

      const halo = ctx.createRadialGradient(cx, cy, r * .68, cx, cy, r * 1.22);
      halo.addColorStop(0, 'rgba(61,203,255,.025)'); halo.addColorStop(.76, 'rgba(51,181,255,.08)');
      halo.addColorStop(.83, 'rgba(65,199,255,.38)'); halo.addColorStop(.88, 'rgba(42,135,220,.04)'); halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2); ctx.fill();

      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const ocean = ctx.createRadialGradient(cx - r * .36, cy - r * .4, r * .05, cx, cy, r * 1.08);
      const oceanColors = layer === 'SST' ? ['#f27543','#174f74','#041421'] : layer === 'RAIN' ? ['#254f70','#063048','#00131f'] : ['#187caf','#064b75','#00131f'];
      ocean.addColorStop(0, oceanColors[0]); ocean.addColorStop(.5, oceanColors[1]); ocean.addColorStop(1, oceanColors[2]);
      ctx.fillStyle = ocean; ctx.fillRect(cx-r, cy-r, r*2, r*2);

      ctx.strokeStyle = 'rgba(136,214,238,.12)'; ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy + i*r*.22, r*Math.sqrt(Math.max(.05, 1-i*i*.038)), r*.075, 0, 0, Math.PI*2); ctx.stroke(); }
      for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.ellipse(cx + i*r*.18 + rot*.25, cy, r*.07, r, 0, 0, Math.PI*2); ctx.stroke(); }

      ctx.shadowColor = 'rgba(0,0,0,.48)'; ctx.shadowBlur = 11; ctx.shadowOffsetX = 4;
      ctx.fillStyle = layer === 'SST' ? '#335845' : '#236e58'; ctx.strokeStyle = 'rgba(147,220,171,.42)'; ctx.lineWidth = 1.1;
      const land = (pts: number[][]) => { ctx.beginPath(); pts.forEach((p,i)=> i?ctx.lineTo(cx+(p[0]+rot)*r,cy+p[1]*r):ctx.moveTo(cx+(p[0]+rot)*r,cy+p[1]*r)); ctx.closePath(); ctx.fill(); ctx.stroke(); };
      land([[-.85,-.77],[-.25,-.92],[.06,-.74],[.24,-.56],[.18,-.35],[-.06,-.25],[-.17,-.04],[-.35,.03],[-.43,.25],[-.67,.16],[-.72,-.18],[-.95,-.38]]);
      land([[.1,-.56],[.22,-.72],[.34,-.6],[.28,-.41],[.17,-.25],[.12,-.08],[.03,-.11],[.06,-.32]]);
      land([[.02,.02],[.09,.11],[.06,.28],[-.03,.23],[-.05,.08]]);
      land([[.18,.3],[.32,.4],[.31,.55],[.16,.48]]);
      ctx.shadowColor = 'transparent';

      const intensity = storm.track[Math.min(index, storm.track.length - 1)].wind / 170;
      const sx = cx + r*(.29 + rot*.35), sy = cy + r*.2;
      ctx.globalCompositeOperation = 'screen';
      particles.forEach((p, i) => {
        const t = p.a + frame * (playing ? p.s * (.55 + intensity) : 0);
        const rr = p.r * (.7 + intensity * .45) * (.85 + .16*Math.sin(i));
        const px = sx + Math.cos(t) * rr * 1.42;
        const py = sy + Math.sin(t) * rr * .72;
        const len = 13 + (i % 20) * intensity;
        const alpha = layer === 'RAIN' ? p.o * 1.4 : p.o;
        ctx.strokeStyle = layer === 'SST' ? `rgba(255,221,166,${alpha})` : `rgba(225,246,255,${alpha})`;
        ctx.lineWidth = i%8===0 ? 2.1 : 1;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px-Math.sin(t)*len,py+Math.cos(t)*len*.53); ctx.stroke();
      });
      const eye = ctx.createRadialGradient(sx, sy, 0, sx, sy, 27);
      eye.addColorStop(0,'rgba(0,8,14,.96)'); eye.addColorStop(.34,`${storm.color}55`); eye.addColorStop(.55,'rgba(255,255,255,.85)'); eye.addColorStop(1,'transparent');
      ctx.fillStyle=eye; ctx.beginPath(); ctx.arc(sx,sy,27,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      const tr = storm.track;
      ctx.strokeStyle = storm.color; ctx.globalAlpha=.8; ctx.lineWidth = 2; ctx.setLineDash([4,6]);
      ctx.beginPath(); tr.forEach((p,i)=>{ const px=cx+((p.lon-130)/32+rot)*r; const py=cy-((p.lat-20)/27)*r; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
      tr.slice(0,index+1).forEach((p,i)=>{ const px=cx+((p.lon-130)/32+rot)*r; const py=cy-((p.lat-20)/27)*r; ctx.fillStyle=i===index?'#fff':storm.color;ctx.beginPath();ctx.arc(px,py,i===index?4:2,0,Math.PI*2);ctx.fill(); });
      ctx.restore();

      ctx.strokeStyle='rgba(113,219,255,.6)'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [storm, index, playing, layer]);

  return <canvas
    ref={ref}
    className="globe-canvas"
    aria-label={`Draggable three-dimensional globe showing Typhoon ${storm.name}`}
    onPointerDown={(e) => { drag.current.down=true; drag.current.x=e.clientX; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={(e) => { if(drag.current.down){ drag.current.rotation += (e.clientX-drag.current.x)/500; drag.current.rotation=Math.max(-.35,Math.min(.35,drag.current.rotation)); drag.current.x=e.clientX; } }}
    onPointerUp={() => { drag.current.down=false; }}
  />;
}
