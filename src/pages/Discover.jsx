import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {useNavigate} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,RecipeCard} from '../components/ui.jsx'
import {GlossaryText} from '../components/Glossary.jsx'
import {sampleRecipes} from '../data/sampleRecipes.js'
import {CATS,CATQ,classify,fetchMealDB,fetchSpoon,fetchRecipeAPI} from '../services/recipeAPI.js'
const SRC=[['all','All sources'],['mine','Your recipes'],['mealdb','TheMealDB'],['recipeapi','RecipeAPI'],['spoon','Spoonacular']]
const NAME={built:'BakeNote',mealdb:'TheMealDB',recipeapi:'RecipeAPI',spoon:'Spoonacular',mine:'Your recipe'}
const FETCH={mealdb:()=>fetchMealDB(),recipeapi:fetchRecipeAPI,spoon:fetchSpoon},EXT=['mealdb','recipeapi','spoon']
const nice=m=>/failed to fetch|networkerror/i.test(m)?'Could not connect. The service may be offline or blocking browser requests.':m
export default function Discover(){
  const {data,add,toast}=useApp(),nav=useNavigate(),[qi,setQi]=useState(''),[q,setQ]=useState(''),[src,setSrc]=useState('all'),[cat,setCat]=useState(''),[items,setItems]=useState({}),[load,setLoad]=useState(false),[errs,setErrs]=useState({}),[view,setView]=useState(null)
  useEffect(()=>{const t=setTimeout(()=>setQ(qi.trim()),450);return()=>clearTimeout(t)},[qi])
  const term=q||CATQ[cat]||''
  useEffect(()=>{const want=src==='all'?EXT:EXT.filter(x=>x===src);if(!want.length){setErrs({});return}
    let off=false;setLoad(true)
    Promise.allSettled(want.map(k=>FETCH[k](term))).then(rs=>{if(off)return;const it={},e={};rs.forEach((r,i)=>{if(r.status==='fulfilled')it[want[i]]=r.value;else{it[want[i]]=[];e[want[i]]=nice(r.reason?.message||'Could not load recipes.')}});setItems(p=>({...p,...it}));setErrs(e);setLoad(false)})
    return()=>{off=true}},[src,term])
  const save=r=>{if(data.recipes.some(x=>x.sid===r.sid))return toast('Already in your recipe book',1);add('recipes',{...r});toast('Saved to My Recipe Book')}
  const built=sampleRecipes.map(r=>({...r,src:'built',category:classify({title:r.title,text:r.steps})||r.category})),mine=data.recipes.map(r=>({...r,src:'mine'})),ext=EXT.flatMap(k=>items[k]||[])
  const base=src==='mine'?mine:src==='all'?[...built,...ext]:items[src]||[],hay=r=>[r.title,...(r.ingredients||[]).map(i=>i.name)].join(' ').toLowerCase()
  const list=base.filter(r=>(!cat||r.category===cat)&&(!q||['recipeapi','spoon'].includes(r.src)||hay(r).includes(q.toLowerCase())))
  const chips=CATS.filter(c=>c!=='Other bakes'||base.some(r=>r.category==='Other bakes'))
  return <div><Title sub="Baking recipes from TheMealDB, RecipeAPI and Spoonacular. Savory dishes are filtered out.">Discover Recipes</Title>
    <div className="mb-3 flex flex-wrap items-center gap-2"><input aria-label="Search recipes" className="input max-w-md flex-1" placeholder="Search recipes or ingredients" value={qi} onChange={e=>setQi(e.target.value)}/>
      <select aria-label="Source" className="input w-48" value={src} onChange={e=>setSrc(e.target.value)}>{SRC.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></div>
    <div className="mb-5 flex flex-wrap gap-2">{['',...chips].map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'btn':'btn-o'}>{c||'All categories'}</button>)}</div>
    {Object.entries(errs).map(([k,m])=><p key={k} role="alert" className="mb-2 text-sm text-red-700">{NAME[k]}: {m}</p>)}{load&&<p className="mb-3 text-caramel">Loading recipes…</p>}
    {list.length?<div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{list.map(r=><RecipeCard key={r.sid||r.id} r={r}><span className="mr-auto self-center text-xs text-caramel">{NAME[r.src]}</span>
      {r.src==='mine'?<button className="btn" onClick={()=>nav('/recipes/'+r.id)}>Open</button>:<><button className="btn-o" onClick={()=>setView(r)}>View</button><button className="btn" onClick={()=>save(r)}>Save</button></>}</RecipeCard>)}</div>:!load&&<Empty>No baking recipes match your filters.</Empty>}
    {view&&createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/60 p-4 backdrop-blur-sm" onClick={()=>setView(null)}><div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-3xl bg-cream p-6" onClick={e=>e.stopPropagation()}>
      {view.image&&<img src={view.image} alt="" className="mb-3 h-52 w-full rounded-2xl object-cover"/>}<h2 className="text-2xl font-bold">{view.title}</h2>
      <p className="my-2 text-sm text-caramel">{[view.category,view.servings&&view.servings+' servings',view.prep&&'Prep '+view.prep+' min',view.bake&&'Bake '+view.bake+' min',view.temp].filter(Boolean).join(', ')}</p>
      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]"><div><h3 className="mb-1 font-bold">Ingredients</h3><ul className="space-y-1 text-sm">{view.ingredients.map((i,k)=><li key={k} className="flex justify-between gap-2 border-b border-cocoa/10"><span>{i.name}</span><span className="text-caramel">{[i.qty,i.unit].filter(Boolean).join(' ')}</span></li>)}</ul></div>
        <div><h3 className="mb-1 font-bold">Steps</h3><ol className="list-decimal space-y-2 pl-5 text-sm">{view.steps.split('\n').filter(Boolean).map((s,k)=><li key={k}><GlossaryText text={s}/></li>)}</ol></div></div>
      <div className="mt-5 flex gap-2"><button className="btn" onClick={()=>save(view)}>Save to my book</button><button className="btn-o" onClick={()=>setView(null)}>Close</button></div></div></div>,document.body)}</div>
}
