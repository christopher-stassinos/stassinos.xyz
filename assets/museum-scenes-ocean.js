/* Shared scene clock, fixed camera, and transitions for the procedural ocean worlds. */
(() => {
  'use strict';
  const start = async () => {
  const canvas = document.getElementById('museum-background');
  if (!canvas) return;
  if (new URLSearchParams(location.search).has('artwork')) document.documentElement.classList.add('artwork-view');

  const exhibits=window.STASSINOS_EXHIBITS;
  const palettes=Object.values(exhibits).sort((a,b)=>a.index-b.index).map(exhibit=>exhibit.palette.map(hex=>[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16)/255)));
  const scenes=Object.fromEntries(Object.entries(exhibits).map(([route,exhibit])=>[route,[exhibit.index,exhibit.title]]));
  const aliases = {overview:'home', experience:'bot', credentials:'memory', education:'history', projects:'trajectory', labs:'trajectory', skills:'metrics', contact:'console'};
  const routeScene = () => {
    const route = location.hash.replace(/^#\/?/, '').split('/')[0];
    return scenes[aliases[route] || route] || scenes.home;
  };
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const stillRequested = new URLSearchParams(location.search).get('motion') === 'still';
  const reduced = {
    get matches() {return stillRequested || motionPreference.matches;},
    addEventListener: motionPreference.addEventListener.bind(motionPreference),
  };
  const inspector=new URLSearchParams(location.search).get('inspect-motion')==='1'?document.createElement('output'):null;
  if(inspector){
    inspector.setAttribute('role','status');
    inspector.style.cssText='position:fixed;z-index:2147483646;bottom:12px;left:12px;max-width:calc(100vw - 24px);padding:10px 12px;background:#10110ff5;color:#eee8dc;border:1px solid #777265;font:12px/1.6 monospace;pointer-events:none';
    inspector.textContent='Preparing animation';document.body.appendChild(inspector);
  }
  const vertex = `#version 300 es
    precision highp float;
    out vec2 uv;
    void main() {
      vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
      uv=p;
      gl_Position=vec4(p*2.-1.,0.,1.);
    }`;

  const sculptureShader = window.STASSINOS_OCEAN_SHADER;

  const blendShader = `#version 300 es
    precision highp float;
    in vec2 uv;out vec4 frag;
    uniform sampler2D imageA;uniform sampler2D imageB;uniform float blend;
    void main(){frag=mix(texture(imageA,uv),texture(imageB,uv),blend);}`;

  const asciiShader = window.STASSINOS_STUDIO.ascii;

  const canvasOnly=new URLSearchParams(location.search).get('renderer')==='canvas2d';
  const gl = canvasOnly?null:canvas.getContext('webgl2', {alpha:false, antialias:false, powerPreference:'low-power', preserveDrawingBuffer:false});
  if (!gl) {fallback();return;}
  let disposed = false;
  const programs = [];
  function compile(type, source) {
    const shader = gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(error);}
    return shader;
  }
  function program(fragment) {
    const p=gl.createProgram(),v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
    if (!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    programs.push(p);return p;
  }
  let sculpture,blendProgram,ascii;
  try {sculpture=program(sculptureShader);blendProgram=program(blendShader);ascii=program(asciiShader);}
  catch(error){console.error('Museum scene renderer:',error.message);canvas.dataset.renderer='unavailable';if(inspector)inspector.textContent=`Renderer unavailable: ${error.message}`;return;}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const locationCache=new Map();
  function uniform(p,name){const key=programs.indexOf(p)+':'+name;if(!locationCache.has(key))locationCache.set(key,gl.getUniformLocation(p,name));return locationCache.get(key);}
  function scalar(p,name,value){gl.uniform1f(uniform(p,name),value);}
  function textureAt(p,name,texture,unit){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(uniform(p,name),unit);}

  const {atlas,ramp,edges:edgeGlyphs}=window.STASSINOS_STUDIO.makeAtlas(gl);
  let targets=[],columns=0,rows=0;
  let active=routeScene()[0],pending=active,previousScene=active,holdSnapshot=false;
  let elapsed=0,lastTime=0,lastDraw=0,transitionAt=-10,transitioning=false;
  let pointerX=0,pointerY=0,targetX=0,targetY=0,scrollPosition=0,scrollTarget=0;
  let raf=0,frameCount=0;
  let detailLevel=0,frameRate=60,measuredFPS=0,perfAt=0,perfFrames=0,slowWindows=0;
  const detailScale=[1,.86,.72];
  const duration=window.STASSINOS_MOTION.duration/1000;
  const interfaceRoot=document.querySelector('.museum-app');
  canvas.dataset.renderer='webgl2-ascii';canvas.dataset.scene=routeScene()[1];

  function target(width=columns,height=rows) {
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Museum render target unavailable');
    return {texture,framebuffer,width,height};
  }
  function clearTargets(group){group.forEach(t=>{gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);});}
  function resize() {
    const width=innerWidth,height=innerHeight;
    const mobile=width<760,dpr=Math.min(devicePixelRatio||1,mobile?1.5:1.6);
    const backingWidth=Math.round(width*dpr),backingHeight=Math.round(height*dpr);
    if(canvas.width!==backingWidth||canvas.height!==backingHeight){canvas.width=backingWidth;canvas.height=backingHeight;}
    const detail=detailScale[detailLevel];
    columns=Math.min(mobile?128:380,Math.max(48,Math.round(width/(mobile?5.6:6.3)*detail)));
    rows=Math.min(196,Math.max(36,Math.round(height/(mobile?9.3:9.8)*detail)));
    clearTargets(targets);
    targets=[target(),target(),target()];transitioning=false;
    canvas.dataset.grid=`${columns}x${rows}`;
    if(reduced.matches) draw(performance.now());
  }
  function progress() {const p=Math.max(0,Math.min(1,(elapsed-transitionAt)/duration));return p*p*(3.-2.*p);}
  function snapshot(group=targets) {
    if(!group.length)return;
    gl.bindFramebuffer(gl.FRAMEBUFFER,group[2].framebuffer);gl.viewport(0,0,group[2].width,group[2].height);gl.useProgram(blendProgram);
    textureAt(blendProgram,'imageA',group[1].texture,0);textureAt(blendProgram,'imageB',group[0].texture,1);
    scalar(blendProgram,'blend',transitioning?progress():1.);gl.drawArrays(gl.TRIANGLES,0,3);
    const previous=group[1];group[1]=group[2];group[2]=previous;
  }
  function renderSculpture(id,target,viewAspect=innerWidth/innerHeight,framing=.15) {
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);gl.viewport(0,0,target.width,target.height);gl.useProgram(sculpture);
    scalar(sculpture,'time',reduced.matches?18:elapsed);scalar(sculpture,'aspect',viewAspect);scalar(sculpture,'framing',framing);scalar(sculpture,'scroll',scrollPosition);
    gl.uniform2f(uniform(sculpture,'pointer'),pointerX,pointerY);gl.uniform1i(uniform(sculpture,'scene'),id);
    gl.uniform3fv(uniform(sculpture,'prismA'),palettes[id][0]);
    gl.uniform3fv(uniform(sculpture,'prismB'),palettes[id][1]);
    gl.uniform3fv(uniform(sculpture,'prismC'),palettes[id][2]);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function renderAscii(group,width,height,cols,rows,exposure=1){
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.useProgram(ascii);
    textureAt(ascii,'imageA',group[1].texture,0);textureAt(ascii,'imageB',group[0].texture,1);textureAt(ascii,'atlas',atlas,2);textureAt(ascii,'ramp',ramp,3);
    gl.uniform4fv(uniform(ascii,'edgeGlyphs'),edgeGlyphs);
    gl.uniform2f(uniform(ascii,'grid'),cols,rows);scalar(ascii,'time',reduced.matches?18:elapsed);scalar(ascii,'blend',transitioning?progress():1.);scalar(ascii,'exposure',exposure);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function draw(now) {
    if(disposed||document.hidden)return;
    const dt=lastTime?Math.min(.1,(now-lastTime)/1000):0;lastTime=now;
    if(!reduced.matches)elapsed+=dt;
    pointerX+=(targetX-pointerX)*(1.-Math.exp(-dt*2));pointerY+=(targetY-pointerY)*(1.-Math.exp(-dt*2));
    scrollPosition+=(scrollTarget-scrollPosition)*(1.-Math.exp(-dt*2));
    if(pending!==active){holdSnapshot=transitioning;snapshot();previousScene=active;active=pending;transitionAt=elapsed;transitioning=!reduced.matches;}
    if(transitioning&&!holdSnapshot)renderSculpture(previousScene,targets[1]);
    renderSculpture(active,targets[0]);
    renderAscii(targets,canvas.width,canvas.height,columns,rows,1.55);
    if(transitioning&&elapsed-transitionAt>=duration)transitioning=false;
    canvas.dataset.transition=transitioning?'mixing':'settled';
    canvas.dataset.renderedScene=String(active);
    canvas.dataset.motion=reduced.matches?'still':'flowing';
    canvas.dataset.frames=String(++frameCount);
    monitor();
    if(interfaceRoot&&frameCount%4===0){
      const phase=(reduced.matches?18:elapsed)*[.24,.36,.43,.22,.24,.24,.28][active];
      interfaceRoot.style.setProperty('--ambient-x',`${55+Math.sin(phase)*27}%`);
      interfaceRoot.style.setProperty('--ambient-y',`${24+Math.cos(phase*.6)*14}%`);
    }
  }
  function monitor(){
    if(reduced.matches){if(inspector)inspector.textContent=`Still scene · ${columns} × ${rows} · ${routeScene()[1]}`;return;}
    const now=performance.now();
    if(!perfAt)perfAt=now;
    perfFrames++;
    if(now-perfAt<2500)return;
    measuredFPS=perfFrames*1000/(now-perfAt);
    canvas.dataset.fps=measuredFPS.toFixed(1);
    slowWindows=measuredFPS<frameRate*.78?slowWindows+1:0;
    // Keep the same scene and clock, reducing sampling only if sustained load needs it.
    if(slowWindows>=2&&!transitioning){
      if(detailLevel<detailScale.length-1){detailLevel++;resize();}
      else if(frameRate===60)frameRate=30;
      slowWindows=0;
    }
    if(inspector)inspector.textContent=`Animation ${measuredFPS.toFixed(1)} fps · ${columns} × ${rows} · ${routeScene()[1]}`;
    perfAt=now;perfFrames=0;
  }
  function loop(now) {
    if(document.hidden||disposed){raf=0;return;}
    const interval=1000/frameRate,delay=now-lastDraw;
    if(delay>=interval-.7){lastDraw=now-(delay>interval?delay%interval:0);draw(now);}
    if(!reduced.matches)raf=requestAnimationFrame(loop);else raf=0;
  }
  function routeChanged(){const selected=routeScene();pending=selected[0];canvas.dataset.scene=selected[1];if(reduced.matches)draw(performance.now());}
  addEventListener('hashchange',routeChanged);
  addEventListener('museum:exhibit',routeChanged);
  addEventListener('museum:scroll',event=>{scrollTarget=event.detail.position;});
  addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*2;targetY=(.5-e.clientY/innerHeight)*2;},{passive:true});
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{perfAt=0;perfFrames=0;slowWindows=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTime=0;}else if(!raf){lastTime=0;raf=requestAnimationFrame(loop);}});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);lastTime=0;raf=requestAnimationFrame(loop);});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(raf);});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  resize();raf=requestAnimationFrame(loop);

  function fallback(){
    window.STASSINOS_OCEAN_FALLBACK({canvas,reduced,routeScene,inspector});
  }
  };
  requestAnimationFrame(() => {setTimeout(start,0);});
})();
