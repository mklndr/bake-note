import {useEffect,useState} from 'react'
import {useApp} from '../store.jsx'
import {Title,Empty,RecipeCard} from '../components/ui.jsx'
import {sampleRecipes} from '../data/sampleRecipes.js'
import {cleanSteps} from '../utils.js'
const API='https://www.themealdb.com/api/json/v1/1/'
const conv=m=>({sid:'m'+m.idMeal,src:'online',title:m.strMeal,category:'Dessert',image:m.strMealThumb,source:m.strSource||m.strYoutube||'TheMealDB',servings:'',prep:'',bake:'',temp:'',steps:cleanSteps(m.strInstructions).join('\n'),
  ingredients:Array.from({length:20},(_,i)=>({name:m['strIngredient'+(i+1)],qty:'',unit:m['strMeasure'+(i+1)]?.trim()})).filter(i=>i.name?.trim())})
export default function Discover(){
  const {data,add,toast}=useApp(),[api,setApi]=useState([]),[q,setQ]=useState(''),[load,setLoad]=useState(true),[err,setErr]=useState(''),[view,setView]=useState(null),[src,setSrc]=useState('all'),[cat,setCat]=useState(''),[photo,setPhoto]=useState(false)
  useEffect(()=>{setLoad(true);setErr('');fetch(API+(q?'search.php?s='+encodeURIComponent(q):'filter.php?c=Dessert')).then(r=>r.json()).then(d=>setApi(d.meals||[])).catch(()=>setErr('Could not reach TheMealDB. Showing built-in recipes only.')).finally(()=>setLoad(false))},[q])
  const open=async m=>{if(m.ingredients)return setView(m);try{const d=await fetch(API+'lookup.php?i='+m.idMeal).then(r=>r.json());setView(conv(d.meals[0]))}catch{toast('Could not load recipe details.',1)}}
  const save=r=>{if(data.recipes.some(x=>x.sid===r.sid))return toast('Already in your recipe book',1);add('recipes',{...r});toast('Saved to My Recipe Book')}
  const local=sampleRecipes.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())).map(r=>({...r,src:'built'}))
  const all=[...local,...api.map(m=>({sid:'m'+m.idMeal,src:'online',title:m.strMeal,image:m.strMealThumb,idMeal:m.idMeal,category:'Dessert'}))].filter(r=>(src==='all'||r.src===src)&&(!cat||r.category===cat)&&(!photo||r.image))
  const cats=['Cakes','Cookies','Brownies','Bread','Dessert']
  return <div><Title sub="Built-in baking recipes plus desserts from TheMealDB">Discover Recipes</Title>
    <div className="flex flex-wrap gap-2 items-center mb-3"><input className="input max-w-xs" placeholder="Search recipes" onChange={e=>{const v=e.target.value;clearTimeout(window.__t);window.__t=setTimeout(()=>setQ(v),400)}}/>
      <select aria-label="Source" className="input max-w-40" value={src} onChange={e=>setSrc(e.target.value)}><option value="all">All sources</option><option value="built">Built-in</option><option value="online">TheMealDB</option></select>
      <label className="flex gap-2 text-sm items-center"><input type="checkbox" checked={photo} onChange={e=>setPhoto(e.target.checked)}/>With photo</label></div>
    <div className="flex flex-wrap gap-2 mb-5">{['',...cats].map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'btn':'btn-o'}>{c||'All categories'}</button>)}</div>
    {err&&<p role="alert" className="text-sm text-red-700 mb-3">{err}</p>}{load&&<p className="mb-3">Loading recipes…</p>}
    {all.length?<div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{all.map(r=><RecipeCard key={r.sid} r={r}><button className="btn-o" onClick={()=>open(r)}>View</button>{r.ingredients&&<button className="btn" onClick={()=>save(r)}>Save</button>}</RecipeCard>)}</div>:!load&&<Empty>No recipes match your filters.</Empty>}
    {view&&<div className="fixed inset-0 z-50 bg-cocoa/60 grid place-items-center p-4" onClick={()=>setView(null)}><div className="bg-cream rounded-3xl max-w-xl w-full max-h-[85vh] overflow-auto p-6" onClick={e=>e.stopPropagation()}>
      <img src={view.image} alt="" className="h-52 w-full object-cover rounded-2xl mb-3"/><h2 className="text-2xl font-bold">{view.title}</h2>
      <p className="text-sm my-2">{view.servings&&view.servings+' servings · '}{view.bake&&view.bake+' min at '+view.temp}</p>
      <ul className="list-disc pl-5 text-sm">{view.ingredients.map((i,k)=><li key={k}>{i.qty} {i.unit} {i.name}</li>)}</ul>
      <ol className="list-decimal pl-5 text-sm mt-3 space-y-1">{view.steps.split('\n').map((s,k)=><li key={k}>{s}</li>)}</ol>
      <div className="flex gap-2 mt-4"><button className="btn" onClick={()=>save(view)}>Save to my book</button><button className="btn-o" onClick={()=>setView(null)}>Close</button></div></div></div>}</div>
}
