import {useState,useEffect} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {UnitSelect,Title,Empty,Field,ImageUpload,RecipeCard} from '../components/ui.jsx'
import StickyNote,{NOTE_COLORS} from '../components/StickyNote.jsx'
import {convIng,convTemp,num,scaleQty,SCALES,PANS,panFactor} from '../utils.js'
import {CATS} from '../services/recipeAPI.js'
import {GlossaryText} from '../components/Glossary.jsx'
import {exportCard} from '../cardExport.js'
import {sampleRecipes} from '../data/sampleRecipes.js'
import {BookStage} from '../components/InteractiveBook.jsx'
const catList=d=>[...new Set([...CATS,...d.recipes.map(x=>x.category).filter(Boolean)])]
function RecipeBook({list}){
  const {user}=useApp(),W=320,H=460
  const pages=list.map((r,i)=>({pageNumber:i+1,
    content:<div className="flex h-full flex-col"><span className="mb-2 w-fit rounded-full bg-cocoa px-3 py-0.5 text-[11px] text-cream">Recipe No. {String(i+1).padStart(3,'0')}</span>{r.image&&<img src={r.image} alt="" className="mb-3 h-32 w-full rounded-xl object-cover"/>}
      <h3 className="font-serif text-xl font-bold leading-tight">{r.title}</h3><p className="mb-2 text-xs text-caramel">{[r.category,r.servings&&r.servings+' servings',r.bake&&r.bake+' min'].filter(Boolean).join(', ')}</p>
      <ul className="hand text-xl leading-6">{r.ingredients.slice(0,8).map((g,k)=><li key={k} className="flex justify-between gap-2 border-b border-cocoa/10"><span className="truncate">{g.name}</span><span className="shrink-0">{g.qty} {g.unit}</span></li>)}</ul>
      {r.ingredients.length>8&&<p className="text-xs text-caramel mt-1">+ {r.ingredients.length-8} more</p>}
      <Link to={'/recipes/'+r.id} onClick={e=>e.stopPropagation()} className="mt-auto pt-3 text-sm font-medium text-berry underline">Open full recipe</Link></div>,
    backContent:<div><h3 className="mb-2 font-serif text-xl font-bold">Steps</h3><ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">{r.steps.split('\n').filter(Boolean).map((t,k)=><li key={k}>{t}</li>)}</ol></div>}))
  return <BookStage W={W} H={H} bookTitle="My Recipe Book" bookAuthor={user.name} coverImage={list.find(r=>r.image)?.image} pages={pages}/>
}
export function Recipes(){
  const {data,upd,add,toast}=useApp(),[sp]=useSearchParams(),[q,setQ]=useState(sp.get('q')||''),[cat,setCat]=useState(''),[fav,setFav]=useState(false),[bk,setBk]=useState(false)
  const missing=sampleRecipes.filter(x=>!data.recipes.some(r=>r.sid===x.sid)),addSamples=()=>{[...missing].reverse().forEach(x=>add('recipes',{...x}));setBk(true);toast('Sample recipes added')}
  const list=data.recipes.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())&&(!cat||r.category===cat)&&(!fav||r.fav))
  return <div><Title sub={`${data.recipes.length} recipes · ${data.recipes.filter(r=>r.fav).length} favorites`} action={<Link className="btn" to="/recipes/new">Add recipe</Link>}>My Recipe Book</Title>
    <div className="flex flex-wrap gap-2 mb-5"><input className="input min-w-0 basis-full sm:max-w-xs sm:basis-auto" placeholder="Search recipes" value={q} onChange={e=>setQ(e.target.value)}/>
      <select className="input min-w-0 flex-1 sm:max-w-40 sm:flex-none" value={cat} onChange={e=>setCat(e.target.value)}><option value="">All categories</option>{catList(data).map(c=><option key={c}>{c}</option>)}</select>
      <button className={fav?'btn':'btn-o'} onClick={()=>setFav(!fav)}>♥ Favorites</button><button className={bk?'btn':'btn-o'} onClick={()=>setBk(!bk)}>Book view</button>{missing.length>0&&<button className="btn-o" onClick={addSamples}>Add sample recipes</button>}</div>
    {list.length&&bk?<RecipeBook list={list}/>:list.length?<div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map(r=><RecipeCard key={r.id} r={r}><Link className="btn-o" to={'/recipes/'+r.id}>Open</Link><button className="btn-o" aria-label="Favorite" onClick={()=>upd('recipes',r.id,{fav:!r.fav})}>{r.fav?'♥':'♡'}</button></RecipeCard>)}</div>
    :<Empty>{data.recipes.length?'No recipes match your filters.':<>Your recipe book is empty. Add your first recipe, or <button className="underline" onClick={addSamples}>load sample recipes</button> to try the book view.</>}</Empty>}</div>
}
export function RecipeDetail(){
  const {id}=useParams(),{data,del,toast,upd,add,ask}=useApp(),nav=useNavigate(),r=data.recipes.find(x=>x.id===id)
  const [u,setU]=useState(()=>localStorage.getItem('bn_unit')||'original'),[t,setT]=useState(()=>localStorage.getItem('bn_temp')||'original'),[nt,setNt]=useState({title:'',text:'',color:NOTE_COLORS[0]}),[sc,setSc]=useState('1'),[menu,setMenu]=useState(false),[from,setFrom]=useState(PANS[2][0]),[to,setTo]=useState(PANS[2][0]),[cur,setCur]=useState(()=>localStorage.getItem('bn_cur')||'₱')
  if(!r)return <Empty>Recipe not found. <Link className="underline" to="/recipes">Back to your book</Link></Empty>
  const pick=(k,set)=>e=>{set(e.target.value);localStorage.setItem(k,e.target.value)}
  const remove=async()=>{if(await ask({title:'Delete this recipe?',text:`“${r.title}” will be removed from your recipe book.`,ok:'Delete',danger:true})){del('recipes',id);toast('Recipe deleted');nav('/recipes')}}
  const f=num(sc)>0?num(sc):1,pf=panFactor(from,to),costs=r.costs||{},sum=Object.values(costs).reduce((a,b)=>a+(+b||0),0),sv=num(r.servings),m=v=>cur+(Math.round(v*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})
  const notes=data.notes.filter(n=>n.recipeId===id)
  const addNote=e=>{e.preventDefault();if(!nt.title.trim()&&!nt.text.trim())return toast('Write something first',1);add('notes',{...nt,category:'Baking Tips',pinned:false,onJournal:false,recipeId:id,x:30,y:30});setNt({...nt,title:'',text:''});toast('Note added')}
  return <article><div className="noprint mb-4 flex flex-wrap gap-2"><Link className="btn-o" to="/recipes">← Back</Link><Link className="btn-o" to={`/recipes/${id}/edit`}>Edit</Link><button className="btn-o" onClick={()=>window.print()}>Print</button><button className="btn-o" onClick={()=>exportCard(r,f,u,t).then(()=>toast('Recipe card saved')).catch(()=>toast('Could not create the card',1))}>Export card</button><button className="btn-o" onClick={()=>upd('recipes',id,{fav:!r.fav})}>{r.fav?'♥ Favorite':'♡ Favorite'}</button><button className="btn-o" onClick={remove}>Delete</button></div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]"><div><div className="relative rounded-[1.5rem] bg-oat p-2 pl-7 shadow-xl sm:rounded-[2rem] sm:p-3 sm:pl-9"><span className="absolute left-0.5 top-20 h-4 w-11 rounded-full border-4 border-stone-400 sm:left-1 sm:top-24 sm:h-5 sm:w-14"/><span className="absolute bottom-20 left-0.5 h-4 w-11 rounded-full border-4 border-stone-400 sm:bottom-24 sm:left-1 sm:h-5 sm:w-14"/><div className="relative min-w-0 rounded-2xl bg-[#fffdf8] p-4 shadow-inner sm:p-6 md:p-10"><span className="absolute right-3 top-3 z-10 rounded-full bg-cocoa px-3 py-1 text-xs text-cream sm:right-5 sm:top-5">{r.category}</span>{r.image&&<img src={r.image} alt={r.title} className="mx-auto mb-4 mt-4 h-36 w-36 rounded-full border-8 border-white object-cover shadow-lg sm:mt-0 sm:h-44 sm:w-44"/>}
    <h1 className="break-words text-3xl font-bold sm:text-4xl">{r.title}</h1><p className="text-caramel">{r.category}</p>
    <p className="my-3 text-sm">Prep {r.prep||'–'} · Bake {r.bake||'–'} · {convTemp(r.temp,t)} · Serves {r.servings?scaleQty(r.servings,f):'–'}{sum>0&&`, ${m(sum*f)} total${sv>0?`, ${m(sum/sv)} per serving`:''}`}</p>
    {r.source&&<p className="text-sm mb-3">Source: {/^https?:/.test(r.source)?<a className="break-all underline" href={r.source} target="_blank" rel="noreferrer">{r.source}</a>:r.source}</p>}
    
    <h2 className="text-xl mt-6 border-b border-cocoa/40 pb-1">Ingredients</h2><ul>{r.ingredients.map((i,k)=><li key={k} className="hand flex justify-between gap-3 border-b border-cocoa/15 text-xl leading-7 sm:text-2xl"><span className="min-w-0">{i.name}</span><span className="shrink-0">{convIng({...i,qty:scaleQty(i.qty,f)},u)}</span></li>)}</ul>
    <h2 className="text-2xl mt-5 mb-2">Steps</h2><ol className="list-decimal pl-5 space-y-1">{r.steps.split('\n').filter(Boolean).map((s,k)=><li key={k}><GlossaryText text={s}/></li>)}</ol>
    </div></div></div><aside className="min-w-0 space-y-4"><div className="noprint card relative z-30 flex flex-wrap items-center gap-x-4 gap-y-3 p-3 text-sm"><label className="flex w-full items-center gap-2 sm:w-auto">Ingredient units <select className="input inline-block w-auto min-w-0 flex-1 sm:flex-none" value={u} onChange={pick('bn_unit',setU)}><option value="original">Original</option><option value="metric">Metric (g, ml)</option><option value="us">US (oz, cups)</option></select></label>
      <label className="flex w-full items-center gap-2 sm:w-auto">Temperature <select className="input inline-block w-auto min-w-0 flex-1 sm:flex-none" value={t} onChange={pick('bn_temp',setT)}><option value="original">Original</option><option value="C">°C</option><option value="F">°F</option></select></label><div className="relative flex w-full items-center gap-2 sm:w-auto">Scale<div className="flex overflow-hidden rounded-xl border border-rose/60 bg-white"><input aria-label="Scale multiplier" inputMode="decimal" value={sc} onChange={e=>setSc(e.target.value.replace(/[^0-9./]/g,''))} className="w-16 px-3 py-2 text-sm outline-none"/><span className="grid place-items-center pr-2">×</span><button type="button" aria-haspopup="listbox" aria-expanded={menu} aria-label="Choose a scale" onClick={()=>setMenu(!menu)} className="border-l border-rose/40 px-2.5 transition hover:bg-blush">▾</button></div>
        {menu&&<ul role="listbox" className="absolute left-0 top-full z-50 mt-1 w-44 sm:left-12 rounded-2xl border border-blush bg-cream p-1 shadow-2xl">{SCALES.map(([v,l])=><li key={v}><button type="button" role="option" aria-selected={f===v} onClick={()=>{setSc(String(v));setMenu(false)}} className={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-blush ${f===v?'bg-blush font-bold':''}`}>{l}</button></li>)}</ul>}</div></div><details className="noprint mt-2 rounded-2xl border border-blush bg-white/70 p-3 text-sm"><summary className="cursor-pointer font-medium">Pan size converter</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><label>Pan in the recipe<select className="input mt-1" value={from} onChange={e=>setFrom(e.target.value)}>{PANS.map(([k])=><option key={k}>{k}</option>)}</select></label><label>Pan you will use<select className="input mt-1" value={to} onChange={e=>setTo(e.target.value)}>{PANS.map(([k])=><option key={k}>{k}</option>)}</select></label></div>
      <p className="mt-3">Your pan holds <b>{pf}×</b> the batter. <button type="button" className="btn ml-1 px-3 py-1" onClick={()=>setSc(String(pf))}>Scale recipe to {pf}×</button></p>
      {pf>1.1&&<p className="mt-2 text-caramel">Bigger pan: the batter will be shallower, so start checking 5 to 10 minutes early.</p>}{pf<.9&&<p className="mt-2 text-caramel">Smaller pan: the batter will be deeper, so it may need 5 to 10 minutes longer. Lower the heat slightly.</p>}</details><details className="noprint rounded-2xl border border-blush bg-white/70 p-3 text-sm"><summary className="cursor-pointer font-medium">Cost of this recipe{sum>0&&<span className="ml-2 text-caramel">{m(sum*f)}{sv>0&&`, ${m(sum/sv)} per serving`}</span>}</summary>
      <div className="mt-3 space-y-2"><label className="flex items-center gap-2">Currency symbol<input className="input w-16" value={cur} onChange={e=>{setCur(e.target.value);localStorage.setItem('bn_cur',e.target.value)}}/></label><p className="text-caramel">Enter what you paid for the amount in the original recipe.</p>
        {r.ingredients.map((i,k)=><label className="flex items-center justify-between gap-3"><span className="min-w-0 truncate">{i.name}</span><input type="number" min="0" step="0.01" aria-label={`Cost of ${i.name}`} className="input w-24 shrink-0 sm:w-28" value={costs[k]??''} onChange={e=>upd('recipes',id,{costs:{...costs,[k]:e.target.value}})}/></label>)}
        {sum>0&&<p className="border-t border-blush pt-2 font-medium">Total at {f}×: {m(sum*f)}{sv>0&&`, ${m(sum/sv)} per serving`}</p>}</div></details><h2 className="text-2xl mt-2 mb-3">Recipe notes</h2>
    <div className="mb-4 flex flex-wrap gap-5">{notes.map(n=><div key={n.id} className="w-full max-w-52 min-w-0 sm:w-52"><StickyNote n={n} onPin={()=>upd('notes',n.id,{pinned:!n.pinned})} onEdit={()=>nav('/notes')} onDel={()=>del('notes',n.id)}/></div>)}{!notes.length&&<p className="text-sm text-cocoa/60">No notes for this recipe yet.</p>}</div>
    <form onSubmit={addNote} className="noprint card p-4 space-y-2 max-w-md"><input aria-label="Note title" className="input" placeholder="Note title" value={nt.title} onChange={e=>setNt({...nt,title:e.target.value})}/><textarea aria-label="Note" className="input" rows={2} placeholder="e.g. Used less sugar – came out better" value={nt.text} onChange={e=>setNt({...nt,text:e.target.value})}/>
      <div className="flex flex-wrap items-center gap-2">{NOTE_COLORS.map(c=><button type="button" key={c} aria-label={'Color '+c} onClick={()=>setNt({...nt,color:c})} style={{background:c}} className={`h-7 w-7 rounded-full border-2 ${nt.color===c?'border-cocoa':'border-transparent'}`}/>)}<input type="color" aria-label="Custom colour" value={nt.color} onChange={e=>setNt({...nt,color:e.target.value})} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"/><button className="btn ml-auto">Add note</button></div></form></aside></div></article>
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
  const rm=k=>setR({...r,ingredients:r.ingredients.filter((_,j)=>j!==k)})
  return <form onSubmit={submit}><Title>{old?'Edit recipe':'Add recipe'}</Title>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="card min-w-0 space-y-4 p-4 sm:p-5"><Field label="Title" error={err.title}><input className="input" value={r.title} onChange={set('title')}/></Field>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><Field label="Category"><select className="input" value={r.category} onChange={set('category')}>{catList(data).map(c=><option key={c}>{c}</option>)}</select></Field>
          {[['servings','Servings'],['prep','Prep (min)'],['bake','Bake (min)'],['temp','Temperature']].map(([k,l])=><Field key={k} label={l}><input className="input" value={r[k]} onChange={set(k)}/></Field>)}</div>
        <Field label="Photo"><ImageUpload value={r.image} onChange={v=>setR({...r,image:v})}/></Field>
        <Field label="Reference website or YouTube link" error={err.source}><input className="input" value={r.source} onChange={set('source')} placeholder="https://"/></Field></div>
      <div className="min-w-0 space-y-6"><div className="card p-4 sm:p-5"><p className="mb-2 font-bold">Ingredients</p>
        <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_2rem] gap-2 px-1 pb-1 text-xs font-medium text-caramel sm:grid"><span>Ingredient</span><span>Quantity</span><span>Unit</span><span/></div>
        {r.ingredients.map((i,k)=><div key={k} className="mb-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-2 border-b border-blush pb-3 last:border-0 sm:mb-2 sm:grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_2rem] sm:border-0 sm:pb-0"><input aria-label="Ingredient" className="input col-span-3 sm:col-span-1" placeholder="e.g. Flour" value={i.name} onChange={e=>setI(k,'name',e.target.value)}/><input aria-label="Quantity" inputMode="decimal" className="input" placeholder="1.5" value={i.qty} onChange={e=>setI(k,'qty',e.target.value.replace(/-/g,''))}/><UnitSelect value={i.unit} onChange={v=>setI(k,'unit',v)}/><button type="button" aria-label="Remove ingredient" onClick={()=>rm(k)} className="grid place-items-center rounded-full transition hover:bg-blush">✕</button></div>)}
        {err.ing&&<p className="text-xs text-red-700">{err.ing}</p>}<button type="button" className="btn-o" onClick={()=>setR({...r,ingredients:[...r.ingredients,{name:'',qty:'',unit:'g'}]})}>+ Ingredient</button></div>
        <div className="card p-4 sm:p-5"><Field label="Steps (one per line)" error={err.steps}><textarea rows={8} className="input" value={r.steps} onChange={set('steps')}/></Field></div></div></div>
    <div className="mt-6 flex flex-wrap gap-2"><button className="btn">Save recipe</button><Link className="btn-o" to="/recipes">Cancel</Link></div></form>
}
