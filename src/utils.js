const FR={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125}
export function num(q){const s=String(q??'').trim();if(!s)return NaN;let t=0;for(const p of s.split(/\s+/)){if(FR[p]!==undefined)t+=FR[p];else if(/^\d+\/\d+$/.test(p)){const[a,b]=p.split('/');t+=a/b}else if(/^\d*\.?\d+$/.test(p))t+=+p;else return NaN}return t}
const U={g:'g',gram:'g',grams:'g',kg:'kg',oz:'oz',lb:'lb',lbs:'lb',ml:'ml',l:'l',cup:'cup',cups:'cup',tbsp:'tbsp',tsp:'tsp'}
const r=v=>v>=100?Math.round(v):Math.round(v*100)/100
export function convIng(i,mode){
  const q=num(i.qty),u=U[String(i.unit||'').toLowerCase().replace('.','')],raw=`${i.qty||''} ${i.unit||''}`.trim()
  if(mode==='original'||isNaN(q)||!u)return raw
  let v=q,n=u
  if(mode==='metric'){if(u==='cup'){v=q*240;n='ml'}else if(u==='tbsp'){v=q*15;n='ml'}else if(u==='tsp'){v=q*5;n='ml'}else if(u==='oz'){v=q*28.35;n='g'}else if(u==='lb'){v=q*453.6;n='g'}}
  else if(u==='g'){v=q/28.35;n='oz'}else if(u==='kg'){v=q*2.205;n='lb'}else if(u==='ml'){if(q>=60){v=q/240;n='cup'}else if(q>=15){v=q/15;n='tbsp'}else{v=q/5;n='tsp'}}else if(u==='l'){v=q*4.227;n='cup'}
  return `${r(v)} ${n}`
}
export function convTemp(t,mode){
  const m=String(t||'').match(/(\d+(?:\.\d+)?)\s*°?\s*([CF])/i);if(!m||mode==='original')return t||'–'
  const v=+m[1],from=m[2].toUpperCase();if(from===mode)return `${v}°${from}`
  return from==='C'?`${Math.round(v*9/5+32)}°F`:`${Math.round((v-32)*5/9)}°C`
}
export const AISLES=['Dairy & Eggs','Dry goods','Wet & liquids','Other']
export const aisle=n=>{n=n.toLowerCase();return /milk|butter|egg|cream|cheese|yogurt|yoghurt/.test(n)?AISLES[0]:/oil|vanilla|extract|honey|syrup|water|juice|molasses/.test(n)?AISLES[2]:/flour|sugar|salt|soda|powder|cocoa|yeast|chip|oat|nut|spice|cinnamon|chocolate/.test(n)?AISLES[1]:AISLES[3]}
export function cleanSteps(t=''){
  let s=String(t).replace(/\r/g,'\n').replace(/\u00a0/g,' ')
  s=s.replace(/(?:^|\s)(?:step\s*)?\d{1,2}[.)]\s+(?=[A-Z])/gi,'\n')
  let L=s.split('\n').map(x=>x.trim()).filter(Boolean).filter(x=>!/^(step\s*\d+|\d+)\s*[.:)]?$/i.test(x)).map(x=>x.replace(/^(step\s*\d+\s*[:.)-]?\s*|\d+\s*[.)]\s+|[-•*]\s+)/i,'').trim()).filter(Boolean)
  const J=[];for(const l of L){const p=J[J.length-1];if(p&&!/[.!?:;)"”']$/.test(p)&&/^[a-z(]/.test(l))J[J.length-1]=p+' '+l;else J.push(l)}
  L=J
  if(L.length<=2&&L.join(' ').length>180)L=L.join(' ').split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
  const M=[];for(const l of L){const p=M[M.length-1];if(p&&l.length<24)M[M.length-1]=p+' '+l;else M.push(l)}
  return M.filter(x=>x.length>1)
}
export function matchRecipes(recipes,pantry){
  const have=pantry.filter(p=>+p.qty>0).map(p=>p.name.trim().toLowerCase())
  return recipes.map(r=>{const miss=r.ingredients.filter(i=>{const n=i.name.trim().toLowerCase();return !have.some(h=>h.includes(n)||n.includes(h))})
    return{r,missing:miss,pct:r.ingredients.length?Math.round(100*(r.ingredients.length-miss.length)/r.ingredients.length):0}})
}

export const SCALES=[[.25,'¼× (quarter)'],[.5,'½× (half)'],[1,'1× (original)'],[1.5,'1½×'],[2,'2× (double)'],[3,'3× (triple)'],[4,'4×'],[6,'6×']]
export function scaleQty(q,f){const n=num(q);if(isNaN(n)||f===1)return q;return String(Math.round(n*f*100)/100)}
export const PANS=[['6 in (15 cm) round',Math.PI*9],['8 in (20 cm) round',Math.PI*16],['9 in (23 cm) round',Math.PI*20.25],['10 in (25 cm) round',Math.PI*25],['8 in (20 cm) square',64],['9 in (23 cm) square',81],['9×13 in (23×33 cm) rectangle',117],['9×5 in (23×13 cm) loaf',45],['8×4 in (20×10 cm) loaf',32]]
export const panFactor=(a,b)=>{const A=PANS.find(p=>p[0]===a)?.[1],B=PANS.find(p=>p[0]===b)?.[1];return A&&B?Math.round(B/A*100)/100:1}
