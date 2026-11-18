import {convIng,convTemp,scaleQty,AISLES,aisle} from './utils.js'
const rr=(x,a,b,w,h,r,fill,stroke)=>{x.beginPath();x.roundRect(a,b,w,h,r);if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=2;x.stroke()}}
const loadImg=src=>new Promise(res=>{if(!src)return res(null);const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})
const wrap=(x,text,max)=>{const out=[];let line='';String(text).split(/\s+/).filter(Boolean).forEach(w=>{const t=line?line+' '+w:w;if(x.measureText(t).width>max&&line){out.push(line);line=w}else line=t});if(line)out.push(line);return out}
// Draws the whole recipe (every ingredient and every step). The canvas grows to fit, so nothing is cut off.
function draw(r,f,u,t,img,logo,H){
  const W=1000,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d')
  x.fillStyle='#E8D8CE';x.fillRect(0,0,W,H);rr(x,50,50,W-100,H-100,36,'#FBF7F4','#D9C4B4')
  if(logo){x.save();x.beginPath();x.arc(150,128,52,0,Math.PI*2);x.clip();x.fillStyle='#FFF7EA';x.fill();x.drawImage(logo,98-6,76-6,116,116);x.restore()}else{x.textAlign='left';x.fillStyle='#3B2A2A';x.font='700 34px Fraunces, serif';x.fillText('BakeNote',100,128)}
  rr(x,W-340,103,240,50,25,'#3B2A2A');x.fillStyle='#FBF7F4';x.textAlign='center';x.font='500 24px "DM Sans", sans-serif';x.fillText(r.category||'Recipe',W-220,136)
  let y=215
  if(img){const w=600,h=290,ix=(W-w)/2,k=Math.max(w/img.width,h/img.height),sw=w/k,sh=h/k;x.save();x.beginPath();x.roundRect(ix,y,w,h,28);x.clip();x.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,ix,y,w,h);x.restore();y+=h+30}
  let s=58;x.fillStyle='#3B2A2A';while(s>30){x.font=`700 ${s}px Fraunces, serif`;if(x.measureText(r.title).width<800)break;s-=2}
  x.textAlign='center';x.font=`700 ${s}px Fraunces, serif`;const tl=wrap(x,r.title,800);tl.forEach((l,k)=>{y+=s*(k?1.1:1);x.fillText(l,W/2,y)})
  const meta=[r.servings&&'Serves '+scaleQty(r.servings,f),r.prep&&'Prep '+r.prep+' min',r.bake&&'Bake '+r.bake+' min',r.temp&&convTemp(r.temp,t)].filter(Boolean).join('   -   ')
  y+=48;x.fillStyle='#7A6258';x.font='400 26px "DM Sans", sans-serif';x.fillText(meta,W/2,y)
  if(r.source){x.font='400 21px "DM Sans", sans-serif';let src='Source: '+r.source;while(x.measureText(src).width>780&&src.length>12)src=src.slice(0,-2);y+=38;x.fillText(src===('Source: '+r.source)?src:src+'…',W/2,y)}
  y+=66;x.textAlign='left';x.fillStyle='#3B2A2A';x.font='500 32px Fraunces, serif';x.fillText('Ingredients',140,y);x.strokeStyle='#3B2A2A';x.lineWidth=1.5;x.beginPath();x.moveTo(140,y+14);x.lineTo(W-140,y+14);x.stroke()
  y+=62
  r.ingredients.forEach(i=>{x.font='600 38px Caveat, cursive';x.fillStyle='#3B2A2A';x.textAlign='left';x.fillText(i.name,140,y);x.textAlign='right';x.fillText(convIng({...i,qty:scaleQty(i.qty,f)},u),W-140,y);x.strokeStyle='rgba(59,42,42,.15)';x.lineWidth=1.5;x.beginPath();x.moveTo(140,y+12);x.lineTo(W-140,y+12);x.stroke();y+=54})
  const steps=String(r.steps||'').split('\n').map(z=>z.trim()).filter(Boolean)
  if(steps.length){y+=44;x.textAlign='left';x.fillStyle='#3B2A2A';x.font='500 32px Fraunces, serif';x.fillText('Steps',140,y);x.strokeStyle='#3B2A2A';x.lineWidth=1.5;x.beginPath();x.moveTo(140,y+14);x.lineTo(W-140,y+14);x.stroke();y+=58
    steps.forEach((st,k)=>{x.font='400 27px "DM Sans", sans-serif';const lines=wrap(x,st.replace(/^\d+[.)]\s*/,''),680);x.fillStyle='#B98F88';x.font='700 27px "DM Sans", sans-serif';x.textAlign='left';x.fillText(`${k+1}.`,140,y)
      x.fillStyle='#3B2A2A';x.font='400 27px "DM Sans", sans-serif';lines.forEach((l,j)=>{x.fillText(l,190,y+j*38)});y+=lines.length*38+16})}
  y+=30;return{c,end:y}
}
async function render(r,f,u,t,img,logo){
  const probe=draw(r,f,u,t,img,logo,7000),H=Math.max(1350,probe.end+110),{c}=draw(r,f,u,t,img,logo,H),x=c.getContext('2d')
  x.textAlign='center';x.fillStyle='#7A6258';x.font='600 36px Caveat, cursive';x.fillText('Every recipe has a story.',1000/2,H-80);return c
}
export async function exportCard(r,f=1,u='original',t='original'){
  try{await Promise.all(['700 40px Fraunces','500 40px Fraunces','600 40px Caveat','400 20px "DM Sans"','700 20px "DM Sans"'].map(s=>document.fonts.load(s)))}catch{}
  const [img,logo]=await Promise.all([loadImg(r.image),loadImg('/logo.webp')])
  for(const im of [img,null]){
    try{const b=await new Promise((ok,no)=>render(r,f,u,t,im,logo).then(c=>c.toBlob(b=>b?ok(b):no(new Error('blob')),'image/png')))
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(r.title||'recipe').replace(/[^\w]+/g,'-').toLowerCase()+'-card.png';a.click();return}
    catch(e){if(!im)throw e}}
}

export async function exportList(items){
  try{await Promise.all(['700 40px Fraunces','400 20px "DM Sans"','600 30px Caveat'].map(s=>document.fonts.load(s)))}catch{}
  const groups=AISLES.map(a=>[a,items.filter(s=>!s.done&&(s.aisle||aisle(s.name))===a)]).filter(g=>g[1].length)
  const rows=groups.reduce((n,g)=>n+g[1].length,0),W=900,H=190+groups.length*82+rows*50+110
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d')
  x.fillStyle='#FBF7F4';x.fillRect(0,0,W,H);x.textAlign='left';x.fillStyle='#3B2A2A';x.font='700 54px Fraunces, serif';x.fillText('Shopping list',70,100)
  x.fillStyle='#7A6258';x.font='400 24px "DM Sans", sans-serif';x.fillText(new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}),70,145)
  let y=210
  groups.forEach(([a,L])=>{x.fillStyle='#7A6258';x.textAlign='left';x.font='700 22px "DM Sans", sans-serif';x.fillText(a.toUpperCase(),70,y);x.strokeStyle='#D9C4B4';x.lineWidth=2;x.beginPath();x.moveTo(70,y+14);x.lineTo(W-70,y+14);x.stroke();y+=62
    L.forEach(s=>{x.strokeStyle='#3B2A2A';x.lineWidth=2;x.beginPath();x.roundRect(70,y-24,26,26,6);x.stroke();x.fillStyle='#3B2A2A';x.font='400 30px "DM Sans", sans-serif';x.textAlign='left';x.fillText(s.name,116,y);x.textAlign='right';x.fillStyle='#7A6258';x.fillText([s.qty,s.unit].filter(Boolean).join(' '),W-70,y);y+=50});y+=20})
  x.textAlign='center';x.fillStyle='#B98F88';x.font='600 30px Caveat, cursive';x.fillText('BakeNote',W/2,H-36)
  const b=await new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('blob')),'image/png'))
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='shopping-list.png';a.click()
}
