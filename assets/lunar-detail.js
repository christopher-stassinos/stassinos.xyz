/* A relief-lit lunar sphere with fine ASCII grain. Rendered once, shared by both ocean renderers. */
(() => {
  'use strict';
  const background=document.getElementById('museum-background');
  if(!background)return;
  const canvas=document.createElement('canvas');
  canvas.id='museum-lunar-detail';canvas.width=canvas.height=320;
  canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:fixed;z-index:1;pointer-events:none;opacity:0';
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const size=320,extent=1.2,step=extent*2/(size-1),count=size*size;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  const seed=new Float32Array(32*32*32);
  for(let i=0;i<seed.length;i++){let n=Math.imul(i+731,1597334677);n=Math.imul(n^(n>>>16),2246822519);seed[i]=(n>>>0)/4294967295;}
  const at=(x,y,z)=>seed[((z&31)*32+(y&31))*32+(x&31)];
  function noise(x,y,z){
    const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);
    let u=x-ix,v=y-iy,w=z-iz;u=u*u*(3-2*u);v=v*v*(3-2*v);w=w*w*(3-2*w);
    const a=(at(ix,iy,iz)*(1-u)+at(ix+1,iy,iz)*u)*(1-v)+(at(ix,iy+1,iz)*(1-u)+at(ix+1,iy+1,iz)*u)*v;
    const b=(at(ix,iy,iz+1)*(1-u)+at(ix+1,iy,iz+1)*u)*(1-v)+(at(ix,iy+1,iz+1)*(1-u)+at(ix+1,iy+1,iz+1)*u)*v;
    return a*(1-w)+b*w;
  }
  function crater(x,y,r,depth){return {x,y,z:Math.sqrt(1-x*x-y*y),r,depth};}
  const craters=[
    crater(-.57,-.19,.19,.012),crater(-.43,.40,.14,.010),
    crater(-.72,-.43,.105,.007),crater(-.69,.51,.078,.005),
    crater(-.25,-.51,.11,.007),crater(-.38,-.72,.07,.005),
    crater(.18,.17,.17,.009),crater(.54,-.31,.10,.007),
  ];
  for(let i=0;i<70&&craters.length<46;i++){
    const x=(hash(i,8)*2-1)*.92,y=(hash(i,19)*2-1)*.92;
    if(x*x+y*y>.91)continue;
    const r=.018+hash(i,31)**2*.053;
    craters.push(crater(x,y,r,.0012+r*.055));
  }
  const px=new Float32Array(count),py=new Float32Array(count),pz=new Float32Array(count);
  const albedo=new Float32Array(count),inside=new Uint8Array(count),tones=new Float32Array(count);
  // Features live on the spherical surface and foreshorten toward the limb.
  for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    const i=row*size+col,x=col*step-extent,y=row*step-extent,rr=x*x+y*y;
    if(rr>=1)continue;
    inside[i]=1;const z=Math.sqrt(1-rr);
    let height=(noise(x*27+12,y*27+7,z*27+3)-.5)*.0018;
    height+=(noise(x*79+2,y*79+9,z*79+6)-.5)*.00065;
    for(const c of craters){
      const d2=((x-c.x)**2+(y-c.y)**2+(z-c.z)**2)/(c.r*c.r);
      if(d2>1.8)continue;
      const r=Math.sqrt(d2);
      if(r<1)height-=c.depth*(1-d2)**1.35;
      height+=c.depth*.48*Math.exp(-Math.pow((r-1.025)/.105,2));
      height+=c.depth*.10*Math.exp(-Math.pow((r-.78)/.065,2));
      if(c.r>.09)height+=c.depth*.22*Math.exp(-d2*65);
    }
    px[i]=x*(1+height);py[i]=y*(1+height);pz[i]=z*(1+height);
    const rough=noise(x*6+3,y*6+13,z*6+8),fine=noise(x*45+4,y*45+2,z*45+5);
    const maria=Math.exp(-((x+.53)**2*14+(y+.25)**2*8))*.24
      +Math.exp(-((x+.37)**2*17+(y-.12)**2*15))*.13
      +Math.exp(-((x-.30)**2*14+(y+.34)**2*12))*.18;
    albedo[i]=.82-maria+(rough-.5)*.14+(fine-.5)*.055;
  }
  const sunLength=Math.hypot(-.91,-.24,-.27),lx=-.91/sunLength,ly=-.24/sunLength,lz=-.27/sunLength;
  const rayXY=Math.hypot(lx,ly),image=ctx.createImageData(size,size);
  const bloom=document.createElement('canvas');bloom.width=bloom.height=size;
  const bloomCtx=bloom.getContext('2d'),bloomImage=bloomCtx.createImageData(size,size);
  for(let row=1;row<size-1;row++)for(let col=1;col<size-1;col++){
    const i=row*size+col;if(!inside[i])continue;
    const x=col*step-extent,y=row*step-extent,z=Math.sqrt(Math.max(0,1-x*x-y*y));
    let nx=x,ny=y,nz=z;
    if(inside[i-1]&&inside[i+1]&&inside[i-size]&&inside[i+size]){
      const ax=px[i+1]-px[i-1],ay=py[i+1]-py[i-1],az=pz[i+1]-pz[i-1];
      const bx=px[i+size]-px[i-size],by=py[i+size]-py[i-size],bz=pz[i+size]-pz[i-size];
      nx=ay*bz-az*by;ny=az*bx-ax*bz;nz=ax*by-ay*bx;
      const length=Math.hypot(nx,ny,nz);nx/=length;ny/=length;nz/=length;
    }
    const incidence=x*lx+y*ly+z*lz;
    let diffuse=Math.max(0,nx*lx+ny*ly+nz*lz)*smooth(-.012,.024,incidence);
    // Raised rims cast shadows into the crater bowls along short surface rays.
    if(diffuse>.005)for(const distance of [1,2,3,5,8]){
      const sx=Math.round(col+lx/rayXY*distance),sy=Math.round(row+ly/rayXY*distance),j=sy*size+sx;
      if(sx<0||sx>=size||sy<0||sy>=size||!inside[j])continue;
      const rayZ=pz[i]+distance*step*lz/rayXY;
      if(pz[j]>rayZ+.00125){diffuse*=.22;break;}
    }
    const direct=albedo[i]*(diffuse*.78+Math.sqrt(diffuse)*.22);
    const earthshine=.014*(.45+z*.55),tone=clamp(direct+earthshine);
    tones[i]=tone;
    const light=Math.pow(tone,.72),edge=clamp((1-Math.hypot(x,y))/step+.25),o=i*4;
    image.data[o]=Math.round(5+light*183);
    image.data[o+1]=Math.round(7+light*184);
    image.data[o+2]=Math.round(10+light*174);
    image.data[o+3]=Math.round(edge*255);
    bloomImage.data[o]=230;bloomImage.data[o+1]=232;bloomImage.data[o+2]=215;
    bloomImage.data[o+3]=Math.round(direct*direct*20);
  }
  bloomCtx.putImageData(bloomImage,0,0);ctx.filter='blur(4px)';ctx.drawImage(bloom,0,0);ctx.filter='none';
  const surface=document.createElement('canvas');surface.width=surface.height=size;surface.getContext('2d').putImageData(image,0,0);
  ctx.drawImage(surface,0,0);
  // Fine ASCII grain sits over continuous shading rather than replacing the surface relief.
  const glyphs='.,:;-+=xvoQMW#@',cw=3.9,ch=6.1;
  ctx.font='bold 6px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.save();ctx.beginPath();ctx.arc((size-1)/2,(size-1)/2,1/step,0,Math.PI*2);ctx.clip();
  for(let y=ch/2;y<size;y+=ch)for(let x=cw/2;x<size;x+=cw){
    const i=Math.floor(y)*size+Math.floor(x),tone=tones[i];if(!inside[i]||tone<.026)continue;
    const char=glyphs[Math.min(glyphs.length-1,Math.floor(Math.pow(tone,.68)*(glyphs.length-1)))];
    ctx.fillStyle=`rgba(235,235,219,${(.16+tone*.16).toFixed(3)})`;ctx.fillText(char,x,y);
  }
  ctx.restore();canvas.dataset.detail='spherical-relief';canvas.dataset.craters=String(craters.length);
  background.after(canvas);
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const still=new URLSearchParams(location.search).get('motion')==='still';
  function transition(){canvas.style.transition=preference.matches||still?'none':`opacity ${window.STASSINOS_MOTION.duration}ms ${window.STASSINOS_MOTION.easing}`;}
  function show(){const visible=document.querySelector('.museum-app')?.dataset.exhibit==='home';canvas.style.opacity=visible?'1':'0';canvas.dataset.visible=String(visible);}
  function place(){
    const aspect=innerWidth/innerHeight,u=clamp((aspect-.65)/.40),wide=u*u*(3-2*u);
    const radius=.054+(.090-.054)*wide,cx=.020+(.16-.020)*wide,cy=.205+(.30-.205)*wide,dimension=radius*innerHeight*2.4;
    canvas.style.width=canvas.style.height=`${dimension}px`;
    canvas.style.filter=`brightness(${(1.65-.60*wide).toFixed(2)}) contrast(1.05)`;
    canvas.style.left=`${innerWidth*.71+cx*innerHeight-dimension/2}px`;
    canvas.style.top=`${(.5-cy)*innerHeight-dimension/2}px`;
  }
  addEventListener('museum:exhibit',show);addEventListener('resize',place);
  preference.addEventListener('change',transition);
  transition();place();show();
})();
