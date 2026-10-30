/* Live image-to-ASCII pipeline. Original code; visual tuning studied in ASCII Magic. */
(() => {
  'use strict';
  const ascii=`#version 300 es
  precision highp float;
  in vec2 uv;out vec4 frag;
  uniform sampler2D imageA,imageB,atlas,ramp;
  uniform vec2 grid;
  uniform vec4 edgeGlyphs;
  uniform float blend,time,exposure;
  float light(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
  float grade(float x){return clamp((pow(max(x,0.),.78)-.045)*1.34,0.,1.);}
  void main(){
    vec2 cell=floor(uv*grid),inside=fract(uv*grid),center=(cell+.5)/grid;
    vec4 sampleColor=mix(texture(imageA,center),texture(imageB,center),blend);
    vec3 color=sampleColor.rgb;
    float tone=grade(light(color));
    float dither=(fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453)-.5)*.022;
    float index=floor(texture(ramp,vec2(clamp(tone+dither,0.,1.),.5)).r*255.+.5);
    float edge=floor(sampleColor.a*5.+.5);
    if(edge>.5&&tone>.22&&tone<.88){
      index=edge<1.5?edgeGlyphs.x:edge<2.5?edgeGlyphs.y:edge<3.5?edgeGlyphs.z:edgeGlyphs.w;
    }
    vec2 at=vec2(mod(index,16.),floor(index/16.));
    float glyph=texture(atlas,(at+vec2(inside.x,1.-inside.y))/vec2(16.,6.)).r;
    vec3 ink=pow(max(mix(vec3(light(color)),color,1.06),vec3(0)),vec3(.62))*exposure;
    vec3 soft=mix(texture(imageA,uv).rgb,texture(imageB,uv).rgb,blend);
    vec3 bloom=max(soft-.50,vec3(0))*.045;
    vec3 paper=vec3(.006,.007,.011)+soft*.012;
    vec3 result=paper+ink*glyph*smoothstep(.025,.12,tone)+bloom;
    frag=vec4(vec3(1.)-exp(-result*1.40),1.);
  }`;
  let book;
  function glyphBook(){
    if(book)return book;
    const scratch=document.createElement('canvas');scratch.width=48;scratch.height=64;
    const c=scratch.getContext('2d',{willReadFrequently:true});
    c.font='bold 60px "Courier New",monospace';c.textAlign='center';c.textBaseline='middle';
    const records=Array.from({length:95},(_,i)=>{
      const char=String.fromCharCode(32+i);c.fillStyle='#000';c.fillRect(0,0,48,64);c.fillStyle='#fff';c.fillText(char,24,33);
      const pixels=c.getImageData(0,0,48,64).data;let ink=0;
      for(let p=0;p<pixels.length;p+=4)ink+=pixels[p]/255;
      return {char,ink:ink/(48*64)};
    }).sort((a,b)=>a.ink-b.ink||a.char.charCodeAt(0)-b.char.charCodeAt(0));
    const lookup=new Uint8Array(256),max=records.at(-1).ink;
    for(let value=0;value<256;value++){
      const target=value/255*max;let best=0,error=Infinity;
      records.forEach((g,index)=>{const gap=Math.abs(g.ink-target);if(gap<error){best=index;error=gap;}});lookup[value]=best;
    }
    const edges=['|','-','/','\\'].map(char=>records.findIndex(g=>g.char===char));
    book={records,lookup,edges};return book;
  }
  function makeAtlas(gl){
    const data=glyphBook(),canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;
    const c=canvas.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,768,384);c.fillStyle='#fff';
    c.font='bold 60px "Courier New",monospace';c.textAlign='center';c.textBaseline='middle';
    data.records.forEach((g,i)=>c.fillText(g.char,(i%16)*48+24,Math.floor(i/16)*64+33));
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const pixels=new Uint8Array(256*4);data.lookup.forEach((v,i)=>{pixels[i*4]=v;pixels[i*4+3]=255;});
    const ramp=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,ramp);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return {atlas:texture,ramp,edges:data.edges};
  }
  window.STASSINOS_STUDIO={ascii,makeAtlas,glyphBook};
})();
