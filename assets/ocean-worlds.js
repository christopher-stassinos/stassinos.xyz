/* Seven original, continuously deforming water scenes. No image plates or star maps. */
window.STASSINOS_OCEAN_SHADER = `#version 300 es
precision highp float;
in vec2 uv; out vec4 frag;
uniform float time,aspect,framing,scroll;
uniform vec2 pointer;
uniform int scene;
uniform vec3 prismA,prismB,prismC;
const float PI=3.14159265359;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
float fbm(vec2 p){return noise(p)*.55+noise(p*2.03+7.4)*.28+noise(p*4.13+13.8)*.17;}
float ridge(float x,float sharpness){return exp(-x*x*sharpness);}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float caustic(vec2 p,float t){
  vec2 q=p;
  for(int i=0;i<3;i++){float f=float(i);q+=.48*vec2(sin(q.y*1.8+t*.57+f*1.7),cos(q.x*1.6-t*.49+f*2.3));}
  float a=abs(sin(q.x*2.8+q.y*.7)),b=abs(sin(q.y*2.3-q.x*.6));
  return pow(max(0.,1.-min(a,b)),13.);
}
vec3 deep(vec2 p,float t){
  float n=fbm(p*3.+vec2(t*.04,-t*.06));
  float shaft=pow(max(0.,sin(p.x*8.+p.y*1.8+sin(t*.23)*.32)),9.);
  vec3 c=mix(vec3(.004,.012,.023),prismB*.085,n);
  c+=prismC*shaft*.035*smoothstep(-.5,.6,p.y);
  // Small suspended water motes, advected independently of the fixed viewpoint.
  vec2 v=p*vec2(33.,46.)+vec2(sin(t*.19)*.6,t*.48),cell=floor(v),local=fract(v)-.5;
  float mote=step(.975,hash(cell))*exp(-dot(local,local)*50.);
  return c+prismC*mote*.14;
}
float seaHeight(vec2 p,float t){
  // Long swells carry the short waves, rather than moving a noisy texture.
  vec2 q=p+vec2(sin(p.y*.33-t*.26),cos(p.x*.29+t*.23))*.14;
  float a=sin(q.x*.52+q.y*.43-t*.72);
  float b=sin(q.x*.94-q.y*.67+t*.93);
  float c=sin(q.x*1.85+q.y*1.24-t*1.28);
  float chop=sin(q.x*3.7-q.y*2.5+t*1.65);
  return a*.34+b*.19+c*.085+chop*.035+sin(q.x*6.1+q.y*4.2-t*2.1)*.014;
}
vec3 openSea(vec2 p,float t){
  vec3 ro=vec3(0,1.55,5.);
  vec3 rd=normalize(vec3(p.x*1.12,p.y-.13,-1.3));
  vec3 lightDir=normalize(vec3(-.35,.7,-.6));
  vec3 sky=mix(vec3(.009,.018,.031),prismB*.10,smoothstep(.0,.6,p.y));
  sky+=prismC*.16*ridge(p.y-.13,95.);
  float clouds=fbm(vec2(p.x*4.-t*.04,p.y*9.+t*.018));
  sky+=prismA*pow(clouds,4.)*.10;
  if(rd.y>-.008)return sky;
  float d=clamp(-ro.y/rd.y,0.,70.);
  for(int i=0;i<9;i++){vec3 q=ro+rd*d;d+=clamp((q.y-seaHeight(q.xz,t))/max(.08,-rd.y),-2.,2.)*.58;}
  vec3 q=ro+rd*d;
  float e=.055,h=seaHeight(q.xz,t);
  vec3 normal=normalize(vec3(h-seaHeight(q.xz+vec2(e,0),t),e,h-seaHeight(q.xz+vec2(0,e),t)));
  float diffuse=max(0.,dot(normal,lightDir));
  float fresnel=pow(1.-max(0.,dot(normal,-rd)),3.);
  float glint=pow(max(0.,dot(reflect(rd,normal),lightDir)),24.);
  vec2 flow=q.xz+vec2(-t*.18,t*.075);
  float ripple=caustic(flow*1.7+normal.xz,t*.8);
  float crest=smoothstep(.21,.49,h);
  float lace=caustic(flow*3.4+vec2(normal.x*.6,normal.z*.4),t*.65);
  float foam=crest*(.28+lace*.72)*(.68+.32*fbm(flow*3.));
  vec3 c=mix(vec3(.009,.040,.065),prismB*.68,diffuse)*(.6+diffuse*.65);
  c+=prismC*(fresnel*.28+ripple*.20)+vec3(.95,.98,.91)*glint*.95;
  c=mix(c,vec3(.81,.97,.94),foam*.86);
  c+=prismC*crest*lace*.13;
  // A restrained, broken reflection joins the crescent to the moving water.
  float moonX=mix(.020,.16,smoothstep(.65,1.05,aspect));
  float depth=1.-smoothstep(-.5,.13,p.y),spread=mix(.025,.14,depth);
  float path=exp(-pow((p.x-moonX+normal.x*.018)/spread,2.));
  float reflection=pow(.5+.5*sin(q.z*1.9+q.x*2.4-t*.72),6.)*(.35+lace*.65);
  c+=vec3(.88,.91,.84)*path*(.025+reflection*.23)*smoothstep(0.,.07,.13-p.y);
  c=mix(c,sky,1.-exp(-d*.018));
  return c;
}
// Experience uses the approved whirlpool's flow and foam with broader arms.
vec3 spiralCurrent(vec2 p,float t){
  vec2 s=p*vec2(.92,1.10),q=vec2(s.x*.96-s.y*.28,s.x*.28+s.y*.96);
  float radius=length(q),a=atan(q.y,q.x);
  float r=radius+sin(a*2.-t*.38)*.022+sin(a*6.+t*.52)*.009;
  float spiral=a*3.+log(max(.005,r)+.035)*7.4-t*.58+sin(r*17.-t*.48)*.32;
  float phase=fract(spiral/6.28318),aa=min(.18,max(.025,fwidth(spiral/6.28318)*.6));
  float shoulder=pow(.5+.5*cos((phase-.35)*6.28318),2.);
  float front=1.-smoothstep(.025,.105+aa,abs(phase-.5));
  vec2 flow=vec2(cos(a+t*.10),sin(a+t*.10))*(radius*18.+t*.16);
  float lace=caustic(flow,t*.55),fine=caustic(flow*1.8+vec2(t*.1,0),t*.4);
  float trail=smoothstep(.08,.28,phase)*(1.-smoothstep(.42,.63,phase));
  float foam=front*(.57+lace*.43)+trail*(lace*.25+fine*.13);
  float ring=pow(.5+.5*sin(r*86.+a*2.-t*1.85),12.);
  float mask=1.-smoothstep(.44,.75,r),eye=smoothstep(.030,.12,r);
  vec3 color=deep(p,t)*.6;
  color+=(prismB*(.13+shoulder*.30)+prismC*(lace*.10+ring*.12)+vec3(.83,.97,.95)*foam*.63)*mask*eye;
  color+=prismC*ridge(r-.080-sin(a*3.-t*.58)*.007,26000.)*.42;
  return color;
}
// Overhead water relief: intersecting ripples refract light rather than orbiting an eye.
float poolHeight(vec2 p,float t){
  vec2 q=p+vec2(sin(p.y*6.-t*.28),cos(p.x*5.+t*.23))*.027;
  float a=length((q-vec2(-.16,.19))*vec2(1.,.86));
  float b=length((q-vec2(.30,-.24))*vec2(.94,1.));
  float c=length(q-vec2(-.36,-.34));
  return sin(a*29.-t*1.45)*.022*exp(-a*.85)
    +sin(b*23.-t*1.15+.7)*.014*exp(-b*.95)
    +sin(c*17.-t*.92)*.008*exp(-c*1.1)
    +sin(q.x*48.+q.y*21.-t*1.5)*.0025;
}
vec3 glassTide(vec2 p,float t){
  vec2 q=p-vec2(.025,0.);
  float h=poolHeight(q,t),e=.0045;
  vec3 normal=normalize(vec3((h-poolHeight(q+vec2(e,0),t))/e,(h-poolHeight(q+vec2(0,e),t))/e,1.));
  float light=max(0.,dot(normal,normalize(vec3(-.46,.52,.72))));
  float silver=pow(light,15.);
  // The caustic cells stretch with the wave normal; highlights follow the water.
  vec2 flow=q*vec2(5.,6.5)+normal.xy*1.1+vec2(t*.095,-t*.075);
  float lace=caustic(flow,t*.48),fine=caustic(flow*1.7+vec2(-t*.08,t*.04),t*.35);
  vec2 wave=q+vec2(sin(q.y*6.-t*.28),cos(q.x*5.+t*.23))*.027;
  float r=length((wave-vec2(-.16,.19))*vec2(1.,.86));
  float phase=r*4.615-t*.231,aa=max(.025,fwidth(phase)*.65);
  float crest=1.-smoothstep(.045,.135+aa,abs(fract(phase)-.5));
  float rolling=pow(.5+.5*sin(phase*6.28318-.8),2.);
  float crossing=pow(.5+.5*sin(length((wave-vec2(.30,-.24))*vec2(.94,1.))*23.-t*1.15+.7),10.);
  float envelope=exp(-dot(q*vec2(1.15,.8),q*vec2(1.15,.8))*1.8);
  vec3 color=deep(p,t)*.65;
  color+=(prismB*(.065+light*.18+rolling*.21+h*2.7)+prismC*(lace*.18+fine*.06+crossing*.12)
    +vec3(.90,.97,.92)*(silver*.60+crest*(.38+lace*.22)))*envelope;
  return color;
}
vec3 medusa(vec2 p,float t){
  vec3 c=deep(p,t);vec2 q=p-vec2(0,.17+sin(t*.42)*.025);
  float pulse=1.+sin(t*.95)*.075;
  vec2 bell=q/vec2(.30*pulse,.185/pulse);
  float angle=atan(bell.y,bell.x),radius=length(bell)-cos(angle*14.-t*.35)*.014;
  float lipY=-.018+sin(q.x*39.+t*.9)*.008;
  float dome=smoothstep(lipY-.009,lipY+.012,q.y);
  float rim=ridge(radius-1.,470.)*dome;
  float ribs=pow(.5+.5*cos(angle*20.+sin(radius*6.-t*.8)*.4),9.);
  float fill=(1.-smoothstep(.86,1.,radius))*dome;
  float mesh=caustic(bell*vec2(4.,5.)+vec2(0,t*.25),t*.5);
  float rings=pow(.5+.5*sin(radius*38.-t*2.2+cos(angle*4.)*.7),13.);
  float organs=pow(.5+.5*cos(angle*4.),7.)*ridge(radius-.35,45.);
  c+=mix(prismB,prismC,.36)*(rim*.92+fill*(.10+ribs*.24+mesh*.10+rings*.09));
  c+=prismA*organs*fill*.24;
  c+=prismC*ridge(q.y-lipY,20000.)*(1.-smoothstep(.26,.31,abs(q.x)))*.7;
  // Broad folded oral arms move independently of the finer trailing filaments.
  for(int i=0;i<3;i++){
    float f=float(i),y=-q.y-.012,progress=clamp(y/.58,0.,1.);
    float center=(f-1.)*.075+sin(y*11.-t*.93+f*1.8)*(.018+progress*.035);
    float width=.018+sin(y*27.+t*.55+f)*.006;
    float sheet=(1.-smoothstep(width,width+.008,abs(q.x-center)))*smoothstep(0.,.04,y)*(1.-smoothstep(.42,.62,y));
    float pleats=.5+.5*sin((q.x-center)*240.+y*20.-t*1.4);
    c+=mix(prismB,prismC,.45)*sheet*(.15+pow(pleats,4.)*.33);
  }
  for(int i=0;i<15;i++){
    float f=float(i),lengthT=.40+hash(vec2(f,1.))*.24;
    float y=-q.y-.015,progress=clamp(y/lengthT,0.,1.);
    float x=(f-7.)*.029*(1.-progress*.35)+sin(y*13.-t*1.12+f*.47)*(.012+progress*.055);
    x+=sin(y*23.+t*.61+f)*progress*.016;
    float strandWidth=mix(.0045,.0018,progress),aa=max(.002,fwidth(q.x)*.65);
    float strand=(1.-smoothstep(strandWidth,strandWidth+aa,abs(q.x-x)))*(1.-smoothstep(lengthT*.8,lengthT,y))*smoothstep(-.005,.03,y);
    c+=mix(prismB,prismC,.35+f*.032)*strand*(.34+.35*pow(.5+.5*sin(y*37.-t*2.4+f),4.));
  }
  return c;
}
vec3 manta(vec2 p,float t){
  vec3 c=deep(p,t);vec2 q=p-vec2(.015,sin(t*.43)*.030);
  float x=abs(q.x),fin=sin(t*.87-x*5.)*.092;
  float mid=.075+pow(x/.52,1.55)*(.14+fin);
  float thick=.12*pow(max(0.,1.-x/.55),.65)+.004;
  float body=1.-smoothstep(thick*.82,thick,abs(q.y-mid));body*=1.-smoothstep(.51,.56,x);
  float edge=ridge(abs(q.y-mid)-thick*.88,22000.)*(1.-smoothstep(.50,.56,x));
  float veins=caustic(vec2(q.x*13.-t*.11,(q.y-mid)*22.+t*.35),t*.7);
  float fan=pow(.5+.5*cos(atan(q.y+.02,x+.025)*23.+x*8.-t*.28),10.);
  float skin=pow(.5+.5*sin(q.x*53.+sin(q.y*21.+t*.4)*1.4-t*.8),11.);
  c+=mix(prismB,prismC,.4)*body*(.26+veins*.30+fan*.15+skin*.07)+prismC*edge*.77;
  float central=length((q-vec2(0,.065))/vec2(.085,.17));
  c+=prismC*(1.-smoothstep(.6,1.,central))*.32;
  for(int i=0;i<2;i++){
    float side=float(i)*2.-1.;
    vec2 horn=(q-vec2(side*.047,.175))*vec2(1.,.8);
    c+=prismC*ridge(length(horn)-.026,23000.)*smoothstep(.13,.18,q.y)*.35;
    c+=vec3(.87,.96,1.)*ridge(length(q-vec2(side*.067,.105)),52000.)*.75;
    float wakeY=-.23+sin(q.x*7.-t*.75+side)*.025+side*.06;
    c+=prismC*ridge(q.y-wakeY,15000.)*exp(-q.x*q.x*8.)*.10;
  }
  float tailY=-q.y+.035,tailX=sin(t*.8+tailY*9.)*.025*tailY*3.;
  c+=prismC*ridge(q.x-tailX,65000.)*smoothstep(.03,.12,tailY)*(1.-smoothstep(.39,.49,tailY))*.65;
  // Travelling sheets of refracted light beneath the animal.
  c+=prismB*caustic(p*vec2(8.,12.)+vec2(t*.18,0),t)*.10;
  return c;
}
vec3 cascade(vec2 p,float t){
  vec3 c=deep(p,t)*.8;
  float top=.36-p.x*p.x*.45+sin(p.x*8.+t*.25)*.014;
  float bottom=-.28;
  float width=.225+sin(p.y*8.-t*.68)*.025;
  float center=sin(p.y*5.-t*.56)*.036+sin(p.y*11.+t*.43)*.009;
  float curtain=(1.-smoothstep(width*.88,width,abs(p.x-center)))*smoothstep(bottom-.03,bottom+.035,p.y)*(1.-smoothstep(top,top+.025,p.y));
  float u=(p.x-center)/width;
  float folds=.5+.5*sin(u*17.+sin(p.y*8.-t*.8)*1.7);
  float strands=pow(.5+.5*sin(u*39.+sin(p.y*10.+t*.65)*1.4),6.);
  float drops=pow(.5+.5*sin(p.y*104.+t*5.8+sin(u*13.)*1.3),9.);
  float fold=caustic(vec2(u*5.,p.y*10.+t*1.6),t*.65);
  c+=mix(prismB,prismC,.5)*curtain*(.20+folds*.15+strands*.30+fold*.21+drops*.13);
  for(int i=0;i<2;i++){
    float side=float(i)*2.-1.,dx=p.x-side*.27-sin(p.y*8.-t*.7+side)*.017;
    float veil=ridge(dx,2800.)*smoothstep(-.30,-.22,p.y)*(1.-smoothstep(.28,.35,p.y));
    c+=prismC*veil*(.09+.18*pow(.5+.5*sin(p.y*115.+t*6.4+side*2.),5.));
  }
  c+=vec3(.83,.96,.91)*ridge(p.y-top,25000.)*(1.-smoothstep(.23,.27,abs(p.x)))*.7;
  vec2 basin=(p-vec2(0,-.315))*vec2(1.,3.8);float r=length(basin);
  float phase=fract(r*15.-t*.54),aa=max(.035,fwidth(r*15.)*.6);
  float rings=(1.-smoothstep(.025,.10+aa,abs(phase-.5)))*(1.-smoothstep(.32,.49,r));
  float pool=caustic(basin*17.+vec2(t*.3,0),t*.55)*(1.-smoothstep(.30,.46,r));
  c+=prismC*(rings*.43+ridge(r-.38,6000.)*.18+pool*.12);
  float mist=fbm(p*vec2(11.,30.)+vec2(-t*.3,t*.5))*ridge(p.y+.27,200.);
  c+=prismC*mist*.25*(1.-smoothstep(.22,.5,abs(p.x)));
  return c;
}
vec3 shore(vec2 p,float t){
  vec3 c=deep(p,t);
  float line=-.14+sin(p.y*3.4+.3)*.13+sin(p.y*7.7-t*.33)*.026;
  float surge=sin(t*.48+p.y*1.4)*.070+sin(t*.81-p.y*3.2)*.018;
  float d=p.x-line-surge;
  float water=smoothstep(-.052,.035,d);
  float sand=fbm(p*28.+vec2(0,t*.03));
  c+=prismA*(.02+sand*.025)*(1.-water);
  // Broad rolling shoulders, followed by two scales of stretching foam lace.
  float u=d*8.2-t*.34+sin(p.y*5.-t*.54)*.22+sin(p.y*13.+t*.38)*.07;
  float phase=fract(u),aa=max(.035,fwidth(u)*.65);
  float front=1.-smoothstep(.035,.105+aa,abs(phase-.5));
  float shoulder=pow(.5+.5*cos((phase-.37)*6.28318),2.);
  vec2 flow=vec2(d*11.-t*.32,p.y*14.+sin(d*8.-t*.4)*.32);
  float lace=caustic(flow,t*.70);
  float smallLace=caustic(flow*1.85+vec2(t*.11,-t*.06),t*.55);
  float trail=smoothstep(.05,.24,phase)*(1.-smoothstep(.39,.59,phase));
  float foam=(front*(.62+lace*.38)+trail*lace*.24+trail*smallLace*.13)*exp(-max(d,0.)*1.6);
  float edge=ridge(d,5200.)*(.54+lace*.46);
  float caustics=caustic(p*vec2(8.,11.)+vec2(-t*.24,t*.08),t*.8);
  c+=(prismB*(.09+shoulder*.24+caustics*.12)+prismC*shoulder*.07)*water;
  c+=mix(vec3(.86,.98,.95),prismC,.30)*(foam*.76*water+edge*.55);
  float glow=pow(max(0.,sin(d*42.-t*.9+p.y*7.)*cos(p.y*61.+t*.65)),10.);
  c+=prismC*glow*water*(.08+trail*.18);
  return c;
}
void main(){
  vec2 p=(uv-vec2(.5+framing+.06,.5))*vec2(aspect,1.);
  p+=vec2(pointer.x*.003,-pointer.y*.002+scroll*.004);
  if(scene==6)p.x+=(1.-smoothstep(.65,1.05,aspect))*.11;
  vec3 color;
  if(scene==0)color=openSea(p,time);
  else if(scene==1)color=spiralCurrent(p,time);
  else if(scene==2)color=glassTide(p,time);
  else if(scene==3)color=medusa(p,time);
  else if(scene==4)color=manta(p,time);
  else if(scene==5)color=cascade(p,time);
  else color=shore(p,time);
  float brightness=scene==1?1.20:scene==2?1.20:scene==3?1.45:scene==4?1.55:scene==5?1.30:scene==6?1.65:1.08;
  color*=brightness*(1.-smoothstep(.55,1.15,abs(p.x)));
  color*=1.-.25*dot(uv-.5,uv-.5);
  float value=lum(color),gx=dFdx(value),gy=dFdy(value),edge=0.;
  if(length(vec2(gx,gy))>.13&&value>.07&&value<.8)edge=abs(gx)>abs(gy)*1.7?1.:abs(gy)>abs(gx)*1.7?2.:gx*gy<0.?3.:4.;
  frag=vec4(max(color,vec3(0)),edge*.2);
}`;
