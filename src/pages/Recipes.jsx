import {useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,Field,ImageUpload,RecipeCard} from '../components/ui.jsx'
import StickyNote,{NOTE_COLORS} from '../components/StickyNote.jsx'
import {convIng,convTemp} from '../utils.js'
const CATS=['Cakes','Cookies','Brownies','Bread','Pastry','Pies','Other']
export function Recipes(){
  const {data,upd}=useApp(),[q,setQ]=useState(''),[cat,setCat]=useState(''),[fav,setFav]=useState(false)
  const list=data.recipes.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())&&(!cat||r.category===cat)&&(!fav||r.fav))
  return <div><Title sub={`${data.recipes.length} recipes · ${data.recipes.filter(r=>r.fav).length} favorites`} action={<Link className="btn" to="/recipes/new">Add recipe</Link>}>My Recipe Book</Title>
    <div className="flex flex-wrap gap-2 mb-5"><input className="input max-w-xs" placeholder="Search recipes" value={q} onChange={e=>setQ(e.target.value)}/>
      <select className="input max-w-40" value={cat} onChange={e=>setCat(e.target.value)}><option value="">All categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
      <button className={fav?'btn':'btn-o'} onClick={()=>setFav(!fav)}>♥ Favorites</button></div>
    {list.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(r=><RecipeCard key={r.id} r={r}><Link className="btn-o" to={'/recipes/'+r.id}>Open</Link><button className="btn-o" aria-label="Favorite" onClick={()=>upd('recipes',r.id,{fav:!r.fav})}>{r.fav?'♥':'♡'}</button></RecipeCard>)}</div>
    :<Empty>{data.recipes.length?'No recipes match your filters.':'Your recipe book is empty. Add your first recipe!'}</Empty>}</div>
}
export function RecipeDetail(){
  const {id}=useParams(),{data,del,toast,upd,add}=useApp(),nav=useNavigate(),r=data.recipes.find(x=>x.id===id)
  const [u,setU]=useState(()=>localStorage.getItem('bn_unit')||'original'),[t,setT]=useState(()=>localStorage.getItem('bn_temp')||'original'),[nt,setNt]=useState({title:'',text:'',color:NOTE_COLORS[0]})
  if(!r)return <Empty>Recipe not found. <Link className="underline" to="/recipes">Back to your book</Link></Empty>
  const pick=(k,set)=>e=>{set(e.target.value);localStorage.setItem(k,e.target.value)}
  const remove=()=>{if(confirm('Delete this recipe?')){del('recipes',id);toast('Recipe deleted');nav('/recipes')}}
  const notes=data.notes.filter(n=>n.recipeId===id)
  const addNote=e=>{e.preventDefault();if(!nt.title.trim()&&!nt.text.trim())return toast('Write something first',1);add('notes',{...nt,category:'Baking Tips',pinned:false,onJournal:false,recipeId:id,x:30,y:30});setNt({...nt,title:'',text:''});toast('Note added')}
  return <article className="max-w-3xl"><div className="noprint flex flex-wrap gap-2 mb-4"><Link className="btn-o" to="/recipes">← Back</Link><Link className="btn-o" to={`/recipes/${id}/edit`}>Edit</Link><button className="btn-o" onClick={()=>window.print()}>Print</button><button className="btn-o" onClick={()=>upd('recipes',id,{fav:!r.fav})}>{r.fav?'♥ Favorite':'♡ Favorite'}</button><button className="btn-o" onClick={remove}>Delete</button></div>
    <div className="relative rounded-[2rem] bg-oat p-3 pl-9 shadow-xl"><span className="absolute left-1 top-24 h-5 w-14 rounded-full border-4 border-stone-400"/><span className="absolute left-1 bottom-24 h-5 w-14 rounded-full border-4 border-stone-400"/><div className="relative rounded-2xl bg-[#fffdf8] p-6 md:p-10 shadow-inner"><span className="absolute right-5 top-5 rounded-full bg-cocoa text-cream text-xs px-3 py-1">{r.category}</span>{r.image&&<img src={r.image} alt={r.title} className="mx-auto h-44 w-44 rounded-full object-cover border-8 border-white shadow-lg mb-4"/>}
    <h1 className="text-4xl font-bold">{r.title}</h1><p className="text-caramel">{r.category}</p>
    <p className="my-3 text-sm">Prep {r.prep||'–'} · Bake {r.bake||'–'} · {convTemp(r.temp,t)} · Serves {r.servings||'–'}</p>
    {r.source&&<p className="text-sm mb-3">Source: {/^https?:/.test(r.source)?<a className="underline" href={r.source} target="_blank" rel="noreferrer">{r.source}</a>:r.source}</p>}
    <div className="noprint card p-3 flex flex-wrap gap-4 text-sm items-center"><label>Ingredient units <select className="input inline-block w-auto ml-1" value={u} onChange={pick('bn_unit',setU)}><option value="original">Original</option><option value="metric">Metric (g, ml)</option><option value="us">US (oz, cups)</option></select></label>
      <label>Temperature <select className="input inline-block w-auto ml-1" value={t} onChange={pick('bn_temp',setT)}><option value="original">Original</option><option value="C">°C</option><option value="F">°F</option></select></label></div>
    <h2 className="text-xl mt-6 border-b border-cocoa/40 pb-1">Ingredients</h2><ul>{r.ingredients.map((i,k)=><li key={k} className="hand text-2xl flex justify-between gap-3 border-b border-cocoa/15"><span>{i.name}</span><span>{convIng(i,u)}</span></li>)}</ul>
    <h2 className="text-2xl mt-5 mb-2">Steps</h2><ol className="list-decimal pl-5 space-y-1">{r.steps.split('\n').filter(Boolean).map((s,k)=><li key={k}>{s}</li>)}</ol>
    </div></div><h2 className="text-2xl mt-8 mb-3">Recipe notes</h2>
    <div className="flex flex-wrap gap-5 mb-4">{notes.map(n=><div key={n.id} className="w-52"><StickyNote n={n} onPin={()=>upd('notes',n.id,{pinned:!n.pinned})} onEdit={()=>nav('/notes')} onDel={()=>del('notes',n.id)}/></div>)}{!notes.length&&<p className="text-sm text-cocoa/60">No notes for this recipe yet.</p>}</div>
    <form onSubmit={addNote} className="noprint card p-4 space-y-2 max-w-md"><input aria-label="Note title" className="input" placeholder="Note title" value={nt.title} onChange={e=>setNt({...nt,title:e.target.value})}/><textarea aria-label="Note" className="input" rows={2} placeholder="e.g. Used less sugar – came out better" value={nt.text} onChange={e=>setNt({...nt,text:e.target.value})}/>
      <div className="flex items-center gap-2">{NOTE_COLORS.map(c=><button type="button" key={c} aria-label={'Color '+c} onClick={()=>setNt({...nt,color:c})} style={{background:c}} className={`h-7 w-7 rounded-full border-2 ${nt.color===c?'border-cocoa':'border-transparent'}`}/>)}<button className="btn ml-auto">Add note</button></div></form></article>
}
export function RecipeForm(){
  const {id}=useParams(),{data,add,upd,toast}=useApp(),nav=useNavigate(),old=data.recipes.find(x=>x.id===id)
  const [r,setR]=useState(old||{title:'',category:'Cakes',servings:'',prep:'',bake:'',temp:'',source:'',image:'',ingredients:[{name:'',qty:'',unit:'g'}],steps:''}),[err,setErr]=useState({})
  const set=k=>e=>setR({...r,[k]:e.target.value}),setI=(i,k,v)=>setR({...r,ingredients:r.ingredients.map((x,j)=>j===i?{...x,[k]:v}:x)})
  const submit=e=>{e.preventDefault();const er={},ings=r.ingredients.filter(i=>i.name.trim())
    if(!r.title.trim())er.title='Give your recipe a title.'
    if(!ings.length)er.ing='Add at least one ingredient.'
    if(!r.steps.trim())er.steps='Write at least one step.'
    if(r.source&&!/^https?:\/\/\S+\.\S+/.test(r.source))er.source='Enter a full link starting with http:// or https://'
    setErr(er);if(Object.keys(er).length)return
    const rec={...r,ingredients:ings};old?upd('recipes',id,rec):add('recipes',rec);toast(old?'Recipe updated':'Recipe added');nav('/recipes')}
  return <form onSubmit={submit} className="max-w-3xl space-y-4"><Title>{old?'Edit recipe':'Add recipe'}</Title>
    <Field label="Title" error={err.title}><input className="input" value={r.title} onChange={set('title')}/></Field>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><Field label="Category"><select className="input" value={r.category} onChange={set('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
      {[['servings','Servings'],['prep','Prep (min)'],['bake','Bake (min)'],['temp','Temperature']].map(([k,l])=><Field key={k} label={l}><input className="input" value={r[k]} onChange={set(k)}/></Field>)}</div>
    <Field label="Photo"><ImageUpload value={r.image} onChange={v=>setR({...r,image:v})}/></Field>
    <Field label="Reference website or YouTube link" error={err.source}><input className="input" value={r.source} onChange={set('source')} placeholder="https://"/></Field>
    <div><p className="text-sm font-medium mb-1">Ingredients</p>{r.ingredients.map((i,k)=><div key={k} className="flex gap-2 mb-2"><input aria-label="Ingredient" className="input" placeholder="Ingredient" value={i.name} onChange={e=>setI(k,'name',e.target.value)}/><input aria-label="Quantity" className="input max-w-20" placeholder="Qty" value={i.qty} onChange={e=>setI(k,'qty',e.target.value)}/><input aria-label="Unit" className="input max-w-20" placeholder="Unit" value={i.unit} onChange={e=>setI(k,'unit',e.target.value)}/><button type="button" aria-label="Remove ingredient" onClick={()=>setR({...r,ingredients:r.ingredients.filter((_,j)=>j!==k)})}>✕</button></div>)}
      {err.ing&&<p className="text-red-700 text-xs">{err.ing}</p>}<button type="button" className="btn-o" onClick={()=>setR({...r,ingredients:[...r.ingredients,{name:'',qty:'',unit:'g'}]})}>+ Ingredient</button></div>
    <Field label="Steps (one per line)" error={err.steps}><textarea rows={6} className="input" value={r.steps} onChange={set('steps')}/></Field>
    <div className="flex gap-2"><button className="btn">Save recipe</button><Link className="btn-o" to="/recipes">Cancel</Link></div></form>
}
