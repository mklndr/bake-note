import {convIng,convTemp,scaleQty,AISLES,aisle} from './utils.js'
const rr=(x,a,b,w,h,r,fill,stroke)=>{x.beginPath();x.roundRect(a,b,w,h,r);if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=2;x.stroke()}}
const loadImg=src=>new Promise(res=>{if(!src)return res(null);const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})
function draw(r,f,u,t,img){
  const W=1000,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d')
  x.fillStyle='#E8D8CE';x.fillRect(0,0,W,H);rr(x,50,50,W-100,H-100,36,'#FBF7F4','#D9C4B4')
  x.textAlign='left';x.fillStyle='#3B2A2A';x.font='700 34px Fraunces, serif';x.fillText('BakeNote',100,128)
  rr(x,W-340,88,240,50,25,'#3B2A2A');x.fillStyle='#FBF7F4';x.textAlign='center';x.font='500 24px "DM Sans", sans-serif';x.fillText(r.category||'Recipe',W-220,121)
  let y=175
  if(img){const w=600,h=290,ix=(W-w)/2,k=Math.max(w/img.width,h/img.height),sw=w/k,sh=h/k;x.save();x.beginPath();x.roundRect(ix,y,w,h,28);x.clip();x.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,ix,y,w,h);x.restore();y+=h+30}
  let s=58;x.fillStyle='#3B2A2A';while(s>30){x.font=`700 ${s}px Fraunces, serif`;if(x.measureText(r.title).width<800)break;s-=2}
  y+=s;x.textAlign='center';x.fillText(r.title,W/2,y)
  const meta=[r.servings&&'Serves '+scaleQty(r.servings,f),r.prep&&'Prep '+r.prep,r.bake&&'Bake '+r.bake,r.temp&&convTemp(r.temp,t)].filter(Boolean).join('   -   ')
  y+=48;x.fillStyle='#7A6258';x.font='400 26px "DM Sans", sans-serif';x.fillText(meta,W/2,y)
  y+=70;x.textAlign='left';x.fillStyle='#3B2A2A';x.font='500 32px Fraunces, serif';x.fillText('Ingredients',140,y);x.strokeStyle='#3B2A2A';x.lineWidth=1.5;x.beginPath();x.moveTo(140,y+14);x.lineTo(W-140,y+14);x.stroke()
  const room=Math.floor((H-200-(y+30))/54),L=r.ingredients,show=L.length>room?room-1:L.length
  x.font='600 38px Caveat, cursive';y+=62
  L.slice(0,show).forEach(i=>{x.textAlign='left';x.fillText(i.name,140,y);x.textAlign='right';x.fillText(convIng({...i,qty:scaleQty(i.qty,f)},u),W-140,y);x.strokeStyle='rgba(59,42,42,.15)';x.beginPath();x.moveTo(140,y+12);x.lineTo(W-140,y+12);x.stroke();y+=54})
  if(L.length>show){x.textAlign='left';x.fillStyle='#7A6258';x.fillText(`+ ${L.length-show} more in BakeNote`,140,y)}
  x.textAlign='center';x.fillStyle='#7A6258';x.font='600 36px Caveat, cursive';x.fillText('Every recipe has a story.',W/2,H-100)
  return c
}
export async function exportCard(r,f=1,u='original',t='original'){
  try{await Promise.all(['700 40px Fraunces','500 40px Fraunces','600 40px Caveat','400 20px "DM Sans"'].map(s=>document.fonts.load(s)))}catch{}
  const img=await loadImg(r.image)
  for(const im of [img,null]){
    try{const b=await new Promise((ok,no)=>draw(r,f,u,t,im).toBlob(b=>b?ok(b):no(new Error('blob')),'image/png'))
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
