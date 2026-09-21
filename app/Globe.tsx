'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Storm } from './data';

type Props = { storm: Storm; index: number; playing: boolean; layer: string };

const CONTINENTS: number[][][] = [
  [[5,72],[35,70],[62,56],[84,56],[104,72],[146,67],[168,56],[160,42],[142,35],[130,20],[118,22],[107,8],[96,8],[80,22],[62,30],[42,45],[20,48]],
  [[92,8],[108,5],[119,-8],[115,-28],[104,-35],[94,-18]],
  [[112,-10],[154,-10],[151,-40],[130,-45],[114,-27]],
  [[-168,70],[-110,72],[-54,52],[-72,18],[-98,10],[-118,28],[-145,42]],
  [[-82,12],[-50,8],[-36,-22],[-56,-55],[-76,-40]],
  [[-18,36],[17,38],[50,12],[42,-34],[18,-36],[-8,5]],
  [[-10,70],[40,70],[58,48],[32,36],[-5,48]],
  [[128,34],[142,42],[146,32],[136,30]],
  [[119,25],[122,25],[121,21],[119,22]],
];

function seeded(seed:number){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}

function earthTexture(layer:string){
  const c=document.createElement('canvas');c.width=1536;c.height=768;const x=c.getContext('2d')!;
  const ocean=x.createLinearGradient(0,0,0,c.height);ocean.addColorStop(0,layer==='SST'?'#0a4f83':'#062f63');ocean.addColorStop(.5,layer==='SST'?'#0079a9':'#004a87');ocean.addColorStop(1,'#031f45');x.fillStyle=ocean;x.fillRect(0,0,c.width,c.height);
  const toXY=([lon,lat]:number[])=>[(lon+180)/360*c.width,(90-lat)/180*c.height];
  CONTINENTS.forEach((poly,i)=>{x.beginPath();poly.forEach((p,j)=>{const [px,py]=toXY(p);j?x.lineTo(px,py):x.moveTo(px,py)});x.closePath();const g=x.createLinearGradient(0,100,0,700);g.addColorStop(0,layer==='SST'?'#456c64':'#3f8a78');g.addColorStop(1,layer==='SST'?'#254f49':'#164d46');x.fillStyle=g;x.fill();x.strokeStyle='rgba(164,225,214,.35)';x.lineWidth=1.5;x.stroke();if(i<7){x.globalAlpha=.13;x.strokeStyle='#d4f6e8';for(let k=0;k<3;k++)x.stroke();x.globalAlpha=1}});
  const rnd=seeded(42);for(let i=0;i<220;i++){const px=rnd()*c.width,py=rnd()*c.height;x.fillStyle=`rgba(139,220,230,${.015+rnd()*.035})`;x.beginPath();x.arc(px,py,1+rnd()*2,0,Math.PI*2);x.fill()}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

function cloudTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d')!,rnd=seeded(84);x.clearRect(0,0,c.width,c.height);x.filter='blur(7px)';
  for(let i=0;i<230;i++){const px=rnd()*c.width,py=rnd()*c.height,r=5+rnd()*26;x.fillStyle=`rgba(255,255,255,${.025+rnd()*.12})`;x.beginPath();x.ellipse(px,py,r*2.6,r,0,0,Math.PI*2);x.fill()}
  x.filter='none';const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

function pointTexture(){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d')!,g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.22,'rgba(205,245,255,.85)');g.addColorStop(1,'rgba(0,133,202,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
function globePoint(lat:number,lon:number,r=1){const la=THREE.MathUtils.degToRad(lat),lo=THREE.MathUtils.degToRad(lon-135);return new THREE.Vector3(Math.cos(la)*Math.sin(lo)*r,Math.sin(la)*r,Math.cos(la)*Math.cos(lo)*r)}

export default function TyphoonGlobe({ storm, index, playing, layer }: Props) {
  const mount=useRef<HTMLDivElement>(null);
  const live=useRef({storm,index,playing});
  useEffect(()=>{live.current={storm,index,playing}},[storm,index,playing]);
  useEffect(()=>{
    const host=mount.current;if(!host)return;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,.06,3.2);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor(0x000000,0);host.appendChild(renderer.domElement);
    const maxDpr=Math.min(window.devicePixelRatio||1,1.65);renderer.setPixelRatio(maxDpr);
    const world=new THREE.Group();world.rotation.x=-.08;scene.add(world);

    const tex=earthTexture(layer),clouds=cloudTexture(),pointTex=pointTexture();
    const earthMat=new THREE.MeshPhysicalMaterial({map:tex,roughness:.72,metalness:.03,clearcoat:.18,clearcoatRoughness:.8,emissive:new THREE.Color(layer==='SST'?0x123c50:0x001d3f),emissiveIntensity:.2});
    const earth=new THREE.Mesh(new THREE.SphereGeometry(1,80,80),earthMat);world.add(earth);
    const cloudMesh=new THREE.Mesh(new THREE.SphereGeometry(1.012,64,64),new THREE.MeshLambertMaterial({map:clouds,transparent:true,opacity:layer==='RAIN'?.58:.3,depthWrite:false}));world.add(cloudMesh);
    const atmo=new THREE.Mesh(new THREE.SphereGeometry(1.055,64,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 n;void main(){float i=pow(0.72-dot(n,vec3(0.0,0.0,1.0)),3.0);gl_FragColor=vec4(0.0,0.52,0.79,1.0)*i;}'}));world.add(atmo);

    const gridMat=new THREE.LineBasicMaterial({color:0x70c9e8,transparent:true,opacity:.13});
    [-60,-30,0,30,60].forEach(lat=>{const pts=[];for(let lon=-180;lon<=180;lon+=4)pts.push(globePoint(lat,lon,1.006));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat))});
    for(let lon=-180;lon<180;lon+=30){const pts=[];for(let lat=-90;lat<=90;lat+=3)pts.push(globePoint(lat,lon,1.006));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat))}

    const trackPts=storm.track.map(p=>globePoint(p.lat,p.lon,1.026));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(trackPts),new THREE.LineBasicMaterial({color:new THREE.Color(storm.color),transparent:true,opacity:.9})));
    const donePts=storm.track.map(p=>globePoint(p.lat,p.lon,1.032)),markerGeo=new THREE.BufferGeometry().setFromPoints(donePts);markerGeo.setDrawRange(0,index+1);world.add(new THREE.Points(markerGeo,new THREE.PointsMaterial({color:storm.color,size:.028,map:pointTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));

    let currentIndex=Math.min(index,storm.track.length-1),currentPoint=storm.track[currentIndex],normal=globePoint(currentPoint.lat,currentPoint.lon,1).normalize();
    const vortex=new THREE.Group();vortex.position.copy(normal.clone().multiplyScalar(1.033));vortex.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);world.add(vortex);
    const count=window.innerWidth<700?420:760,positions=new Float32Array(count*3),colors=new Float32Array(count*3),base=new THREE.Color(layer==='SST'?0xffd79b:layer==='RAIN'?0x7ee6ff:0xe6faff),rnd=seeded(storm.maxWind+index);
    for(let i=0;i<count;i++){const arm=i%5,ratio=Math.pow(rnd(),.62),angle=ratio*10.5+arm*Math.PI*2/5+rnd()*.32,rad=.025+ratio*(.22+currentPoint.wind/170*.13);positions[i*3]=Math.cos(angle)*rad*1.18;positions[i*3+1]=Math.sin(angle)*rad*.76;positions[i*3+2]=rnd()*.018;const shade=.46+rnd()*.54;colors[i*3]=base.r*shade;colors[i*3+1]=base.g*shade;colors[i*3+2]=base.b*shade}
    const vortexGeo=new THREE.BufferGeometry();vortexGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));vortexGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    vortex.add(new THREE.Points(vortexGeo,new THREE.PointsMaterial({size:.023,map:pointTex,transparent:true,opacity:.82,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending})));
    vortex.add(new THREE.Mesh(new THREE.TorusGeometry(.022,.004,10,42),new THREE.MeshBasicMaterial({color:0xe7fbff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending})));

    const key=new THREE.DirectionalLight(0xcbefff,2.7);key.position.set(-2,2,4);scene.add(key);const rim=new THREE.DirectionalLight(0x0085ca,1.4);rim.position.set(3,-1,-2);scene.add(rim);scene.add(new THREE.AmbientLight(0x164f79,.65));
    const starPos=new Float32Array(900);for(let i=0;i<300;i++){const radius=5+rnd()*8,theta=rnd()*Math.PI*2,phi=Math.acos(2*rnd()-1);starPos[i*3]=radius*Math.sin(phi)*Math.cos(theta);starPos[i*3+1]=radius*Math.cos(phi);starPos[i*3+2]=radius*Math.sin(phi)*Math.sin(theta)}const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.BufferAttribute(starPos,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0x91c9e2,size:.018,transparent:true,opacity:.55})));

    let visible=true,dragging=false,lastX=0,lastY=0,raf=0,last=performance.now(),frames=0,accum=0,adaptive=false;
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(host);resize();
    const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true},{threshold:.02});io.observe(host);
    const down=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)};
    const move=(e:PointerEvent)=>{if(!dragging)return;world.rotation.y+=(e.clientX-lastX)*.006;world.rotation.x=Math.max(-.65,Math.min(.55,world.rotation.x+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY};const up=()=>{dragging=false};
    const wheel=(e:WheelEvent)=>{e.preventDefault();camera.position.z=Math.max(2.35,Math.min(4.3,camera.position.z+e.deltaY*.0015))};
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('wheel',wheel,{passive:false});
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate=(now:number)=>{raf=requestAnimationFrame(animate);if(!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.04);last=now;const nextIndex=Math.min(live.current.index,storm.track.length-1);if(nextIndex!==currentIndex){currentIndex=nextIndex;currentPoint=storm.track[currentIndex];markerGeo.setDrawRange(0,currentIndex+1);normal=globePoint(currentPoint.lat,currentPoint.lon,1).normalize();vortex.position.copy(normal.clone().multiplyScalar(1.033));vortex.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal)}frames++;accum+=dt;if(accum>2&&!adaptive){const fps=frames/accum;if(fps<47&&maxDpr>1){renderer.setPixelRatio(1);resize();adaptive=true}frames=0;accum=0}if(live.current.playing&&!reduced){cloudMesh.rotation.y+=dt*.009;vortex.rotation.z-=dt*(.42+currentPoint.wind/170*.55);if(!dragging)world.rotation.y+=dt*.012}renderer.render(scene,camera)};animate(performance.now());
    return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('wheel',wheel);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line||o instanceof THREE.Points){o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m?.dispose())}});tex.dispose();clouds.dispose();pointTex.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}
  },[storm,layer]);
  return <div ref={mount} className="globe-webgl" role="img" aria-label={`Interactive WebGL globe showing Typhoon ${storm.name}. Drag to rotate and scroll to zoom.`}/>;
}
