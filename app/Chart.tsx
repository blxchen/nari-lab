'use client';

import { useEffect, useRef } from 'react';
import type { Storm } from './data';

export default function StormChart({ storm, metric }: { storm: Storm; metric: 'wind'|'pressure'|'rain' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=ref.current; if(!canvas)return; const ctx=canvas.getContext('2d'); if(!ctx)return;
    const box=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2); canvas.width=box.width*dpr; canvas.height=box.height*dpr; ctx.scale(dpr,dpr);
    const w=box.width,h=box.height,p={l:52,r:20,t:30,b:42}; const vals=storm.track.map(d=>d[metric]);
    const min=Math.floor(Math.min(...vals)*.96/10)*10, max=Math.ceil(Math.max(...vals)*1.04/10)*10;
    ctx.clearRect(0,0,w,h); ctx.font='9px monospace'; ctx.fillStyle='#6d8b96'; ctx.strokeStyle='rgba(131,205,229,.12)'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=p.t+(h-p.t-p.b)*i/4;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();const v=Math.round(max-(max-min)*i/4);ctx.fillText(String(v),10,y+3)}
    storm.track.forEach((d,i)=>{if(i%2===0){const x=p.l+(w-p.l-p.r)*i/(storm.track.length-1);ctx.fillText(`+${d.hour}h`,x-12,h-14)}});
    const grad=ctx.createLinearGradient(0,p.t,0,h-p.b);grad.addColorStop(0,`${storm.color}aa`);grad.addColorStop(1,`${storm.color}00`);
    ctx.beginPath();vals.forEach((v,i)=>{const x=p.l+(w-p.l-p.r)*i/(vals.length-1);const y=p.t+(max-v)/(max-min)*(h-p.t-p.b);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineTo(w-p.r,h-p.b);ctx.lineTo(p.l,h-p.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();vals.forEach((v,i)=>{const x=p.l+(w-p.l-p.r)*i/(vals.length-1);const y=p.t+(max-v)/(max-min)*(h-p.t-p.b);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=storm.color;ctx.lineWidth=2;ctx.setLineDash([]);ctx.stroke();
    vals.forEach((v,i)=>{const x=p.l+(w-p.l-p.r)*i/(vals.length-1);const y=p.t+(max-v)/(max-min)*(h-p.t-p.b);ctx.fillStyle='#07131b';ctx.strokeStyle=storm.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.stroke()});
  },[storm,metric]);
  const download=()=>{const a=document.createElement('a');a.download=`${storm.name.toLowerCase()}-${metric}-analysis.png`;a.href=ref.current?.toDataURL('image/png')||'';a.click()};
  return <div className="chart-wrap"><canvas ref={ref} aria-label={`${metric} forecast chart for ${storm.name}`}/><button className="download-btn" onClick={download}>↓ DOWNLOAD PNG</button></div>;
}
