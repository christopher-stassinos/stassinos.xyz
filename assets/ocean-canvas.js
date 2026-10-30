/* Lighter native Canvas renderer with the same seven moving ocean subjects. */
window.STASSINOS_OCEAN_FALLBACK = ({canvas,reduced,routeScene,inspector}) => {
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const {records,lookup}=window.STASSINOS_STUDIO.glyphBook();
  const palettes=Object.values(window.STASSINOS_EXHIBITS).sort((a,b)=>a.index-b.index).map(e=>e.palette.map(hex=>[1,3,5].map(o=>parseInt(hex.slice(o,o+2),16)/255)));
  const sin=Math.sin,cos=Math.cos,exp=Math.exp,pow=Math.pow,abs=Math.abs;
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const v=clamp((x-a)/(b-a));return v*v*(3-2*v);};
  const ridge=(x,k)=>exp(-x*x*k);
  const seed=new Float32Array(4096);for(let i=0;i<seed.length;i++){const v=sin(i*127.1+17.9)*43758.5453;seed[i]=v-Math.floor(v);}
  const noiseAt=(ix,iy)=>seed[((iy&63)*64)+(ix&63)];
  function noise(x,y){const a=Math.floor(x),b=Math.floor(y),fx=x-a,fy=y-b,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (noiseAt(a,b)*(1-u)+noiseAt(a+1,b)*u)*(1-v)+(noiseAt(a,b+1)*(1-u)+noiseAt(a+1,b+1)*u)*v;}
  function caustic(x,y,t){for(let i=0;i<2;i++){const nx=x+.48*sin(y*1.8+t*.57+i*1.7);y+=.48*cos(x*1.6-t*.49+i*2.3);x=nx;}return pow(1-Math.min(abs(sin(x*2.8+y*.7)),abs(sin(y*2.3-x*.6))),13);}
  function sea(x,z,t){const qx=x+sin(z*.33-t*.26)*.14,qz=z+cos(x*.29+t*.23)*.14;return sin(qx*.52+qz*.43-t*.72)*.34+sin(qx*.94-qz*.67+t*.93)*.19+sin(qx*1.85+qz*1.24-t*1.28)*.085+sin(qx*3.7-qz*2.5+t*1.65)*.035+sin(qx*6.1+qz*4.2-t*2.1)*.014;}
  function poolHeight(x,y,t){
    const qx=x+sin(y*6-t*.28)*.027,qy=y+cos(x*5+t*.23)*.027;
    const a=Math.hypot(qx+.16,(qy-.19)*.86),b=Math.hypot((qx-.30)*.94,qy+.24),c=Math.hypot(qx+.36,qy+.34);
    return sin(a*29-t*1.45)*.022*exp(-a*.85)+sin(b*23-t*1.15+.7)*.014*exp(-b*.95)+sin(c*17-t*.92)*.008*exp(-c*1.1)+sin(qx*48+qy*21-t*1.5)*.0025;
  }
  function sample(id,x,y,t,out){
    if(id===6)x+=(1-smooth(.65,1.05,width/height))*.11;
    const [a,b,c]=palettes[id];let ar=0,br=.035,cr=0,white=0;
    const n=noise(x*5+t*.04,y*7-t*.06);
    if(id===0){
      if(y>.13){ar=pow(n,4)*.10;cr=ridge(y-.13,95)*.16;white=0;br=.015;}
      else {const d=Math.min(70,1.55/Math.max(.015,.13-y)),px=x*d*1.12,pz=5-d*1.3,h=sea(px,pz,t),e=.055;
        const nx=(h-sea(px+e,pz,t))/e,nz=(h-sea(px,pz+e,t))/e,normal=Math.sqrt(nx*nx+nz*nz+1),lit=clamp((-.35*nx+.7-.6*nz)/normal);
        const flowX=px-t*.18,flowZ=pz+t*.075,lace=caustic(flowX*3.4,flowZ*3.4,t*.65),crest=smooth(.21,.49,h);
        br=(.20+lit*.70)*exp(-d*.009);cr=(.08+caustic(flowX*1.7,flowZ*1.7,t*.8)*.20)*exp(-d*.009);white=crest*(.28+lace*.72)*(.68+noise(flowX*3,flowZ*3)*.32)*.86+pow(clamp(lit),24)*.55;
        const moonX=.020+(.16-.020)*smooth(.65,1.05,width/height),depth=1-smooth(-.5,.13,y),spread=.025+(.14-.025)*depth,path=exp(-pow((x-moonX+nx/normal*.018)/spread,2));
        white+=path*(.025+pow(.5+.5*sin(pz*1.9+px*2.4-t*.72),6)*(.35+lace*.65)*.23)*smooth(0,.07,.13-y);
      }
    }else if(id===1){
      const sx=x*.92,sy=y*1.10,qx=sx*.96-sy*.28,qy=sx*.28+sy*.96,radius=Math.hypot(qx,qy),angle=Math.atan2(qy,qx),r=radius+sin(angle*2-t*.38)*.022+sin(angle*6+t*.52)*.009;
      const spiral=angle*3+Math.log(Math.max(.005,r)+.035)*7.4-t*.58+sin(r*17-t*.48)*.32,u=spiral/6.28318,phase=u-Math.floor(u),aa=clamp(width/height/cols*1.5/(radius+.035),.025,.18);
      const shoulder=pow(.5+.5*cos((phase-.35)*6.28318),2),front=1-smooth(.025,.105+aa,abs(phase-.5)),fx=cos(angle+t*.10)*(radius*18+t*.16),fy=sin(angle+t*.10)*(radius*18+t*.16);
      const lace=caustic(fx,fy,t*.55),fine=caustic(fx*1.8+t*.1,fy*1.8,t*.4),trail=smooth(.08,.28,phase)*(1-smooth(.42,.63,phase));
      const foam=front*(.57+lace*.43)+trail*(lace*.25+fine*.13),ring=pow(.5+.5*sin(r*86+angle*2-t*1.85),12),mask=(1-smooth(.44,.75,r))*smooth(.030,.12,r);
      br=(.13+shoulder*.30)*mask;cr=(lace*.10+ring*.12)*mask+ridge(r-.080-sin(angle*3-t*.58)*.007,26000)*.42;white=foam*.63*mask;
    }else if(id===2){
      const qx=x-.025,qy=y,h=poolHeight(qx,qy,t),e=.0045,nx=(h-poolHeight(qx+e,qy,t))/e,ny=(h-poolHeight(qx,qy+e,t))/e,norm=Math.sqrt(nx*nx+ny*ny+1);
      const light=clamp((nx*-.46+ny*.52+.72)/(norm*Math.hypot(-.46,.52,.72))),silver=pow(light,15);
      const fx=qx*5+nx/norm*1.1+t*.095,fy=qy*6.5+ny/norm*1.1-t*.075,lace=caustic(fx,fy,t*.48),fine=caustic(fx*1.7-t*.08,fy*1.7+t*.04,t*.35);
      const wx=qx+sin(qy*6-t*.28)*.027,wy=qy+cos(qx*5+t*.23)*.027,r=Math.hypot(wx+.16,(wy-.19)*.86),phase=r*4.615-t*.231,aa=Math.max(.025,4.615*width/height/cols*.65),crest=1-smooth(.045,.135+aa,abs(phase-Math.floor(phase)-.5));
      const rolling=pow(.5+.5*sin(phase*6.28318-.8),2),crossing=pow(.5+.5*sin(Math.hypot((wx-.30)*.94,wy+.24)*23-t*1.15+.7),10);
      const envelope=exp(-(qx*qx*1.15*1.15+qy*qy*.8*.8)*1.8);
      br=(.065+light*.18+rolling*.21+h*2.7)*envelope;cr=(lace*.18+fine*.06+crossing*.12)*envelope;white=(silver*.60+crest*(.38+lace*.22))*envelope;
    }else if(id===3){
      const qy=y-.17-sin(t*.42)*.025,pulse=1+sin(t*.95)*.075,bx=x/(.30*pulse),by=qy/(.185/pulse),angle=Math.atan2(by,bx),r=Math.hypot(bx,by)-cos(angle*14-t*.35)*.014;
      const lip=-.018+sin(x*39+t*.9)*.008,dome=smooth(lip-.009,lip+.012,qy),fill=(1-smooth(.86,1,r))*dome;
      const ribs=pow(.5+.5*cos(angle*20+sin(r*6-t*.8)*.4),9),mesh=caustic(bx*4,by*5+t*.25,t*.5),rings=pow(.5+.5*sin(r*38-t*2.2+cos(angle*4)*.7),13);
      const bell=ridge(r-1,470)*dome*.92+fill*(.10+ribs*.24+mesh*.10+rings*.09);br=bell*.64;cr=bell*.36+ridge(qy-lip,20000)*(1-smooth(.26,.31,abs(x)))*.7;
      ar=pow(.5+.5*cos(angle*4),7)*ridge(r-.35,45)*fill*.24;
      for(let i=0;i<3;i++){
        const dy=-qy-.012,p=clamp(dy/.58),center=(i-1)*.075+sin(dy*11-t*.93+i*1.8)*(.018+p*.035),thick=.018+sin(dy*27+t*.55+i)*.006;
        const sheet=(1-smooth(thick,thick+.008,abs(x-center)))*smooth(0,.04,dy)*(1-smooth(.42,.62,dy)),pleats=.5+.5*sin((x-center)*240+dy*20-t*1.4),lit=sheet*(.15+pow(pleats,4)*.33);br+=lit*.55;cr+=lit*.45;
      }
      for(let i=0;i<15;i++){
        const len=.40+seed[i]*.24,dy=-qy-.015,p=clamp(dy/len),xx=(i-7)*.029*(1-p*.35)+sin(dy*13-t*1.12+i*.47)*(.012+p*.055)+sin(dy*23+t*.61+i)*p*.016;
        const thick=.0045*(1-p)+.0018*p,aa=Math.max(.002,width/height/cols*.65),strand=(1-smooth(thick,thick+aa,abs(x-xx)))*(1-smooth(len*.8,len,dy))*smooth(-.005,.03,dy)*(.34+.35*pow(.5+.5*sin(dy*37-t*2.4+i),4));
        br+=strand*(.65-i*.032);cr+=strand*(.35+i*.032);
      }
    }else if(id===4){
      const qx=x-.015,qy=y-sin(t*.43)*.030,xx=abs(qx),mid=.075+pow(xx/.52,1.55)*(.14+sin(t*.87-xx*5)*.092),thick=.12*pow(Math.max(0,1-xx/.55),.65)+.004;
      const body=(1-smooth(thick*.82,thick,abs(qy-mid)))*(1-smooth(.51,.56,xx)),edge=ridge(abs(qy-mid)-thick*.88,22000)*(1-smooth(.5,.56,xx));
      const veins=caustic(qx*13-t*.11,(qy-mid)*22+t*.35,t*.7),fan=pow(.5+.5*cos(Math.atan2(qy+.02,xx+.025)*23+xx*8-t*.28),10),skin=pow(.5+.5*sin(qx*53+sin(qy*21+t*.4)*1.4-t*.8),11),membrane=body*(.26+veins*.30+fan*.15+skin*.07);
      br=membrane*.6+caustic(x*8+t*.18,y*12,t)*.1;cr=membrane*.4+edge*.77+(1-smooth(.6,1,Math.hypot(qx/.085,(qy-.065)/.17)))*.32;
      for(let i=0;i<2;i++){const side=i*2-1,hx=qx-side*.047,hy=(qy-.175)*.8;cr+=ridge(Math.hypot(hx,hy)-.026,23000)*smooth(.13,.18,qy)*.35;white+=ridge(Math.hypot(qx-side*.067,qy-.105),52000)*.75;const wake=-.23+sin(qx*7-t*.75+side)*.025+side*.06;cr+=ridge(qy-wake,15000)*exp(-qx*qx*8)*.10;}
      const ty=-qy+.035,tx=sin(t*.8+ty*9)*.025*ty*3;cr+=ridge(qx-tx,65000)*smooth(.03,.12,ty)*(1-smooth(.39,.49,ty))*.65;
    }else if(id===5){
      const top=.36-x*x*.45+sin(x*8+t*.25)*.014,fallWidth=.225+sin(y*8-t*.68)*.025,center=sin(y*5-t*.56)*.036+sin(y*11+t*.43)*.009,curtain=(1-smooth(fallWidth*.88,fallWidth,abs(x-center)))*smooth(-.31,-.245,y)*(1-smooth(top,top+.025,y)),u=(x-center)/fallWidth;
      const folds=.5+.5*sin(u*17+sin(y*8-t*.8)*1.7),strands=pow(.5+.5*sin(u*39+sin(y*10+t*.65)*1.4),6),drops=pow(.5+.5*sin(y*104+t*5.8+sin(u*13)*1.3),9),fold=caustic(u*5,y*10+t*1.6,t*.65);
      br=curtain*(.20+folds*.15+strands*.30+fold*.21+drops*.13)*.5;cr=br;
      for(let i=0;i<2;i++){const side=i*2-1,dx=x-side*.27-sin(y*8-t*.7+side)*.017,veil=ridge(dx,2800)*smooth(-.30,-.22,y)*(1-smooth(.28,.35,y));cr+=veil*(.09+.18*pow(.5+.5*sin(y*115+t*6.4+side*2),5));}
      const r=Math.hypot(x,(y+.315)*3.8),rp=r*15-t*.54,phase=rp-Math.floor(rp),aa=Math.max(.035,15/rows*.6),rings=(1-smooth(.025,.10+aa,abs(phase-.5)))*(1-smooth(.32,.49,r)),pool=caustic(x*17+t*.3,(y+.315)*3.8*17,t*.55)*(1-smooth(.30,.46,r));
      cr+=rings*.43+ridge(r-.38,6000)*.18+pool*.12;white=ridge(y-top,25000)*(1-smooth(.23,.27,abs(x)))*.7;cr+=n*ridge(y+.27,200)*(1-smooth(.22,.5,abs(x)))*.25;
    }else {
      const line=-.14+sin(y*3.4+.3)*.13+sin(y*7.7-t*.33)*.026,surge=sin(t*.48+y*1.4)*.070+sin(t*.81-y*3.2)*.018,d=x-line-surge,water=smooth(-.052,.035,d);
      const u=d*8.2-t*.34+sin(y*5-t*.54)*.22+sin(y*13+t*.38)*.07,phase=u-Math.floor(u),aa=Math.max(.035,8.2*width/height/cols*.65);
      const front=1-smooth(.035,.105+aa,abs(phase-.5)),shoulder=pow(.5+.5*cos((phase-.37)*6.28318),2),fx=d*11-t*.32,fy=y*14+sin(d*8-t*.4)*.32;
      const lace=caustic(fx,fy,t*.70),trail=smooth(.05,.24,phase)*(1-smooth(.39,.59,phase));
      const foam=(front*(.62+lace*.38)+trail*lace*.32)*exp(-Math.max(d,0)*1.6),edge=ridge(d,5200)*(.54+lace*.46);
      ar=(.02+noise(x*28,y*28+t*.03)*.025)*(1-water);br=(.09+shoulder*.24+caustic(x*8-t*.24,y*11+t*.08,t*.8)*.12)*water;
      cr=shoulder*.07*water+(foam*.76*water+edge*.55)*.30;white=(foam*.76*water+edge*.55)*.70;
      cr+=pow(Math.max(0,sin(d*42-t*.9+y*7)*cos(y*61+t*.65)),10)*water*(.08+trail*.18);
    }
    const brightness=id===1?1.20:id===2?1.20:id===3?1.45:id===4?1.55:id===5?1.30:id===6?1.65:1.08;
    const mask=(1-smooth(.55,1.15,abs(x)))*.95*brightness;
    out[0]=Math.max(0,(a[0]*ar+b[0]*br+c[0]*cr+white*.88+.003)*mask);
    out[1]=Math.max(0,(a[1]*ar+b[1]*br+c[1]*cr+white*.88+.009)*mask);
    out[2]=Math.max(0,(a[2]*ar+b[2]*br+c[2]*cr+white*.88+.015)*mask);
  }
  canvas.dataset.renderer='canvas2d-ocean-ascii';
  let width=0,height=0,cols=0,rows=0,cw=0,ch=0,detail=1,values,lastValues,snapshot=null;
  let current=routeScene()[0],previous=current,clock=0,changed=-10,last=0,lastDraw=0,raf=0,fps=30,perfAt=0,perfFrames=0,slow=0;
  const duration=window.STASSINOS_MOTION.duration/1000;
  function size(){width=canvas.width=innerWidth;height=canvas.height=innerHeight;cw=(width<760?7.2:8.5)*detail;ch=(width<760?11.1:12.5)*detail;cols=Math.ceil(width/cw);rows=Math.ceil(height/ch);values=new Float32Array(cols*rows*3);lastValues=new Float32Array(values.length);snapshot=null;canvas.dataset.grid=cols+'x'+rows;}
  function paint(t,blend){
    ctx.fillStyle='#020407';ctx.fillRect(0,0,width,height);ctx.font=`bold ${10.5*detail}px "Courier New",monospace`;ctx.textBaseline='top';
    const aspect=width/height,old=new Float32Array(3),next=new Float32Array(3);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const i=(y*cols+x)*3,px=((x+.5)/cols-.71)*aspect,py=.5-(y+.5)/rows;
      sample(current,px,py,t,next);
      if(blend<1){if(snapshot){for(let k=0;k<3;k++)old[k]=snapshot[i+k];}else sample(previous,px,py,t,old);}
      for(let k=0;k<3;k++)values[i+k]=blend<1?old[k]*(1-blend)+next[k]*blend:next[k];
      const value=values[i]*.2126+values[i+1]*.7152+values[i+2]*.0722,tone=clamp((pow(value,.78)-.045)*1.34);
      if(tone<.026)continue;
      const glyph=records[lookup[Math.floor(tone*255)]].char;
      const rgb=[0,1,2].map(k=>Math.round((1-exp(-pow(values[i+k],.62)*1.9))*255));
      ctx.fillStyle='rgb('+rgb.join(',')+')';ctx.fillText(glyph,x*cw,y*ch);
    }
    lastValues.set(values);
  }
  function tick(now){
    if(document.hidden){raf=0;last=0;return;}
    const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(!reduced.matches)clock+=dt;
    const interval=1000/30,delay=now-lastDraw;
    if(delay>=interval-.7||reduced.matches){
      lastDraw=now-(delay>interval?delay%interval:0);const selected=routeScene();
      if(selected[0]!==current){snapshot=clock-changed<duration?lastValues.slice():null;previous=current;current=selected[0];changed=clock;}
      const progress=reduced.matches?1:clamp((clock-changed)/duration),blend=progress*progress*(3-2*progress);
      paint(reduced.matches?18:clock,blend);if(progress>=1)snapshot=null;
      canvas.dataset.scene=selected[1];canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
      canvas.dataset.transition=progress<1?'mixing':'settled';canvas.dataset.renderedScene=String(current);canvas.dataset.motion=reduced.matches?'still':'flowing';
      if(!perfAt)perfAt=now;perfFrames++;
      if(now-perfAt>2500){fps=perfFrames*1000/(now-perfAt);canvas.dataset.fps=fps.toFixed(1);slow=fps<22?slow+1:0;perfAt=now;perfFrames=0;if(slow>=2&&detail<1.6){detail*=1.15;size();slow=0;}}
      if(inspector)inspector.textContent=reduced.matches?'Still ocean · Canvas 2D · '+selected[1]:`Ocean Canvas 2D · ${fps.toFixed(1)} fps · ${selected[1]}`;
    }
    if(!reduced.matches)raf=requestAnimationFrame(tick);
  }
  function wake(){if(reduced.matches)tick(performance.now());}
  addEventListener('hashchange',wake);addEventListener('museum:exhibit',wake);addEventListener('resize',()=>{size();wake();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(tick);});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(tick);});
  size();raf=requestAnimationFrame(tick);
};
