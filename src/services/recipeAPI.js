import {cleanSteps} from '../utils.js'
export const CATS=['Cakes','Cookies','Brownies & Bars','Bread & Rolls','Pastries','Pies & Tarts','Muffins & Scones','Puddings & Crumbles','Other bakes']
export const CATQ={'Cakes':'cake','Cookies':'cookies','Brownies & Bars':'brownies','Bread & Rolls':'bread','Pastries':'pastry','Pies & Tarts':'pie','Muffins & Scones':'muffin','Puddings & Crumbles':'crumble','Other bakes':''}
const RULES=[
 ['Puddings & Crumbles',/pudding|crumble|cobbler|crisp\b|clafoutis|souffl|pavlova|meringue/],
 ['Brownies & Bars',/brownie|blondie|flapjack|\bbars?\b|\bslices?\b/],
 ['Cookies',/cookie|biscuit|shortbread|macaron|biscotti|snickerdoodle|wafer|amaretti/],
 ['Muffins & Scones',/muffin|cupcake|scone/],
 ['Pies & Tarts',/\bpie\b|\btarts?\b|tartlet|galette|frangipan/],
 ['Cakes',/(?<!pan)cakes?\b|cheesecake|gateau|torte|sponge|bundt|babka/],
 ['Pastries',/pastr|croissant|danish|eclair|puff|strudel|turnover|baklava|profiterole|choux|cannoli|palmier|donut|doughnut/],
 ['Bread & Rolls',/bread|\bbuns?\b|\brolls?\b|loaf|focaccia|brioche|bagel|naan|pita|flatbread|baguette|sourdough|ciabatta|pretzel|challah/]]
const SAVORY=/pizza|burger|sausage|chicken|beef|pork|lamb|fish|salmon|tuna|steak|potato|meat|bacon|\bham\b|cheese(?!cake)|quiche|lasagn|pasty|shepherd|cottage|kidney|mince|curry|taco|noodle/
const BAKED=/\b(oven|bake|baked|baking|preheat)\b|gas mark|\d\s?(?:°|º|degrees)/i
export function classify({title='',text='',category='',dishTypes=[]}){
  const t=title.toLowerCase()
  if(SAVORY.test(t)||/^(beef|chicken|lamb|pork|pasta|seafood|goat|starter|side|side_dish|main|soup|drink|sauce)$/i.test(category))return null
  const hit=RULES.find(([,rx])=>rx.test(t)),baked=BAKED.test(text)
  if(hit){
    if(/no[- ]?bake/i.test(t+' '+text))return null
    if(text&&!baked&&!/cake|cookie|brownie|bread|muffin|scone|pastr|croissant|biscuit/.test(t))return null
    return hit[0]}
  if(baked&&(/dessert/i.test(category)||dishTypes.some(d=>/dessert|bread|breakfast/i.test(d))))return 'Other bakes'
  return null
}
const UMAP={tbs:'tbsp',tbsp:'tbsp',tblsp:'tbsp',tablespoon:'tbsp',tablespoons:'tbsp',tsp:'tsp',teaspoon:'tsp',teaspoons:'tsp',cup:'cup',cups:'cup',g:'g',gr:'g',gram:'g',grams:'g',kg:'kg',ml:'ml',milliliter:'ml',milliliters:'ml',l:'l',liter:'l',liters:'l',oz:'oz',ounce:'oz',ounces:'oz',lb:'lb',lbs:'lb',pound:'lb',pounds:'lb',pinch:'pinch',piece:'pcs',pieces:'pcs',pcs:'pcs',large:'pcs',medium:'pcs',small:'pcs',whole:'pcs',slice:'slice',slices:'slice',clove:'clove',cloves:'clove'}
export const normUnit=u=>UMAP[String(u||'').toLowerCase().replace('.','')]||''
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s
export function parseMeasure(m=''){
  const s=String(m).replace(/(?<=[a-zA-Z])\s*\/.*$/,'').trim(),mt=s.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔⅛])\s*([A-Za-z]*)/)
  if(mt)return{qty:mt[1].replace(',','.'),unit:normUnit(mt[2])||(mt[2]?'':'pcs')}
  const u=normUnit(s);return u?{qty:'1',unit:u}:{qty:'',unit:''}
}
export const bakeTemp=t=>{const m=String(t).match(/(\d{3})\s*(?:°|º|degrees)?\s*(C|F)\b/i);return m?`${m[1]}°${m[2].toUpperCase()}`:''}
export const bakeTime=t=>{const m=String(t).match(/(?:bake|baking|oven)[^.]{0,80}?(\d{1,3})(?:\s*(?:-|to)\s*\d{1,3})?\s*(?:min|minutes)/i);return m?m[1]:''}
const cache={get(k,ttl){try{const v=JSON.parse(localStorage.getItem('bn_c_'+k));return v&&Date.now()-v.t<ttl?v.d:null}catch{return null}},set(k,d){try{localStorage.setItem('bn_c_'+k,JSON.stringify({t:Date.now(),d}))}catch{}}}
// TheMealDB
const MEAL='https://www.themealdb.com/api/json/v1/1/'
function mealRecipe(m){
  const text=m.strInstructions||'',category=classify({title:m.strMeal,text,category:m.strCategory});if(!category)return null
  return{sid:'m'+m.idMeal,src:'mealdb',title:m.strMeal,category,image:m.strMealThumb,source:m.strSource||m.strYoutube||'TheMealDB',servings:'',prep:'',bake:bakeTime(text),temp:bakeTemp(text),steps:cleanSteps(text).join('\n'),
    ingredients:Array.from({length:20},(_,i)=>({name:(m['strIngredient'+(i+1)]||'').trim(),...parseMeasure(m['strMeasure'+(i+1)])})).filter(i=>i.name)}
}
export async function fetchMealDB(){
  const hit=cache.get('mealdb2',6048e5);if(hit)return hit
  const rs=await Promise.all('abcdefghijklmnopqrstuvwxyz'.split('').map(l=>fetch(MEAL+'search.php?f='+l).then(r=>r.json()).then(d=>d.meals||[]).catch(()=>[])))
  const seen=new Set(),out=[];rs.flat().forEach(m=>{if(seen.has(m.idMeal))return;seen.add(m.idMeal);const r=mealRecipe(m);if(r)out.push(r)})
  if(!out.length)throw new Error('Could not reach TheMealDB.')
  cache.set('mealdb2',out);return out
}
// Spoonacular
const SK=import.meta.env?.VITE_SPOONACULAR_KEY
function spoon(x){
  const steps=(x.analyzedInstructions?.[0]?.steps||[]).map(s=>s.step.trim()).filter(Boolean),text=steps.join(' '),category=classify({title:x.title,text,dishTypes:x.dishTypes||[]})
  if(!category||!steps.length)return null
  return{sid:'s'+x.id,src:'spoon',title:x.title,category,image:x.image,source:x.sourceUrl||'Spoonacular',servings:x.servings?String(x.servings):'',prep:x.preparationMinutes>0?String(x.preparationMinutes):'',bake:x.cookingMinutes>0?String(x.cookingMinutes):bakeTime(text),temp:bakeTemp(text),steps:steps.join('\n'),
    ingredients:(x.extendedIngredients||[]).map(i=>({name:cap(i.name),qty:String(Math.round(i.amount*100)/100),unit:normUnit(i.unit)||(i.unit?'':'pcs')}))}
}
export async function fetchSpoon(term=''){
  if(!SK)throw new Error('Spoonacular key missing. Add VITE_SPOONACULAR_KEY to your .env file.')
  const key='sp:'+(term||'default'),hit=cache.get(key,432e5);if(hit)return hit
  const terms=term?[term]:['cake','cookies','bread','pastry']
  const rs=await Promise.all(terms.map(t=>fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(t)}&number=${term?20:8}&addRecipeInformation=true&fillIngredients=true&instructionsRequired=true&apiKey=${SK}`).then(r=>{if(!r.ok)throw new Error(r.status===402?'Spoonacular daily limit reached.':'Spoonacular error '+r.status);return r.json()}).then(d=>d.results||[])))
  const seen=new Set(),out=[];rs.flat().forEach(x=>{if(seen.has(x.id))return;seen.add(x.id);const r=spoon(x);if(r)out.push(r)})
  cache.set(key,out);return out
}
// RecipeAPI.io (free plan: 500 requests per month, so results are cached for a day)
const RK=import.meta.env?.VITE_RECIPEAPI_KEY
function rapi(x){
  const steps=(x.instructions||[]).map(s=>String(s).trim()).filter(Boolean),text=steps.join(' '),category=classify({title:x.name,text,category:x.meal_type})
  if(!category||!steps.length)return null
  return{sid:'r'+x.id,src:'recipeapi',title:x.name,category,image:'',source:'RecipeAPI',servings:x.servings?String(x.servings):'',prep:x.prep_time?String(x.prep_time):'',bake:x.cook_time?String(x.cook_time):bakeTime(text),temp:bakeTemp(text),steps:steps.join('\n'),
    ingredients:(x.ingredients||[]).map(i=>({name:i.name,qty:i.quantity!=null?String(i.quantity):'',unit:normUnit(i.unit)||i.unit||''}))}
}
export async function fetchRecipeAPI(term=''){
  if(!RK)throw new Error('RecipeAPI key missing. Add VITE_RECIPEAPI_KEY to your .env file.')
  const key='ra:'+(term||'default'),hit=cache.get(key,864e5);if(hit)return hit
  const terms=term?[term]:['cake','cookie','bread','pastry']
  const rs=await Promise.all(terms.map(t=>fetch(`https://recipeapi.io/api/v1/recipes?search=${encodeURIComponent(t)}&per_page=10`,{headers:{Authorization:'Bearer '+RK}}).then(r=>{if(!r.ok)throw new Error(r.status===429?'RecipeAPI monthly limit reached.':'RecipeAPI error '+r.status);return r.json()}).then(d=>d.data||[])))
  const seen=new Set(),out=[];rs.flat().forEach(x=>{if(seen.has(x.id))return;seen.add(x.id);const r=rapi(x);if(r)out.push(r)})
  cache.set(key,out);return out
}
