'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import StormChart from './Chart';
import DataWorkbench from './DataWorkbench';
import { modelStorm, sourceLinks, storms, type Storm } from './data';

type Tab = 'simulation'|'archive'|'analysis'|'physics';
type Form = {name:string;lat:number;lon:number;sst:number;heat:number;shear:number;humidity:number;wind:number};
const initialForm: Form = {name:'KAI',lat:14.2,lon:142.5,sst:30.2,heat:92,shear:9,humidity:78,wind:45};
const TyphoonGlobe = dynamic(() => import('./Globe'), { ssr: false, loading: () => <div className="globe-loading"><i/><span>INITIALIZING WEBGL EARTH</span></div> });

function Header({tab,setTab}:{tab:Tab;setTab:(t:Tab)=>void}){
  const nav:[Tab,string][]=[['simulation','SIMULATION'],['archive','STORM ARCHIVE'],['analysis','DATA WORKSPACE'],['physics','PHYSICS LAB']];
  return <header className="topbar">
    <button className="brand" onClick={()=>setTab('simulation')}><span className="brand-mark">N</span><span>NARI LAB</span><small>TYPHOON INTELLIGENCE</small></button>
    <nav>{nav.map(([id,label])=><button key={id} className={tab===id?'nav-active':''} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    <div className="status"><span className="pulse"/> MODEL READY <b>V2.4</b></div>
  </header>
}

function StormPanel({storm,onCreate,onArchive}:{storm:Storm;onCreate:()=>void;onArchive:()=>void}){
  return <aside className="storm-panel glass">
    <p className="eyebrow">SELECTED STORM</p>
    <div className="storm-title"><span className="storm-icon">↺</span><div><h1>{storm.name}</h1><p>{storm.year} · {storm.basin}</p></div></div>
    <div className="severity"><span>{storm.category}</span><b>{storm.maxWind>=137?'EXTREME':'SEVERE'}</b></div>
    <div className="metrics">
      <article><span>MAX WIND</span><strong>{storm.maxWind}<small> kt</small></strong><em>{Math.round(storm.maxWind*1.852)} km/h</em></article>
      <article><span>PRESSURE</span><strong>{storm.minPressure}<small> hPa</small></strong><em>central minimum</em></article>
      <article><span>MOVEMENT</span><strong className="small-value">{storm.movement}</strong><em>deep-layer steering</em></article>
      <article><span>RADIUS</span><strong>{storm.radius}<small> nm</small></strong><em>gale-force estimate</em></article>
    </div>
    <div className="landfall"><span>LANDFALL / CLOSEST APPROACH</span><b>{storm.landfall}</b></div>
    <button className="create-btn" onClick={onCreate}>＋ CREATE NEW TYPHOON</button>
    <button className="ghost-btn" onClick={onArchive}>VIEW HISTORICAL STORMS →</button>
  </aside>
}

function ForecastPanel({storm,index}:{storm:Storm;index:number}){
  const p=storm.track[Math.min(index,storm.track.length-1)];
  return <aside className="forecast-panel glass">
    <p className="eyebrow">MODEL GUIDANCE</p><h2>PHYSICS FORECAST</h2>
    <div className="confidence"><span>ENSEMBLE CONFIDENCE</span><b>87%</b><i><em/></i></div>
    {[['DYNAMICAL','Coupled atmosphere–ocean','61%'],['STAT–DYN','Growth + steering flow','24%'],['CLIMATOLOGY','IBTrACS analog set','15%']].map((m,i)=><article className="model" key={m[0]}><span className={`dot d${i}`}/><div><b>{m[0]}</b><small>{m[1]}</small></div><strong>{m[2]}</strong></article>)}
    <div className="arrival"><span>CURRENT FORECAST POINT</span><strong>+{p.hour}H</strong><b>{p.lat}°N · {p.lon}°E</b><small>{p.wind} kt · {p.pressure} hPa</small></div>
    <div className="risk"><span>IMPACT PROBABILITY</span><div><i style={{height:'36%'}}/><i style={{height:'61%'}}/><i style={{height:'82%'}}/><i style={{height:'68%'}}/><i style={{height:'44%'}}/></div><small><b>LOW</b><b>SEVERE</b></small></div>
    <div className="model-note"><span>⚠</span><p>Educational reduced-order simulation. Not for operational forecasting or safety decisions.</p></div>
  </aside>
}

function Simulation({storm,setTab,onCreate}:{storm:Storm;setTab:(t:Tab)=>void;onCreate:()=>void}){
  const [playing,setPlaying]=useState(true),[layer,setLayer]=useState('3D'),[index,setIndex]=useState(Math.min(5,storm.track.length-1));
  useEffect(()=>setIndex(Math.min(5,storm.track.length-1)),[storm]);
  useEffect(()=>{if(!playing)return;const t=setInterval(()=>setIndex(v=>(v+1)%storm.track.length),1400);return()=>clearInterval(t)},[playing,storm]);
  const point=storm.track[index];
  return <><section className="hero-grid">
    <StormPanel storm={storm} onCreate={onCreate} onArchive={()=>setTab('archive')}/>
    <section className="globe-stage">
      <div className="layer-controls glass">{['3D','WIND','RAIN','SST'].map(x=><button key={x} className={layer===x?'active':''} onClick={()=>setLayer(x)}>{x}</button>)}</div>
      <div className="drag-tip">DRAG · SCROLL TO ZOOM</div><div className="webgl-badge"><i/> WEBGL · ADAPTIVE</div><TyphoonGlobe storm={storm} index={index} playing={playing} layer={layer}/>
      <div className="map-label label-taiwan">TAIWAN</div><div className="map-label label-japan">JAPAN</div><div className="map-label label-ph">PHILIPPINES</div>
      <div className="storm-callout glass"><span>◉</span><div><b>VORTEX CORE</b><strong>{point.wind} kt</strong><small>{point.pressure} hPa</small></div></div>
      <div className="legend"><span>20</span><i/><i/><i/><i/><i/><span>170 kt</span></div>
      <div className="timeline glass"><button onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause simulation':'Play simulation'}>{playing?'Ⅱ':'▶'}</button><span>GENESIS</span><input aria-label="Forecast hour" type="range" min="0" max={storm.track.length-1} value={index} onChange={e=>{setPlaying(false);setIndex(+e.target.value)}}/><span>+{storm.track.at(-1)?.hour}H</span><strong>+{point.hour}H</strong></div>
    </section><ForecastPanel storm={storm} index={index}/>
  </section><footer className="bottom-strip"><div><span className="pulse"/> MODEL SYNCHRONIZED</div><p>PHYSICS CORE <b>VORTEX-2.4</b></p><p>DATA BASIS <b>IBTrACS · NOAA TCHP</b></p><p>TIMESTEP <b>12 HOURS</b></p></footer></>;
}

function Archive({select}:{select:(s:Storm)=>void}){
  return <section className="content-page"><div className="page-intro"><p className="eyebrow">BEST-TRACK LIBRARY</p><h1>Storm Archive</h1><p>Explore benchmark Western Pacific tropical cyclones and compare their compact 12-hour track samples.</p></div>
    <div className="archive-grid">{storms.slice(1).map((s,idx)=><button className="archive-card glass" key={s.id} onClick={()=>select(s)}><span className="archive-index">0{idx+1}</span><div className="mini-vortex" style={{'--storm':s.color} as React.CSSProperties}><i/></div><p>{s.year} · WP</p><h2>{s.name}</h2><div><span><small>PEAK WIND</small><b>{s.maxWind} kt</b></span><span><small>MIN PRESSURE</small><b>{s.minPressure} hPa</b></span></div><em>{s.landfall}</em><strong>LOAD IN SIMULATOR →</strong></button>)}</div>
    <div className="provenance glass"><div><p className="eyebrow">DATA PROVENANCE</p><h2>Curated from NOAA IBTrACS v4r01</h2><p>Peak values reference the global best-track archive. Track points in this interface are compact illustrative resamples, clearly separated from operational data.</p></div><div className="file-links"><a href="data/typhoons.csv" download>↓ CSV</a><a href="data/typhoons.json" download>↓ JSON</a><a href={sourceLinks[0][1]} target="_blank" rel="noreferrer">SOURCE ↗</a></div></div>
  </section>;
}

function Analysis({storm,setStorm}:{storm:Storm;setStorm:(s:Storm)=>void}){
  const [metric,setMetric]=useState<'wind'|'pressure'|'rain'>('wind');
  const values=storm.track.map(x=>x[metric]); const mean=Math.round(values.reduce((a,b)=>a+b,0)/values.length); const peak=metric==='pressure'?Math.min(...values):Math.max(...values);
  const exportData=(kind:'csv'|'json')=>{const rows=storm.track;let text,mime;if(kind==='json'){text=JSON.stringify({storm:storm.name,units:{wind:'kt',pressure:'hPa',rain:'mm/24h'},track:rows},null,2);mime='application/json'}else{text='hour,latitude,longitude,wind_kt,pressure_hpa,rain_mm\n'+rows.map(x=>`${x.hour},${x.lat},${x.lon},${x.wind},${x.pressure},${x.rain}`).join('\n');mime='text/csv'}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=`${storm.name.toLowerCase()}-model.${kind}`;a.click();URL.revokeObjectURL(a.href)};
  return <section className="content-page analysis-page"><div className="page-intro row"><div><p className="eyebrow">QUANTITATIVE WORKBENCH</p><h1>Storm Data Analysis</h1><p>Inspect modeled intensity, pressure, and rainfall through the full simulation window.</p></div><select value={storm.id} onChange={e=>setStorm(storms.find(s=>s.id===e.target.value)||storm)}>{storms.map(s=><option value={s.id} key={s.id}>{s.name} · {s.year}</option>)}</select></div>
    <div className="analytics-kpis"><article><span>PEAK {metric.toUpperCase()}</span><b>{peak}<small>{metric==='wind'?' kt':metric==='pressure'?' hPa':' mm'}</small></b></article><article><span>PERIOD MEAN</span><b>{mean}<small>{metric==='wind'?' kt':metric==='pressure'?' hPa':' mm'}</small></b></article><article><span>INTENSIFICATION</span><b>+{Math.max(0,storm.maxWind-storm.track[0].wind)}<small> kt</small></b></article><article><span>MODEL POINTS</span><b>{storm.track.length}<small> × 12h</small></b></article></div>
    <div className="analysis-grid"><article className="chart-card glass"><div className="chart-head"><div><p className="eyebrow">TIME SERIES · 12H INTERVAL</p><h2>{metric==='wind'?'Maximum sustained wind':metric==='pressure'?'Minimum central pressure':'24-hour rainfall rate'}</h2></div><div className="segmented">{(['wind','pressure','rain'] as const).map(m=><button key={m} className={metric===m?'active':''} onClick={()=>setMetric(m)}>{m.toUpperCase()}</button>)}</div></div><StormChart storm={storm} metric={metric}/></article>
      <aside className="analysis-side glass"><p className="eyebrow">EXPORT DATA</p><h2>Take the model with you.</h2><p>Each export includes timestamp, coordinates, wind, pressure and rainfall. PNG charts render at device resolution.</p><button onClick={()=>exportData('csv')}>↓ DOWNLOAD CSV</button><button onClick={()=>exportData('json')}>↓ DOWNLOAD JSON</button><div className="formula-mini"><span>PRESSURE–WIND FIT</span><code>P = 1013 − 0.32V − 0.0028V²</code><small>V in knots · P in hPa</small></div></aside></div>
  </section>;
}

function Physics(){
  const [sst,setSst]=useState(29.5),[shear,setShear]=useState(10),[heat,setHeat]=useState(80);
  const mpi=Math.round(Math.max(30,Math.min(185,35+(sst-26)*17+heat*.42-shear*1.45+4.5)));
  return <section className="content-page physics-page"><div className="page-intro"><p className="eyebrow">THE SCIENCE UNDER THE STORM</p><h1>Physics Lab</h1><p>A transparent reduced-order model of tropical cyclone thermodynamics, vortex balance, and environmental forcing.</p></div>
    <div className="physics-hero glass"><div className="physics-vortex"><i/><i/><i/><i/><b>{mpi}<small> kt MPI</small></b></div><div className="physics-copy"><p className="eyebrow">LIVE PARAMETER LAB</p><h2>Maximum potential intensity</h2><p>The ocean supplies enthalpy while the storm exports heat near the tropopause. Warm deep water raises the thermodynamic ceiling; vertical wind shear disrupts the aligned vortex.</p><label><span>SEA-SURFACE TEMPERATURE <b>{sst.toFixed(1)}°C</b></span><input type="range" min="26" max="33" step=".1" value={sst} onChange={e=>setSst(+e.target.value)}/></label><label><span>OCEAN HEAT CONTENT <b>{heat} kJ/cm²</b></span><input type="range" min="20" max="140" value={heat} onChange={e=>setHeat(+e.target.value)}/></label><label><span>VERTICAL WIND SHEAR <b>{shear} kt</b></span><input type="range" min="0" max="35" value={shear} onChange={e=>setShear(+e.target.value)}/></label></div></div>
    <div className="equation-grid"><article><span>01 · HEAT ENGINE</span><h3>Potential intensity</h3><code>V²ₘₐₓ ≈ (Cₖ/Cᴅ) · (Tₛ−Tₒ)/Tₒ · Δk</code><p>A Carnot-cycle approximation links surface enthalpy flux to the outflow temperature aloft.</p></article><article><span>02 · GRADIENT WIND</span><h3>Vortex balance</h3><code>V²/r + fV = (1/ρ) · ∂p/∂r</code><p>Inward pressure-gradient force balances centrifugal and Coriolis accelerations above the boundary layer.</p></article><article><span>03 · INTENSITY CHANGE</span><h3>Logistic tendency</h3><code>dV/dt = κV(1−V/Vₚᵢ) − S</code><p>The educational model approaches MPI asymptotically while environmental shear supplies a loss term.</p></article></div>
    <div className="method glass"><div><p className="eyebrow">MODEL PIPELINE</p><h2>From initial conditions to a 120-hour track</h2></div><ol><li><b>01</b><span>Initialize vortex</span><small>Position, wind and pressure</small></li><li><b>02</b><span>Compute energy ceiling</span><small>SST, heat content, humidity</small></li><li><b>03</b><span>Integrate tendency</span><small>12-hour logistic timesteps</small></li><li><b>04</b><span>Advect track</span><small>Steering flow + β drift</small></li></ol></div>
    <div className="references"><p>SCIENTIFIC FOUNDATIONS</p>{sourceLinks.map(([n,u])=><a key={n} href={u} target="_blank" rel="noreferrer">{n} ↗</a>)}</div>
  </section>;
}

function CreateModal({close,create}:{close:()=>void;create:(s:Storm)=>void}){
  const [f,setF]=useState<Form>(initialForm); const preview=useMemo(()=>modelStorm(f),[f]);
  const field=(key:keyof Form,label:string,min:number,max:number,step=1,unit='')=><label><span>{label}<b>{f[key]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={f[key]} onChange={e=>setF({...f,[key]:+e.target.value})}/></label>;
  return <div className="modal-bg" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="creator glass" role="dialog" aria-modal="true" aria-label="Create a custom typhoon"><button className="modal-close" onClick={close}>×</button><p className="eyebrow">CUSTOM VORTEX INITIALIZATION</p><h2>Create a typhoon</h2><p>Set environmental conditions. NARI LAB integrates a transparent 120-hour reduced-order intensity model.</p><label className="text-field"><span>STORM NAME</span><input value={f.name} maxLength={12} onChange={e=>setF({...f,name:e.target.value})}/></label><div className="form-grid"><label className="number-field"><span>LATITUDE</span><input type="number" value={f.lat} onChange={e=>setF({...f,lat:+e.target.value})}/></label><label className="number-field"><span>LONGITUDE</span><input type="number" value={f.lon} onChange={e=>setF({...f,lon:+e.target.value})}/></label></div>{field('wind','INITIAL WIND',25,100,1,' kt')}{field('sst','SEA-SURFACE TEMP',26,33,.1,'°C')}{field('heat','OCEAN HEAT CONTENT',20,140,1,' kJ/cm²')}{field('shear','VERTICAL WIND SHEAR',0,35,1,' kt')}{field('humidity','MID-LEVEL HUMIDITY',45,90,1,'%')}<div className="creator-result"><span>MODELED PEAK</span><b>{preview.maxWind} kt</b><span>MIN PRESSURE</span><b>{preview.minPressure} hPa</b></div><button className="create-btn" onClick={()=>create(preview)}>RUN 120-HOUR SIMULATION →</button></section></div>;
}

export default function Home(){
  const [tab,setTab]=useState<Tab>('simulation'),[storm,setStorm]=useState<Storm>(storms[0]),[creating,setCreating]=useState(false);
  const select=(s:Storm)=>{setStorm(s);setTab('simulation')};
  return <main className="app-shell"><Header tab={tab} setTab={setTab}/>{tab==='simulation'&&<Simulation storm={storm} setTab={setTab} onCreate={()=>setCreating(true)}/>} {tab==='archive'&&<Archive select={select}/>} {tab==='analysis'&&<DataWorkbench initialStorm={storm}/>} {tab==='physics'&&<Physics/>}{creating&&<CreateModal close={()=>setCreating(false)} create={s=>{setStorm(s);setCreating(false);setTab('simulation')}}/>}</main>;
}
