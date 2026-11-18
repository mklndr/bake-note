import Icon from '../components/Icon.jsx'
import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,Field,UnitSelect} from '../components/ui.jsx'
import {exportList} from '../cardExport.js'
import {SAMPLE_PANTRY,dayPlus} from '../demoSeed.js'
import {AISLES,aisle,matchRecipes} from '../utils.js'
const today=()=>new Date().toISOString().slice(0,10)
function Jar({i,adj,del}){
  const step=['g','ml'].includes(i.unit?.toLowerCase())?50:1,pct=i.full?Math.min(100,(+i.qty/i.full)*100):0,days=i.exp?Math.ceil((new Date(i.exp)-new Date(today()))/864e5):null
  return <div className="group w-28 text-center"><div className="mx-auto w-20 transition group-hover:-translate-y-1"><div className="h-3 mx-4 rounded-t bg-caramel"/>
    <div className="relative h-24 rounded-b-2xl rounded-t-lg border-2 border-white/90 bg-white/50 overflow-hidden"><div style={{height:pct+'%'}} className="absolute bottom-0 inset-x-0 bg-rose/70 transition-all duration-500"/><span className="absolute inset-0 grid place-items-center text-[11px] font-bold px-1 leading-tight">{i.name}</span></div></div>
    <p className="text-xs mt-1">{+i.qty>0?`${i.qty} ${i.unit}`:<b className="text-red-700">Out of stock</b>}</p>
    {days!==null&&days<=7&&<p className={`text-[10px] ${days<0?'text-red-700':'text-amber-700'}`}>{days<0?'Expired':`Expires in ${days}d`}</p>}
    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition mt-1"><button aria-label="Less" className="h-6 w-6 rounded-full bg-cocoa text-cream" onClick={()=>adj(i,-step)}>−</button><button aria-label="More" className="h-6 w-6 rounded-full bg-cocoa text-cream" onClick={()=>adj(i,step)}>+</button><button aria-label="Remove" className="h-6 w-6 rounded-full border border-cocoa/40" onClick={()=>del('pantry',i.id)}>✕</button></div></div>
}
export function Pantry(){
  const {data,add,upd,del,toast}=useApp(),[f,setF]=useState({name:'',qty:'',unit:'g',exp:''}),[eq,setEq]=useState(''),[err,setErr]=useState('')
  const submit=e=>{e.preventDefault();if(!f.name.trim())return setErr('Enter a name.');if(f.qty===''||+f.qty<0)return setErr('Enter a quantity of 0 or more.');add('pantry',{...f,full:+f.qty});setF({name:'',qty:'',unit:'g',exp:''});setErr('');toast('Added to pantry')}
  const missing=SAMPLE_PANTRY.filter(x=>!data.pantry.some(p=>p.name.toLowerCase()===x[0].toLowerCase()))
  const addSamples=()=>{missing.forEach(([name,qty,unit,days])=>add('pantry',{name,qty,unit,exp:days==null?'':dayPlus(days),full:qty||250}));toast(`${missing.length} sample ingredients added`)}
  const adj=(i,d)=>{const q=Math.max(0,(+i.qty||0)+d);upd('pantry',i.id,{qty:q,full:Math.max(i.full||0,q)})}
  return <div><Title sub={`${data.pantry.length} ingredients · ${data.pantry.filter(i=>!(+i.qty>0)).length} out of stock · hover a jar to adjust it`} action={missing.length>0&&<button className="btn-o" onClick={addSamples}>Add sample ingredients</button>}>My Pantry</Title>
    <form onSubmit={submit} className="card p-4 flex flex-wrap gap-2 items-end mb-5"><Field label="Ingredient"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Quantity"><input type="number" min="0" step="any" inputMode="decimal" className="input w-24" value={f.qty} onKeyDown={e=>['-','+','e','E'].includes(e.key)&&e.preventDefault()} onChange={e=>setF({...f,qty:+e.target.value<0?'0':e.target.value})}/></Field><Field label="Unit"><UnitSelect value={f.unit} onChange={v=>setF({...f,unit:v})} className="w-28"/></Field><Field label="Expires"><input type="date" className="input" value={f.exp} onChange={e=>setF({...f,exp:e.target.value})}/></Field><button className="btn">Add jar</button>{err&&<p role="alert" className="text-red-700 text-sm w-full">{err}</p>}</form>
    <div className="rounded-[2rem] bg-caramel p-3 md:p-5 shadow-xl border-b-[12px] border-cocoa"><div className="rounded-2xl bg-blush p-3 md:p-5 shadow-inner space-y-0">
      {AISLES.map(a=>{const items=data.pantry.filter(i=>aisle(i.name)===a);return <div key={a}><p className="hand text-2xl text-caramel">{a}</p><div className="flex flex-wrap gap-4 min-h-32 items-end pb-1 pt-2 border-b-[10px] border-caramel rounded-b-md mb-4">{items.map(i=><Jar key={i.id} i={i} adj={adj} del={del}/>)}{!items.length&&<p className="text-xs text-cocoa/50 pb-3">Empty shelf</p>}</div></div>})}
      <p className="hand text-2xl text-caramel">Equipment drawer</p>
      <div className="rounded-xl bg-caramel/20 border-2 border-caramel p-3 flex flex-wrap gap-2 items-center">{data.equipment.map(e=><button key={e.id} onClick={()=>upd('equipment',e.id,{have:!e.have})} onContextMenu={x=>{x.preventDefault();del('equipment',e.id)}} title="Click to toggle · right-click or ✕ to remove" className={`rounded-xl px-3 py-2 text-sm transition hover:-translate-y-0.5 ${e.have?'bg-cocoa text-cream':'bg-white line-through opacity-60'}`}><Icon n="chef" size={16} className="inline -mt-0.5 mr-1"/>{e.name} <span role="button" aria-label="Remove" onClick={x=>{x.stopPropagation();del('equipment',e.id)}} className="ml-1 opacity-70">✕</span></button>)}
        <form onSubmit={x=>{x.preventDefault();if(eq.trim()){add('equipment',{name:eq.trim(),have:true});setEq('')}}} className="flex gap-1"><input aria-label="Equipment" className="input w-40" placeholder="Add a tool" value={eq} onChange={e=>setEq(e.target.value)}/><button className="btn">Add</button></form></div></div></div></div>
}
export function Bake(){
  const {data,add,toast}=useApp(),[tab,setTab]=useState('all'),rows=matchRecipes(data.recipes,data.pantry)
  const g={ready:x=>!x.missing.length,almost:x=>x.missing.length>0&&x.missing.length<=2,need:x=>x.missing.length>2}
  const tabs=[['all','All',rows.length],['ready','Ready to bake',rows.filter(g.ready).length],['almost','Almost ready',rows.filter(g.almost).length],['need','Need more',rows.filter(g.need).length]]
  const shop=m=>{const ex=data.shopping.map(s=>s.name.toLowerCase());m.forEach(i=>{if(!ex.includes(i.name.toLowerCase()))add('shopping',{name:i.name,qty:i.qty,unit:i.unit,done:false})});toast('Missing items added to shopping list')}
  const list=rows.filter(x=>tab==='all'||g[tab](x)).sort((a,b)=>b.pct-a.pct)
  return <div><Title sub="Recipes matched against your pantry">What Can I Bake?</Title>
    {!data.recipes.length?<Empty>Save a recipe first, then fill your pantry. <Link className="underline" to="/discover">Discover recipes</Link></Empty>:<>
    <div className="flex flex-wrap gap-2 mb-5">{tabs.map(([k,l,n])=><button key={k} onClick={()=>setTab(k)} className={tab===k?'btn':'btn-o'}><Icon n={{all:'cake',ready:'flame',almost:'clock',need:'cart'}[k]} size={16}/>{l} ({n})</button>)}</div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(({r,missing,pct})=><div key={r.id} className="card lift overflow-hidden">
      <div className="flex gap-3 p-4">{r.image?<img src={r.image} alt="" className="h-16 w-16 rounded-2xl object-cover"/>:<div className="h-16 w-16 rounded-2xl bg-blush grid place-items-center text-rose"><Icon n="cake" size={26}/></div>}
        <div className="flex-1 min-w-0"><Link to={'/recipes/'+r.id} className="font-serif font-bold text-lg underline block truncate">{r.title}</Link><p className="text-xs">{pct===100?'You have everything!':`${pct}% of ingredients on hand`}</p>
        <div className="h-2 rounded-full bg-blush mt-1 overflow-hidden"><div style={{width:pct+'%'}} className={`h-full transition-all duration-700 ${pct===100?'bg-green-600':'bg-rose'}`}/></div></div></div>
      <div className="px-4 pb-4"><div className="flex flex-wrap gap-1">{r.ingredients.map((i,k)=>{const m=missing.includes(i);return <span key={k} className={`text-xs rounded-full px-2 py-0.5 ${m?'bg-red-100 text-red-800':'bg-green-100 text-green-800'}`}>{m?'✗':'✓'} {i.name}</span>})}</div>
        {missing.length>0&&<button className="btn-o mt-3" onClick={()=>shop(missing)}><Icon n="cart" size={16}/> Add {missing.length} missing to list</button>}</div></div>)}</div>
    {!list.length&&<Empty>Nothing in this group yet.</Empty>}</>}</div>
}
export function Shopping(){
  const {data,add,upd,del,toast}=useApp(),[f,setF]=useState({name:'',qty:'',unit:'g',aisle:''}),done=data.shopping.filter(s=>s.done)
  const submit=e=>{e.preventDefault();if(!f.name.trim())return;add('shopping',{...f,aisle:f.aisle||aisle(f.name),done:false});setF({name:'',qty:'',unit:'g',aisle:''})}
  return <div><Title sub={`${data.shopping.filter(s=>!s.done).length} items to buy · sorted by store section`} action={data.shopping.some(x=>!x.done)&&<button className="btn" onClick={()=>exportList(data.shopping).then(()=>toast('Shopping list saved')).catch(()=>toast('Could not create the image',1))}>Save as image</button>}>Shopping List</Title>
    <form onSubmit={submit} className="card mb-6 grid items-end gap-3 p-4 md:grid-cols-[minmax(0,1fr)_6rem_7rem_11rem_auto]"><Field label="Item"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Quantity"><input inputMode="decimal" className="input" value={f.qty} onChange={e=>setF({...f,qty:e.target.value.replace(/-/g,'')})}/></Field><Field label="Unit"><UnitSelect value={f.unit} onChange={v=>setF({...f,unit:v})}/></Field>
      <Field label="Section"><select className="input" value={f.aisle} onChange={e=>setF({...f,aisle:e.target.value})}><option value="">Auto section</option>{AISLES.map(a=><option key={a}>{a}</option>)}</select></Field><button className="btn h-[38px]">Add</button></form>
    {data.shopping.length?<><div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">{AISLES.map((a,n)=>{const items=data.shopping.filter(s=>(s.aisle||aisle(s.name))===a);return items.length>0&&<section key={a} style={{transform:`rotate(${n%2?1:-1}deg)`,backgroundImage:'repeating-linear-gradient(transparent,transparent 31px,#F4C6C3 32px)'}} className="relative bg-[#fffaf0] pt-6 px-5 pb-4 shadow-lg transition hover:rotate-0 hover:-translate-y-1"><span className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-20 bg-rose/60 rotate-2"/>
        <h2 className="hand text-3xl h-8 leading-8 mb-1">{a}</h2><ul>{items.map(s=><li key={s.id} className="h-8 flex items-center gap-2"><input type="checkbox" aria-label={'Bought '+s.name} checked={s.done} onChange={()=>upd('shopping',s.id,{done:!s.done})}/><span className={`flex-1 hand text-xl leading-8 ${s.done?'line-through opacity-50':''}`}>{s.name} {s.qty} {s.unit}</span><button aria-label="Remove" className="text-xs" onClick={()=>del('shopping',s.id)}>✕</button></li>)}</ul></section>})}</div>
      {done.length>0&&<button className="btn-o mt-6" onClick={()=>done.forEach(s=>del('shopping',s.id))}>Clear {done.length} purchased</button>}</>:<Empty>Your list is empty. Add items or use “What Can I Bake?”</Empty>}</div>
}
