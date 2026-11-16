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
  let L=t.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!/^step\s*\d+\.?$/i.test(s)&&!/^\d+\.?$/.test(s)).map(s=>s.replace(/^(step\s*\d+[:.)-]?\s*|\d+[.)]\s+)/i,''))
  if(L.length<=2&&L.join(' ').length>200)L=L.join(' ').split(/(?<=[.!?])\s+(?=[A-Z])/)
  return L.filter(s=>s.length>1)
}
export function matchRecipes(recipes,pantry){
  const have=pantry.filter(p=>+p.qty>0).map(p=>p.name.trim().toLowerCase())
  return recipes.map(r=>{const miss=r.ingredients.filter(i=>{const n=i.name.trim().toLowerCase();return !have.some(h=>h.includes(n)||n.includes(h))})
    return{r,missing:miss,pct:r.ingredients.length?Math.round(100*(r.ingredients.length-miss.length)/r.ingredients.length):0}})
}
