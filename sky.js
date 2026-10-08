// Ciel discret : quelques étoiles qui scintillent doucement, légère profondeur au mouvement du pointeur,
// et les étoiles proches du curseur s'éclairent un peu. Rien de plus.
(()=>{
const c=document.querySelector('.sky');if(!c)return;
const x=c.getContext('2d'),still=matchMedia('(prefers-reduced-motion: reduce)').matches;
let w,h,d,stars=[];const P={x:0,y:0,tx:0,ty:0,px:-1e4,py:-1e4};
function build(){d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;x.setTransform(d,0,0,d,0,0);
 stars=Array.from({length:Math.min(220,Math.round(w*h/9000))},()=>({x:Math.random()*w,y:Math.random()*h,z:.2+Math.random()*.8,r:.3+Math.random()**3*.9,a:.12+Math.random()*.45,p:Math.random()*6.28,s:.2+Math.random()*.6,g:Math.random()<.06,b:0}));}
function frame(t){
 P.x+=(P.tx-P.x)*.04;P.y+=(P.ty-P.y)*.04;x.clearRect(0,0,w,h);
 for(const s of stars){
  const X=s.x-P.x*10*s.z,Y=s.y-P.y*10*s.z,dx=X-P.px,dy=Y-P.py,q=dx*dx+dy*dy;
  s.b+=((q<14400?1-Math.sqrt(q)/120:0)-s.b)*.08;
  const tw=still?1:.65+.35*Math.sin(t*.001*s.s+s.p);
  x.globalAlpha=Math.min(1,s.a*tw+s.b*.5);x.fillStyle=s.g?'#e3c58f':'#f2ede4';
  const r=s.r*(1+s.b*.8);x.beginPath();x.arc(X,Y,r,0,6.2832);x.fill();
 }
 if(!still)requestAnimationFrame(frame);
}
addEventListener('pointermove',e=>{P.px=e.clientX;P.py=e.clientY;P.tx=(e.clientX/w-.5)*2;P.ty=(e.clientY/h-.5)*2;},{passive:true});
document.addEventListener('pointerleave',()=>{P.tx=P.ty=0;P.px=P.py=-1e4;});
let rs;addEventListener('resize',()=>{clearTimeout(rs);rs=setTimeout(()=>{build();if(still)frame(0);},150);});
build();requestAnimationFrame(frame);
})();
