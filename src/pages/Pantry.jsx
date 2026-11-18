import Icon from '../components/Icon.jsx'
import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,Field,UnitSelect} from '../components/ui.jsx'
import {exportList} from '../cardExport.js'
import {SAMPLE_PANTRY,dayPlus} from '../demoSeed.js'
import {AISLES,aisle,matchRecipes} from '../utils.js'
// Each jar can hold several batches (restocks) with their own expiry dates. Oldest-expiring stock is used first.
const byExp=(a,b)=>!a.exp?1:!b.exp?-1:a.exp.localeCompare(b.exp)
const batchesOf=i=>(i.batches?.length?i.batches:[{qty:+i.qty||0,exp:i.exp||''}]).filter(b=>+b.qty>0).map(b=>({qty:+b.qty,exp:b.exp||''})).sort(byExp)
const pack=bs=>{const b=bs.filter(x=>+x.qty>0).sort(byExp);return{batches:b,qty:b.reduce((t,x)=>t+x.qty,0),exp:b.find(x=>x.exp)?.exp||''}}
const daysTo=e=>Math.ceil((new Date(e)-new Date(new Date().toISOString().slice(0,10)))/864e5)
const COL={exp:'#C0392B',soon:'#E5A24A',ok:'#C9A29B',none:'#DCC8C1'}
const stat=b=>{if(!b.exp)return'none';const d=daysTo(b.exp);return d<0?'exp':d<=7?'soon':'ok'}
const kindOf=i=>/\beggs?\b/i.test(i.name)?'carton':/lemon|lime|orange|apple|banana|fruit/i.test(i.name)?'basket':/^(ml|l)$/i.test(i.unit||'')?'bottle':'jar'
const SHAPE={jar:{d:'M16 20H64Q74 20 74 32V94Q74 106 62 106H18Q6 106 6 94V32Q6 20 16 20Z',top:20,bot:106,label:'top-[52%]'},bottle:{d:'M32 12H48V30C48 37 72 38 72 52V96Q72 106 62 106H18Q8 106 8 96V52C8 38 32 37 32 30Z',top:38,bot:106,label:'top-[66%]'}}
// Glass container (jar or bottle) whose fill is drawn as one coloured layer per batch.
// Soonest-to-expire sits on top, because that is the stock you use first.
function Glass({i,bs,kind,pct}){
  const sh=SHAPE[kind],H=(sh.bot-sh.top)*pct/100,total=bs.reduce((t,b)=>t+b.qty,0)||1,id='c'+i.id
  let y=sh.bot;const layers=[...bs].reverse().map((b,k)=>{const h=H*b.qty/total;y-=h;return <rect key={k} x="0" y={y} width="80" height={h+.5} fill={COL[stat(b)]} fillOpacity=".85" stroke="#fff" strokeWidth={bs.length>1?1.5:0}/>})
  return <div className="relative mx-auto w-20 transition group-hover:-translate-y-1"><svg viewBox="0 0 80 110" className="block w-20 drop-shadow-md" aria-hidden="true"><defs><clipPath id={id}><path d={sh.d}/></clipPath></defs>
    {kind==='jar'?<><rect x="12" y="3" width="56" height="15" rx="5" fill="#7A6258"/><path d="M20 6V15M30 6V15M40 6V15M50 6V15M60 6V15" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5"/><rect x="12" y="3" width="56" height="4" rx="2" fill="#fff" fillOpacity=".2"/></>
      :<><rect x="28" y="2" width="24" height="11" rx="3" fill="#7A6258"/><path d="M34 4V11M40 4V11M46 4V11" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5"/></>}
    <path d={sh.d} fill="#fff" fillOpacity=".4"/><g clipPath={`url(#${id})`}>{layers}</g>
    {[25,50,75].map(p=><path key={p} d={`M${kind==='jar'?64:66} ${sh.bot-(sh.bot-sh.top)*p/100}H74`} stroke="#3B2A2A" strokeOpacity=".3" strokeWidth="1.2"/>)}
    <path d={sh.d} fill="none" stroke="#fff" strokeOpacity=".95" strokeWidth="2.5"/>
    <path d={kind==='jar'?'M13 34Q11 62 14 92':'M14 56Q12 78 15 96'} stroke="#fff" strokeOpacity=".6" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    <ellipse cx={kind==='jar'?64:62} cy={kind==='jar'?30:52} rx="2.5" ry="5" fill="#fff" fillOpacity=".55"/></svg>
    <span className={`absolute inset-x-1.5 ${sh.label} -translate-y-1/2 rounded-md border border-caramel/30 bg-cream/90 px-1 py-0.5 text-[10px] font-bold leading-tight shadow-sm`}>{i.name}</span></div>
}
// Egg carton: one egg per piece. Eggs closest to expiry come first and are tinted amber or red.
function Carton({i,bs}){
  const eggs=bs.flatMap(b=>Array(Math.round(b.qty)).fill(stat(b))),shown=eggs.slice(0,12)
  return <div className="relative mx-auto w-28 transition group-hover:-translate-y-1"><svg viewBox="0 0 120 80" className="block w-28 drop-shadow-md" aria-hidden="true">
    <rect x="12" y="2" width="96" height="26" rx="7" fill="#CDB6A0" stroke="#A98F78" strokeWidth="1.5"/><rect x="20" y="9" width="80" height="4" rx="2" fill="#fff" fillOpacity=".25"/>
    <rect x="3" y="22" width="114" height="52" rx="9" fill="#DCC7B2" stroke="#A98F78" strokeWidth="1.5"/>
    {Array.from({length:12},(_,k)=>{const cx=17+(k%6)*17.2,cy=(k<6?37:56),st=shown[k]
      return <g key={k}><ellipse cx={cx} cy={cy+2} rx="8" ry="7.5" fill="#B99F88" fillOpacity=".7"/>{st&&<><ellipse cx={cx} cy={cy} rx="6.5" ry="8" fill={st==='ok'||st==='none'?'#FBF3E8':COL[st]} fillOpacity={st==='ok'||st==='none'?1:.45} stroke={st==='ok'||st==='none'?'#E6D5C0':COL[st]} strokeWidth="1.6"/><ellipse cx={cx-2} cy={cy-3} rx="1.6" ry="2.4" fill="#fff" fillOpacity=".8"/></>}</g>})}</svg>
    {eggs.length>12&&<span className="absolute right-1 top-0 rounded-full bg-cocoa px-1.5 text-[10px] text-cream">+{eggs.length-12}</span>}
    <span className="absolute inset-x-4 bottom-1 rounded-md border border-caramel/30 bg-cream/90 px-1 py-0.5 text-[10px] font-bold leading-tight shadow-sm">{i.name}</span></div>
}
// Fruit basket for lemons and similar pieces. Fruit near expiry turns orange, then brown.
function Basket({i,bs}){
  const fruit=bs.flatMap(b=>Array(Math.round(b.qty)).fill(stat(b))).slice(0,8),P=[[55,34],[32,38],[78,38],[44,44],[67,44],[22,47],[88,47],[55,46]],C={exp:'#A9794F',soon:'#E9A23B',ok:'#F2D45C',none:'#F2D45C'}
  return <div className="relative mx-auto w-24 transition group-hover:-translate-y-1"><svg viewBox="0 0 110 92" className="block w-24 drop-shadow-md" aria-hidden="true">
    <path d="M16 52C14 6 96 6 94 52" fill="none" stroke="#9B7248" strokeWidth="4.5" strokeLinecap="round"/>
    {fruit.map((st,k)=><g key={k}><ellipse cx={P[k][0]} cy={P[k][1]} rx="12" ry="8.5" fill={C[st]} stroke="#00000022"/><circle cx={P[k][0]+11} cy={P[k][1]} r="1.8" fill={C[st]} stroke="#00000022"/><ellipse cx={P[k][0]-4} cy={P[k][1]-3} rx="4" ry="1.8" fill="#fff" fillOpacity=".5"/></g>)}
    <path d="M8 50H102L92 84Q91 89 85 89H25Q19 89 18 84Z" fill="#C79A6B" stroke="#9B7248" strokeWidth="1.5"/>
    <path d="M12 61H98M15 72H95M18 82H92M30 50L26 88M50 50L48 88M70 50L72 88M90 50L86 88" stroke="#9B7248" strokeOpacity=".55" strokeWidth="1.4"/><rect x="6" y="46" width="98" height="7" rx="3.5" fill="#B5885A" stroke="#9B7248" strokeWidth="1.3"/></svg>
    <span className="absolute inset-x-3 bottom-1.5 rounded-md border border-caramel/30 bg-cream/90 px-1 py-0.5 text-[10px] font-bold leading-tight shadow-sm">{i.name}</span></div>
}
function Jar({i,adj,del,discard}){
  const step=['g','ml'].includes(i.unit?.toLowerCase())?50:1,pct=i.full?Math.min(100,(+i.qty/i.full)*100):0,bs=batchesOf(i),multi=bs.length>1,kind=kindOf(i)
  const hasExpired=bs.some(b=>b.exp&&daysTo(b.exp)<0),txt=b=>{if(!b.exp)return'no date';const d=daysTo(b.exp);return d<0?'expired':d===0?'expires today':`expires in ${d}d`}
  return <div className="group w-28 text-center">
    {kind==='carton'?<Carton i={i} bs={bs}/>:kind==='basket'?<Basket i={i} bs={bs}/>:<Glass i={i} bs={bs} kind={kind} pct={pct}/>}
    <p className="mt-1 text-xs">{+i.qty>0?`${i.qty} ${i.unit}`:<b className="text-red-700">Out of stock</b>}</p>
    {multi?<ul aria-label="Batches, used first at the top" className="mx-auto mt-0.5 w-fit space-y-px text-left text-[10px] leading-tight">{bs.map((b,k)=><li key={k} className="flex items-center gap-1"><span style={{background:COL[stat(b)]}} className="h-2 w-2 shrink-0 rounded-sm border border-white"/><span className={stat(b)==='exp'?'text-red-700':stat(b)==='soon'?'text-amber-700':'text-cocoa/70'}>{b.qty} {i.unit} · {txt(b)}</span>{k===0&&<span className="text-cocoa/50">↑ first</span>}</li>)}</ul>
      :bs[0]?.exp&&daysTo(bs[0].exp)<=7&&<p className={`text-[10px] ${daysTo(bs[0].exp)<0?'text-red-700':'text-amber-700'}`}>{daysTo(bs[0].exp)<0?'Expired':`Expires in ${daysTo(bs[0].exp)}d`}</p>}
    <div className="mt-1 flex justify-center gap-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100"><button aria-label="Less" className="h-6 w-6 rounded-full bg-cocoa text-cream" onClick={()=>adj(i,-step)}>−</button><button aria-label="More" className="h-6 w-6 rounded-full bg-cocoa text-cream" onClick={()=>adj(i,step)}>+</button>{hasExpired&&<button aria-label="Discard expired stock" title="Discard expired stock" className="h-6 rounded-full bg-red-700 px-2 text-[10px] text-white" onClick={()=>discard(i)}>Toss</button>}<button aria-label="Remove" className="h-6 w-6 rounded-full border border-cocoa/40" onClick={()=>del('pantry',i.id)}>✕</button></div></div>
}
export function Pantry(){
  const {data,add,upd,del,toast}=useApp(),[f,setF]=useState({name:'',qty:'',unit:'g',exp:''}),[err,setErr]=useState('')
  const submit=e=>{e.preventDefault();if(!f.name.trim())return setErr('Enter a name.');if(f.qty===''||+f.qty<0)return setErr('Enter a quantity of 0 or more.')
    const name=f.name.trim(),ex=data.pantry.find(p=>p.name.trim().toLowerCase()===name.toLowerCase()&&(p.unit||'')===(f.unit||''))
    if(ex){const p=pack([...batchesOf(ex),{qty:+f.qty,exp:f.exp}]);upd('pantry',ex.id,{...p,full:Math.max(ex.full||0,p.qty)});toast(`Restocked ${ex.name}. Older stock will be used first`)}
    else{const p=pack([{qty:+f.qty,exp:f.exp}]);add('pantry',{name,unit:f.unit,...p,qty:+f.qty,exp:f.exp,full:+f.qty});toast('Added to pantry')}
    setF({name:'',qty:'',unit:'g',exp:''});setErr('')}
  const missing=SAMPLE_PANTRY.filter(x=>!data.pantry.some(p=>p.name.toLowerCase()===x[0].toLowerCase()))
  const addSamples=()=>{missing.forEach(([name,qty,unit,days])=>add('pantry',{name,qty,unit,exp:days==null?'':dayPlus(days),full:qty||250}));toast(`${missing.length} sample ingredients added`)}
  const adj=(i,d)=>{let bs=batchesOf(i);if(d>0){if(bs.length)bs[bs.length-1]={...bs[bs.length-1],qty:bs[bs.length-1].qty+d};else bs=[{qty:d,exp:''}]}else{let left=-d;bs=bs.map(b=>{const t=Math.min(b.qty,left);left-=t;return{...b,qty:b.qty-t}})}
    const p=pack(bs);upd('pantry',i.id,{...p,full:Math.max(i.full||0,p.qty)})}
  const discard=i=>{const p=pack(batchesOf(i).filter(b=>!b.exp||daysTo(b.exp)>=0));upd('pantry',i.id,p);toast(`Expired ${i.name} removed`)}
  return <div><Title sub={`${data.pantry.length} ingredients · ${data.pantry.filter(i=>!(+i.qty>0)).length} out of stock · hover an item to adjust it · stacked colours show each batch, top is used first`} action={missing.length>0&&<button className="btn-o" onClick={addSamples}>Add sample ingredients</button>}>My Pantry</Title>
    <form onSubmit={submit} className="card p-4 flex flex-wrap gap-2 items-end mb-5"><Field label="Ingredient"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Quantity"><input type="number" min="0" step="any" inputMode="decimal" className="input w-24" value={f.qty} onKeyDown={e=>['-','+','e','E'].includes(e.key)&&e.preventDefault()} onChange={e=>setF({...f,qty:+e.target.value<0?'0':e.target.value})}/></Field><Field label="Unit"><UnitSelect value={f.unit} onChange={v=>setF({...f,unit:v})} className="w-28"/></Field><Field label="Expires"><input type="date" className="input" value={f.exp} onChange={e=>setF({...f,exp:e.target.value})}/></Field><button className="btn">Add jar</button>{err&&<p role="alert" className="text-red-700 text-sm w-full">{err}</p>}</form>
    <div className="rounded-[2rem] bg-caramel p-3 md:p-5 shadow-xl border-b-[12px] border-cocoa"><div className="rounded-2xl bg-blush p-3 md:p-5 shadow-inner space-y-0">
      {AISLES.map(a=>{const items=data.pantry.filter(i=>aisle(i.name)===a);return <div key={a}><p className="hand text-2xl text-caramel">{a}</p><div className="flex flex-wrap gap-4 min-h-32 items-end pb-1 pt-2 border-b-[10px] border-caramel rounded-b-md mb-4">{items.map(i=><Jar key={i.id} i={i} adj={adj} del={del} discard={discard}/>)}{!items.length&&<p className="text-xs text-cocoa/50 pb-3">Empty shelf</p>}</div></div>})}
    </div></div></div>
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
