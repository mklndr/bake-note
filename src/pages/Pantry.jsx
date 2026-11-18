import Icon from '../components/Icon.jsx'
import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,Field,UnitSelect,Modal} from '../components/ui.jsx'
import {exportList} from '../cardExport.js'
import {SAMPLE_PANTRY,dayPlus} from '../demoSeed.js'
import {AISLES,aisle,matchRecipes} from '../utils.js'
const daysTo=e=>Math.ceil((new Date(e)-new Date(new Date().toLocaleDateString('en-CA')))/864e5)
const nice=e=>new Date(e+'T00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})
const key=n=>String(n).trim().toLowerCase()
// What the container holds decides its colour, and the ingredient decides which container it gets.
const COLORS=[[/brown sugar/i,'#A9774B'],[/powdered|icing|confectioner/i,'#EFE8DC'],[/sugar/i,'#ECE3D6'],[/flour/i,'#E6D8BC'],[/cocoa|cacao/i,'#5B3A2E'],[/chocolate|choc/i,'#4A2F28'],[/baking powder/i,'#E9E4DA'],[/baking soda|bicarb/i,'#EDE8DF'],[/salt/i,'#EEEEE8'],[/yeast/i,'#C9A46C'],[/starch/i,'#EBE5D8'],[/walnut|pecan|almond|nut/i,'#B58B62'],[/oat/i,'#D8C29B'],[/cinnamon/i,'#9C5B34'],[/oil/i,'#E6C23E'],[/honey|syrup|molasses/i,'#E09B24'],[/vanilla/i,'#5E331F'],[/milk/i,'#F4F2EA'],[/cream cheese/i,'#F3E7CF'],[/cream/i,'#F7E9C8'],[/butter/i,'#F6D45E'],[/yogh?urt|sour/i,'#F0EADD']]
const colorOf=n=>COLORS.find(([r])=>r.test(n))?.[1]||'#CDAFA6'
const KINDS=[[/\beggs?\b/i,'carton'],[/lemon|lime|orange|apple|banana|fruit|berry|berries/i,'basket'],[/butter(?!milk|scotch)|margarine/i,'butter'],[/cream cheese|yogh?urt|sour cream|ricotta|mascarpone/i,'tub'],[/milk|cream/i,'milk'],[/vanilla|extract|essence/i,'dropper'],[/honey|syrup|molasses|jam/i,'honey'],[/oil|vinegar/i,'oil'],[/baking powder|baking soda|cocoa|yeast|starch|cinnamon|spice|nutmeg|ginger/i,'canister']]
const kindOf=i=>KINDS.find(([r])=>r.test(i.name))?.[1]||(/^(ml|l)$/i.test(i.unit||'')?'oil':'jar')
const R='#7A6258',D='#3B2A2A'
const SPEC={
  jar:{d:'M16 20H64Q74 20 74 32V94Q74 106 62 106H18Q6 106 6 94V32Q6 20 16 20Z',top:20,bot:106,tx:64,label:'inset-x-1.5 top-[54%]',shine:'M13 34Q11 62 14 92',decor:<><rect x="12" y="3" width="56" height="15" rx="5" fill={R}/><path d="M20 6V15M30 6V15M40 6V15M50 6V15M60 6V15" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5"/><rect x="12" y="3" width="56" height="4" rx="2" fill="#fff" fillOpacity=".2"/></>},
  canister:{d:'M8 32H72V98Q72 106 64 106H16Q8 106 8 98Z',top:32,bot:106,tx:62,label:'inset-x-1 top-[64%]',shine:'M14 44V96',decor:<><path d="M8 32V26Q8 12 40 12Q72 12 72 26V32Z" fill={R}/><circle cx="40" cy="9" r="4.5" fill={D}/><rect x="8" y="29" width="64" height="5" fill={D} fillOpacity=".55"/><path d="M20 21Q40 15 60 21" stroke="#fff" strokeOpacity=".25" strokeWidth="2" fill="none"/></>},
  oil:{d:'M34 8H46V36C46 42 62 46 62 60V100Q62 106 56 106H24Q18 106 18 100V60C18 46 34 42 34 36Z',top:46,bot:106,liquid:1,tx:54,label:'inset-x-3.5 top-[72%]',shine:'M24 64V98',decor:<><rect x="32" y="2" width="16" height="9" rx="2.5" fill="#C79A6B"/><path d="M34 12H46" stroke="#fff" strokeOpacity=".6" strokeWidth="2"/></>},
  milk:{d:'M28 14H52V26C52 34 70 38 70 52V98Q70 106 62 106H18Q10 106 10 98V52C10 38 28 34 28 26Z',top:38,bot:106,liquid:1,tx:61,label:'inset-x-2 top-[70%]',shine:'M16 58V96',decor:<><rect x="26" y="5" width="28" height="10" rx="3" fill="#A9B7C4"/><path d="M30 8H50" stroke="#fff" strokeOpacity=".6" strokeWidth="1.6"/></>},
  dropper:{d:'M22 46H58Q64 46 64 54V98Q64 106 56 106H24Q16 106 16 98V54Q16 46 22 46Z',top:46,bot:106,liquid:1,tint:'#B87A2E',tx:56,label:'inset-x-2.5 top-[74%]',shine:'M21 60V96',decor:<><rect x="33" y="36" width="14" height="10" rx="2" fill={D}/><path d="M32 36Q31 8 40 4Q49 8 48 36Z" fill={D}/><path d="M36 30Q36 14 40 9" stroke="#fff" strokeOpacity=".3" strokeWidth="2" fill="none"/></>},
  honey:{d:'M18 26H62Q76 32 76 58V92Q76 106 62 106H18Q4 106 4 92V58Q4 32 18 26Z',top:26,bot:106,liquid:1,tx:65,label:'inset-x-2 top-[62%]',shine:'M11 50Q9 74 12 94',decor:<><path d="M9 17H71V28H9Z" fill="#D9A59B"/><path d="M9 22H71M24 17V28M40 17V28M56 17V28" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2"/><path d="M8 29H72" stroke={R} strokeWidth="2.5"/></>},
  tub:{d:'M6 54H74L68 100Q67 106 60 106H20Q13 106 12 100Z',top:54,bot:106,tx:60,label:'inset-x-3 top-[78%]',shine:'M14 64L18 96',decor:<><rect x="3" y="41" width="74" height="13" rx="5" fill="#FBF7F4" stroke="#D9C4B4" strokeWidth="1.5"/><rect x="30" y="37" width="20" height="5" rx="2.5" fill="#D9C4B4"/></>}}
const plate='absolute rounded-md border border-caramel/30 bg-cream/90 px-1 py-0.5 text-[10px] font-bold leading-tight shadow-sm'
// Clear glass containers (jar, canister, bottles, tub). The fill level shows how much is left.
function Glass({i,kind,pct,col}){
  const sh=SPEC[kind],H=(sh.bot-sh.top)*pct/100,id='c'+String(i.id).replace(/\W/g,'')
  return <div className="relative mx-auto w-20 transition group-hover:-translate-y-1"><svg viewBox="0 0 80 110" className="block w-20 drop-shadow-md" aria-hidden="true"><defs><clipPath id={id}><path d={sh.d}/></clipPath></defs>
    <path d={sh.d} fill="#fff" fillOpacity=".3"/><g clipPath={`url(#${id})`}>{H>0&&<><rect x="0" y={sh.bot-H} width="80" height={H+1} fill={col} fillOpacity={sh.liquid?.93:1}/><rect x="0" y={sh.bot-H} width="80" height="2" fill="#000" fillOpacity=".12"/><rect x="0" y={sh.bot-H+2} width="80" height="3" fill="#fff" fillOpacity=".35"/><rect x="0" y={sh.bot-H} width="80" height={H+1} fill="#000" fillOpacity=".04"/></>}{sh.tint&&<rect x="0" y="0" width="80" height="110" fill={sh.tint} fillOpacity=".22"/>}</g>
    {[25,50,75].map(p=><path key={p} d={`M${sh.tx} ${sh.bot-(sh.bot-sh.top)*p/100}h8`} stroke={D} strokeOpacity=".28" strokeWidth="1.2"/>)}
    <path d={sh.d} fill="none" stroke="#fff" strokeOpacity=".95" strokeWidth="2.5"/><path d={sh.shine} stroke="#fff" strokeOpacity=".6" strokeWidth="3.5" strokeLinecap="round" fill="none"/>{sh.decor}</svg>
    <span className={`${plate} ${sh.label}`} style={{transform:'translateY(-50%)'}}>{i.name}</span></div>
}
// Egg carton: one egg per piece.
function Carton({i,st}){
  const n=Math.min(12,Math.round(+i.qty)||0),ring=st==='exp'?'#C0392B':st==='soon'?'#E5A24A':'#E6D5C0'
  return <div className="relative mx-auto w-28 transition group-hover:-translate-y-1"><svg viewBox="0 0 120 80" className="block w-28 drop-shadow-md" aria-hidden="true">
    <rect x="12" y="2" width="96" height="26" rx="7" fill="#CDB6A0" stroke="#A98F78" strokeWidth="1.5"/><rect x="20" y="9" width="80" height="4" rx="2" fill="#fff" fillOpacity=".25"/>
    <rect x="3" y="22" width="114" height="52" rx="9" fill="#DCC7B2" stroke="#A98F78" strokeWidth="1.5"/>
    {Array.from({length:12},(_,k)=>{const cx=17+(k%6)*17.2,cy=k<6?37:56;return <g key={k}><ellipse cx={cx} cy={cy+2} rx="8" ry="7.5" fill="#B99F88" fillOpacity=".7"/>{k<n&&<><ellipse cx={cx} cy={cy} rx="6.5" ry="8" fill="#FBF3E8" stroke={ring} strokeWidth="1.6"/><ellipse cx={cx-2} cy={cy-3} rx="1.6" ry="2.4" fill="#fff" fillOpacity=".8"/></>}</g>})}</svg>
    {+i.qty>12&&<span className="absolute right-1 top-0 rounded-full bg-cocoa px-1.5 text-[10px] text-cream">+{Math.round(+i.qty)-12}</span>}
    <span className={`${plate} inset-x-4 bottom-1`}>{i.name}</span></div>
}
// Fruit basket (lemons and similar).
function Basket({i,st}){
  const n=Math.min(8,Math.round(+i.qty)||0),P=[[55,34],[32,38],[78,38],[44,44],[67,44],[22,47],[88,47],[55,46]],ring=st==='exp'?'#C0392B':st==='soon'?'#E5A24A':'#00000022'
  return <div className="relative mx-auto w-24 transition group-hover:-translate-y-1"><svg viewBox="0 0 110 92" className="block w-24 drop-shadow-md" aria-hidden="true">
    <path d="M16 52C14 6 96 6 94 52" fill="none" stroke="#9B7248" strokeWidth="4.5" strokeLinecap="round"/>
    {P.slice(0,n).map(([x,y],k)=><g key={k}><ellipse cx={x} cy={y} rx="12" ry="8.5" fill="#F2D45C" stroke={ring} strokeWidth={ring==='#00000022'?1:2}/><circle cx={x+11} cy={y} r="1.8" fill="#F2D45C"/><ellipse cx={x-4} cy={y-3} rx="4" ry="1.8" fill="#fff" fillOpacity=".5"/></g>)}
    <path d="M8 50H102L92 84Q91 89 85 89H25Q19 89 18 84Z" fill="#C79A6B" stroke="#9B7248" strokeWidth="1.5"/>
    <path d="M12 61H98M15 72H95M18 82H92M30 50L26 88M50 50L48 88M70 50L72 88M90 50L86 88" stroke="#9B7248" strokeOpacity=".55" strokeWidth="1.4"/><rect x="6" y="46" width="98" height="7" rx="3.5" fill="#B5885A" stroke="#9B7248" strokeWidth="1.3"/></svg>
    <span className={`${plate} inset-x-3 bottom-1.5`}>{i.name}</span></div>
}
// Butter on a plate: the block gets shorter as you use it.
function Butter({i,pct,col}){
  const w=+i.qty>0?Math.max(10,62*pct/100):0
  return <div className="relative mx-auto w-20 transition group-hover:-translate-y-1"><svg viewBox="0 0 80 80" className="block w-20 drop-shadow-md" aria-hidden="true">
    <ellipse cx="40" cy="68" rx="38" ry="9" fill="#fff" stroke="#D9C4B4" strokeWidth="1.5"/><ellipse cx="40" cy="67" rx="30" ry="5.5" fill="#F3E9E1"/>
    {w>0&&<g><path d={`M6 46h${w}v22H6z`} fill={col}/><path d={`M6 46l9-9h${w}l-9 9z`} fill="#fff" fillOpacity=".45"/><path d={`M6 46l9-9h${w}l-9 9z`} fill={col}/><path d={`M6 46l9-9h${w}l-9 9z`} fill="#fff" fillOpacity=".35"/><path d={`M${6+w} 46l9-9v22l-9 9z`} fill="#000" fillOpacity=".14"/><rect x="6" y="46" width={Math.min(9,w)} height="22" fill="#C9B8AE" fillOpacity=".7"/></g>}</svg>
    <span className={`${plate} inset-x-3 bottom-0`}>{i.name}</span></div>
}
function Jar({i,del,use,first}){
  const kind=kindOf(i),col=colorOf(i.name),pct=i.full?Math.min(100,(+i.qty/i.full)*100):0,d=i.exp?daysTo(i.exp):null,st=d===null?'none':d<0?'exp':d<=7?'soon':'ok',has=+i.qty>0
  return <div className="group w-28 text-center">
    {kind==='carton'?<Carton i={i} st={st}/>:kind==='basket'?<Basket i={i} st={st}/>:kind==='butter'?<Butter i={i} pct={pct} col={col}/>:<Glass i={i} kind={kind} pct={pct} col={col}/>}
    <p className="mt-1 text-xs">{has?`${i.qty} ${i.unit}`:<b className="text-red-700">Out of stock</b>}</p>
    {d!==null&&<p className={`text-[10px] ${st==='exp'?'font-bold text-red-700':st==='soon'?'font-bold text-amber-700':'text-cocoa/60'}`}>{st==='exp'?`Expired ${nice(i.exp)}`:st==='soon'?(d===0?'Expires today':`Expires in ${d}d`):`Exp ${nice(i.exp)}`}</p>}
    {first&&has&&<span className="mt-0.5 inline-block rounded-full bg-cocoa px-2 py-px text-[10px] font-medium text-cream">Use first</span>}
    <div className="mt-1.5 flex justify-center gap-1">{has&&<button className="rounded-full bg-cocoa px-3 py-1 text-[11px] font-medium text-cream transition hover:bg-berry" onClick={()=>use(i)}>Use</button>}<button aria-label={`Remove ${i.name}`} title="Remove" className="h-6 w-6 rounded-full border border-cocoa/40 text-[11px] transition hover:bg-white/70" onClick={()=>del(i)}>✕</button></div></div>
}
export function Pantry(){
  const {data,add,upd,del,toast,ask}=useApp(),[f,setF]=useState({name:'',qty:'',unit:'g',exp:''}),[err,setErr]=useState(''),[using,setUsing]=useState(null),[amt,setAmt]=useState(''),[uerr,setUerr]=useState('')
  const same=data.pantry.filter(p=>f.name.trim()&&key(p.name)===key(f.name)&&+p.qty>0)
  const submit=e=>{e.preventDefault();if(!f.name.trim())return setErr('Enter a name.');if(f.qty===''||+f.qty<0)return setErr('Enter a quantity of 0 or more.')
    add('pantry',{name:f.name.trim(),qty:+f.qty,unit:f.unit,exp:f.exp,full:+f.qty});setF({name:'',qty:'',unit:'g',exp:''});setErr('');toast(same.length?`${f.name.trim()} saved in its own container`:'Added to pantry')}
  const missing=SAMPLE_PANTRY.filter(x=>!data.pantry.some(p=>key(p.name)===key(x[0])))
  const addSamples=()=>{missing.forEach(([name,qty,unit,days])=>add('pantry',{name,qty,unit,exp:days==null?'':dayPlus(days),full:qty||250}));toast(`${missing.length} sample ingredients added`)}
  const remove=async i=>{if(await ask({title:`Remove ${i.name}?`,text:`This takes ${i.qty>0?`${i.qty} ${i.unit} of `:''}${i.name}${i.exp?` (expires ${nice(i.exp)})`:''} off your shelf.`,ok:'Remove',danger:true})){del('pantry',i.id);toast(`${i.name} removed`)}}
  const open=i=>{setUsing(i);setAmt('');setUerr('')}
  const sooner=using&&data.pantry.filter(p=>p.id!==using.id&&key(p.name)===key(using.name)&&+p.qty>0&&p.exp&&(!using.exp||p.exp<using.exp)).sort((a,b)=>a.exp.localeCompare(b.exp))[0]
  const confirmUse=e=>{e.preventDefault();const n=+amt;if(!(n>0))return setUerr('Enter how much you used.');if(n>+using.qty)return setUerr(`This container only has ${using.qty} ${using.unit} left.`)
    const left=Math.round((+using.qty-n)*100)/100;upd('pantry',using.id,{qty:left});toast(left>0?`Used ${n} ${using.unit} of ${using.name}. ${left} ${using.unit} left`:`${using.name} used up`);setUsing(null)}
  const rows=a=>data.pantry.filter(i=>aisle(i.name)===a).sort((x,y)=>key(x.name).localeCompare(key(y.name))||(x.exp?y.exp?x.exp.localeCompare(y.exp):-1:y.exp?1:0))
  const firstId=i=>{const g=data.pantry.filter(p=>key(p.name)===key(i.name)&&+p.qty>0);if(g.length<2||!i.exp||!(+i.qty>0))return false;const m=g.filter(p=>p.exp).sort((a,b)=>a.exp.localeCompare(b.exp))[0];return m?.id===i.id}
  return <div><Title sub={`${data.pantry.length} items · ${data.pantry.filter(i=>!(+i.qty>0)).length} out of stock`} action={missing.length>0&&<button className="btn-o" onClick={addSamples}>Add sample ingredients</button>}>My Pantry</Title>
    <form onSubmit={submit} className="card mb-5 p-4"><div className="flex flex-wrap items-end gap-2"><Field label="Ingredient"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Quantity"><input type="number" min="0" step="any" inputMode="decimal" className="input w-24" value={f.qty} onKeyDown={e=>['-','+','e','E'].includes(e.key)&&e.preventDefault()} onChange={e=>setF({...f,qty:+e.target.value<0?'0':e.target.value})}/></Field><Field label="Unit"><UnitSelect value={f.unit} onChange={v=>setF({...f,unit:v})} className="w-28"/></Field><Field label="Expires"><input type="date" className="input" value={f.exp} onChange={e=>setF({...f,exp:e.target.value})}/></Field><button className="btn">Add to pantry</button></div>
      {same.length>0&&<p className="mt-3 rounded-2xl bg-blush/70 px-4 py-2 text-sm">You already have <b>{same[0].name}</b> ({same.map(p=>`${p.qty} ${p.unit}${p.exp?`, expires ${nice(p.exp)}`:''}`).join(' · ')}). The new stock goes in its own container, so each one keeps its own expiry date. The one expiring first is marked <b>Use first</b>.{!f.exp&&' Add an expiry date so BakeNote can tell them apart.'}</p>}
      {err&&<p role="alert" className="mt-2 w-full text-sm text-red-700">{err}</p>}</form>
    <div className="rounded-[2rem] border-b-[12px] border-cocoa bg-caramel p-3 shadow-xl md:p-5"><div className="space-y-0 rounded-2xl bg-blush p-3 shadow-inner md:p-5">
      {AISLES.map(a=>{const items=rows(a);return <div key={a}><p className="hand text-2xl text-caramel">{a}</p><div className="mb-4 flex min-h-32 flex-wrap items-end gap-4 rounded-b-md border-b-[10px] border-caramel pb-1 pt-2">{items.map(i=><Jar key={i.id} i={i} del={remove} use={open} first={firstId(i)}/>)}{!items.length&&<p className="pb-3 text-xs text-cocoa/50">Empty shelf</p>}</div></div>})}</div></div>
    {using&&<Modal title={`Use ${using.name}`} onClose={()=>setUsing(null)}><form onSubmit={confirmUse} className="space-y-4">
      <p className="text-sm text-caramel">This container has <b className="text-cocoa">{using.qty} {using.unit}</b>{using.exp&&<> and expires <b className="text-cocoa">{nice(using.exp)}</b></>}.</p>
      {sooner&&<div className="rounded-2xl bg-amber-100 p-3 text-sm text-amber-900">Another {sooner.name} container expires sooner ({nice(sooner.exp)}). Use that one first?<button type="button" className="btn-o ml-2 mt-2 px-4 py-1" onClick={()=>{setUsing(sooner);setAmt('');setUerr('')}}>Switch to that container</button></div>}
      <Field label={`How much did you use? (${using.unit})`}><input autoFocus type="number" min="0" step="any" inputMode="decimal" className="input" value={amt} onKeyDown={e=>['-','+','e','E'].includes(e.key)&&e.preventDefault()} onChange={e=>{setAmt(e.target.value);setUerr('')}}/></Field>
      <div className="flex flex-wrap gap-2">{[['¼',.25],['½',.5],['¾',.75],['All',1]].map(([l,m])=><button type="button" key={l} className="btn-o px-4 py-1" onClick={()=>{setAmt(String(Math.round(+using.qty*m*100)/100));setUerr('')}}>{l}</button>)}</div>
      {uerr&&<p role="alert" className="text-sm text-red-700">{uerr}</p>}<div className="flex justify-end gap-2"><button type="button" className="btn-o" onClick={()=>setUsing(null)}>Cancel</button><button className="btn">Save</button></div></form></Modal>}</div>
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
  return <div><Title sub={`${data.shopping.filter(s=>!s.done).length} items to buy`} action={data.shopping.some(x=>!x.done)&&<button className="btn" onClick={()=>exportList(data.shopping).then(()=>toast('Shopping list saved')).catch(()=>toast('Could not create the image',1))}>Save as image</button>}>Shopping List</Title>
    <form onSubmit={submit} className="card mb-6 grid items-end gap-3 p-4 md:grid-cols-[minmax(0,1fr)_6rem_7rem_11rem_auto]"><Field label="Item"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Quantity"><input inputMode="decimal" className="input" value={f.qty} onChange={e=>setF({...f,qty:e.target.value.replace(/-/g,'')})}/></Field><Field label="Unit"><UnitSelect value={f.unit} onChange={v=>setF({...f,unit:v})}/></Field>
      <Field label="Section"><select className="input" value={f.aisle} onChange={e=>setF({...f,aisle:e.target.value})}><option value="">Auto section</option>{AISLES.map(a=><option key={a}>{a}</option>)}</select></Field><button className="btn h-[38px]">Add</button></form>
    {data.shopping.length?<><div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">{AISLES.map((a,n)=>{const items=data.shopping.filter(s=>(s.aisle||aisle(s.name))===a);return items.length>0&&<section key={a} style={{transform:`rotate(${n%2?1:-1}deg)`,backgroundImage:'repeating-linear-gradient(transparent,transparent 31px,#F4C6C3 32px)'}} className="relative bg-[#fffaf0] pt-6 px-5 pb-4 shadow-lg transition hover:rotate-0 hover:-translate-y-1"><span className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-20 bg-rose/60 rotate-2"/>
        <h2 className="hand text-3xl h-8 leading-8 mb-1">{a}</h2><ul>{items.map(s=><li key={s.id} className="h-8 flex items-center gap-2"><input type="checkbox" aria-label={'Bought '+s.name} checked={s.done} onChange={()=>upd('shopping',s.id,{done:!s.done})}/><span className={`flex-1 hand text-xl leading-8 ${s.done?'line-through opacity-50':''}`}>{s.name} {s.qty} {s.unit}</span><button aria-label="Remove" className="text-xs" onClick={()=>del('shopping',s.id)}>✕</button></li>)}</ul></section>})}</div>
      {done.length>0&&<button className="btn-o mt-6" onClick={()=>done.forEach(s=>del('shopping',s.id))}>Clear {done.length} purchased</button>}</>:<Empty>Your list is empty. Add items or use “What Can I Bake?”</Empty>}</div>
}
