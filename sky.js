// Voie lactée interactive. Le fond (nébuleuse + étoiles lointaines) est rendu une seule fois ;
// seules les étoiles proches sont animées : parallaxe, écartement et éclat autour du pointeur,
// onde lumineuse au clic/toucher, étoiles filantes.
(()=>{
const c=document.querySelector('.sky');if(!c)return;
const x=c.getContext('2d'),still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const TILT=-.46,RAD=150,M=24,COLS=['#f4efe6','#c4d4ff','#ffd9a6','#f5c2d8'];
let w,h,dpr,thick,bg,stars=[],last=0,nextShoot=4000;
const P={x:0,y:0,tx:0,ty:0,px:-1e4,py:-1e4,on:false},ripples=[],shoots=[];
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v);};
const pick=()=>{const t=Math.random();return t<.09?1:t<.15?2:t<.18?3:0;};
function point(R,band){const u=(Math.random()*2-1)*R;const v=band?gauss()*thick*(.5+.5*Math.exp(-u*u/(R*R*.45))):(Math.random()*2-1)*R;return [u,v];}
function build(){
 dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;
 const R=Math.hypot(w,h)/2+M,ca=Math.cos(TILT),sa=Math.sin(TILT);thick=Math.min(w,h)*.15+50;
 const W=w+M*2,H=h+M*2,b=(bg=document.createElement('canvas')).getContext('2d');
 bg.width=W*dpr;bg.height=H*dpr;b.scale(dpr,dpr);b.translate(W/2,H/2);
 b.save();b.rotate(TILT);
 const blob=(u,v,r,rgb,a,sy=1)=>{b.save();b.translate(u,v);b.scale(1,sy);const g=b.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);b.fillStyle=g;b.fillRect(-r,-r,r*2,r*2);b.restore();};
 b.globalCompositeOperation='lighter';
 for(let i=0;i<170;i++){const u=(Math.random()*2-1)*R,core=Math.exp(-u*u/(R*R*.3)),q=Math.random();blob(u,gauss()*thick*.5,thick*(.45+Math.random()*1.1),q<.4?'112,108,170':q<.72?'92,112,170':'210,170,135',.02+.044*core,.7);}
 for(let i=0;i<26;i++)blob(gauss()*R*.18,gauss()*thick*.25,thick*(.5+Math.random()*.6),'240,205,160',.028,.6);
 b.globalCompositeOperation='source-over';
 for(let i=0;i<110;i++){const u=(Math.random()*2-1)*R*.9;blob(u,gauss()*thick*.1+thick*.06,thick*(.18+Math.random()*.4),'9,9,11',.3*Math.exp(-u*u/(R*R*.5)),.32);}
 // Étoiles lointaines figées dans le fond
 const far=Math.min(9000,Math.round(w*h/170));
 for(let i=0;i<far;i++){const [u,v]=point(R,Math.random()<.78),r=.2+Math.random()**4*.7;b.globalAlpha=.12+Math.random()*.45;b.fillStyle=COLS[pick()];b.fillRect(u-r,v-r,r*2,r*2);}
 b.restore();
 // Étoiles proches, animées (triées par couleur pour limiter les changements de style)
 const n=Math.min(1700,Math.round(w*h/700));stars=[];
 for(let i=0;i<n;i++){const [u,v]=point(R,Math.random()<.7);stars.push({X:u*ca-v*sa,Y:u*sa+v*ca,z:.35+Math.random()*.65,r:.35+Math.random()**3*1.35,a:.35+Math.random()*.6,tw:Math.random()*6.28,ts:.35+Math.random()*1.5,c:pick(),ox:0,oy:0,b:0});}
 stars.sort((p,q)=>p.c-q.c);
}
function frame(t){
 const dt=Math.min(50,t-last||16);last=t;
 P.x+=(P.tx-P.x)*.05;P.y+=(P.ty-P.y)*.05;
 x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
 x.globalAlpha=1;x.drawImage(bg,-M-P.x*10,-M-P.y*10,w+M*2,h+M*2);
 const cx=w/2,cy=h/2,rad2=RAD*RAD;let col=-1;
 for(const s of stars){
  let X=cx+s.X-P.x*34*s.z,Y=cy+s.Y-P.y*34*s.z;
  if(X<-20||X>w+20||Y<-20||Y>h+20)continue;
  const dx=X-P.px,dy=Y-P.py,d2=dx*dx+dy*dy;
  if(P.on&&d2<rad2){const d=Math.sqrt(d2)||1,f=1-d/RAD,push=f*f*24*s.z;s.ox+=(dx/d*push-s.ox)*.09;s.oy+=(dy/d*push-s.oy)*.09;if(f>s.b)s.b=f;}
  else if(s.ox||s.oy){s.ox*=.95;s.oy*=.95;if(Math.abs(s.ox)+Math.abs(s.oy)<.05)s.ox=s.oy=0;}
  for(const r of ripples){const q=Math.abs(Math.hypot(X-r.x,Y-r.y)-r.r);if(q<46){const f=(1-q/46)*r.a;if(f>s.b)s.b=f;}}
  if(s.b>.004)s.b*=.955;else s.b=0;
  const tw=still?1:.68+.32*Math.sin(t*.001*s.ts+s.tw),rr=s.r*(1+s.b*1.4);
  if(s.c!==col){col=s.c;x.fillStyle=COLS[col];}
  x.globalAlpha=Math.min(1,s.a*tw+s.b*.75);X+=s.ox;Y+=s.oy;
  if(rr<1.1)x.fillRect(X-rr,Y-rr,rr*2,rr*2);else{x.beginPath();x.arc(X,Y,rr,0,6.2832);x.fill();}
 }
 for(let i=ripples.length;i--;){const r=ripples[i];r.r+=dt*.55;r.a*=.984;if(r.a<.03)ripples.splice(i,1);}
 if(!still){nextShoot-=dt;if(nextShoot<0){nextShoot=7000+Math.random()*9000;const a=TILT+(Math.random()-.5)*.6+(Math.random()<.5?0:Math.PI);shoots.push({x:Math.random()*w,y:Math.random()*h*.7,vx:Math.cos(a)*.9,vy:Math.abs(Math.sin(a))*.9+.15,life:1});}
  x.lineCap='round';x.lineWidth=1.3;for(let i=shoots.length;i--;){const s=shoots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt/900;if(s.life<=0){shoots.splice(i,1);continue;}
   const g=x.createLinearGradient(s.x,s.y,s.x-s.vx*120,s.y-s.vy*120);g.addColorStop(0,`rgba(255,244,222,${.85*s.life})`);g.addColorStop(1,'rgba(255,244,222,0)');
   x.globalAlpha=1;x.strokeStyle=g;x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x-s.vx*120,s.y-s.vy*120);x.stroke();}}
 x.globalAlpha=1;
 if(!still)requestAnimationFrame(frame);
}
const move=e=>{P.px=e.clientX;P.py=e.clientY;P.tx=(e.clientX/w-.5)*2;P.ty=(e.clientY/h-.5)*2;P.on=true;};
addEventListener('pointermove',move,{passive:true});
addEventListener('pointerdown',e=>{move(e);ripples.push({x:e.clientX,y:e.clientY,r:0,a:1});if(still)frame(performance.now());},{passive:true});
const leave=()=>{P.on=false;P.tx=P.ty=0;P.px=P.py=-1e4;};
addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave();});
document.addEventListener('pointerleave',leave);addEventListener('blur',leave);
let rs;addEventListener('resize',()=>{clearTimeout(rs);rs=setTimeout(()=>{build();if(still)frame(0);},150);});
build();requestAnimationFrame(frame);
})();
