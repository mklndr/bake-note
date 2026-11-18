import {useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {timers,useTimers} from '../timers.js'
import Icon from '../components/Icon.jsx'
import {Empty} from '../components/ui.jsx'
const Head=({title,sub,to,cta='View all'})=><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">{title}</h2>{sub&&<p className="text-sm text-caramel">{sub}</p>}</div>{to&&<Link to={to} className="rounded-full bg-cocoa px-4 py-1.5 text-xs font-medium text-cream transition hover:bg-berry">{cta}</Link>}</div>
const Mini=({r})=><Link to={'/recipes/'+r.id} className="card lift group flex flex-col p-3"><div className="relative overflow-hidden rounded-xl">{r.image?<img src={r.image} alt="" className="h-32 w-full object-cover transition duration-500 group-hover:scale-105"/>:<div className="grid h-32 place-items-center bg-blush text-rose"><Icon n="cake" size={36}/></div>}{r.fav&&<span aria-label="Favorite" className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-cream/90 text-sm">♥</span>}</div>
  <div className="flex items-center justify-between gap-2 pt-3"><div className="min-w-0"><p className="truncate font-bold">{r.title}</p><p className="truncate text-xs text-caramel">{[r.category,r.bake&&r.bake+' min'].filter(Boolean).join(', ')}</p></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cocoa text-cream transition group-hover:bg-berry">›</span></div></Link>
const Dot=({r,s,i})=><div style={{width:s,height:s,'--d':`${-i*2}s`}} className="float grid shrink-0 place-items-center overflow-hidden rounded-full border-4 border-cream bg-blush shadow-lg">{r?.image?<img src={r.image} alt="" className="h-full w-full object-cover"/>:<Icon n="cake" size={s/3} className="text-caramel"/>}</div>
const TIPS=['Room-temperature eggs and butter blend into batter more evenly.','Weigh your flour. A cup can vary by 30 grams or more.','Preheat the oven for at least 15 minutes and check it with a thermometer.','Let cakes cool in the pan for 10 minutes before turning them out.','Chill cookie dough for 30 minutes to stop it spreading.','Keep the oven door shut for the first half of baking.','Line your pan with parchment so nothing sticks.','A pinch of salt makes chocolate taste more chocolatey.','If a toothpick comes out clean, the cake is done.','Fold, do not stir, when adding flour to whipped eggs.','Cold butter makes flaky pastry. Keep everything chilled.','Let bread dough rise in a warm spot, away from drafts.','Sift cocoa and powdered sugar to avoid lumps.','Rotate the tray halfway through for even browning.','A splash of coffee deepens the flavor of chocolate cakes.','Brush bread with water before baking for a crisp crust.','Cool bakes completely before frosting them.','Zest citrus before you juice it.','A slice of bread in the container softens hard brown sugar.','Note what you changed in your journal. Next time you will thank yourself.']
const fmt=d=>d.toLocaleDateString('en-CA')
function Calendar({journal,recipes}){
  const [off,setOff]=useState(0),now=new Date(),first=new Date(now.getFullYear(),now.getMonth()+off,1),days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),by={}
  journal.forEach(j=>{(by[j.date]=by[j.date]||[]).push(j)})
  let streak=0;const d=new Date();if(!by[fmt(d)])d.setDate(d.getDate()-1);while(by[fmt(d)]){streak++;d.setDate(d.getDate()-1)}
  const name=id=>recipes.find(r=>r.id===id)?.title||'Freestyle bake',best=[...journal].filter(j=>j.rating>0).sort((a,b)=>b.rating-a.rating||b.date.localeCompare(a.date))[0]
  return <div className="card p-5"><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-xl font-bold">Bake calendar</h2><span className="rounded-full bg-blush px-3 py-1 text-xs font-bold">{streak} day streak</span></div>
    <div className="mb-2 flex items-center justify-between text-sm"><button aria-label="Previous month" onClick={()=>setOff(off-1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-blush">‹</button><span className="font-medium">{first.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</span><button aria-label="Next month" onClick={()=>setOff(off+1)} disabled={off>=0} className="grid h-7 w-7 place-items-center rounded-full hover:bg-blush disabled:opacity-30">›</button></div>
    <div className="grid grid-cols-7 gap-1 text-center text-xs">{'SMTWTFS'.split('').map((c,i)=><span key={i} className="text-caramel">{c}</span>)}{Array.from({length:first.getDay()},(_,i)=><span key={'p'+i}/>)}
      {Array.from({length:days},(_,i)=>{const k=fmt(new Date(first.getFullYear(),first.getMonth(),i+1)),L=by[k]
        return <span key={i} title={L?L.map(j=>name(j.recipeId)).join(', '):undefined} className={`grid aspect-square place-items-center rounded-full ${L?'bg-cocoa font-bold text-cream':k===fmt(now)?'ring-2 ring-rose':''}`}>{i+1}</span>})}</div>
    <p className="mt-4 border-t border-blush pt-3 text-sm text-caramel">{best?<>Best bake: <b className="text-cocoa">{name(best.recipeId)}</b> {'★'.repeat(best.rating)}</>:<>Log a bake in your <Link className="underline" to="/journal">journal</Link> to start a streak.</>}</p></div>
}
function Timers(){
  const list=useTimers(),[now,setNow]=useState(Date.now()),[label,setLabel]=useState(''),[min,setMin]=useState('')
  useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[])
  const start=m=>{if(!(+m>0))return;timers.add(label.trim(),+m);setLabel('');setMin('')},clock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
  return <div className="card p-5"><h2 className="mb-3 text-xl font-bold">Kitchen timers</h2>
    <input aria-label="Timer label" className="input mb-2" placeholder="Label, e.g. Dough proofing" value={label} onChange={e=>setLabel(e.target.value)}/>
    <div className="flex flex-wrap items-center gap-2">{[5,10,25,45].map(m=><button key={m} onClick={()=>start(m)} className="rounded-full bg-blush px-3 py-1.5 text-xs font-bold transition hover:bg-rose/50">{m} min</button>)}
      <form onSubmit={e=>{e.preventDefault();start(min)}} className="ml-auto flex gap-1"><input aria-label="Custom minutes" type="number" min="1" className="input w-20" placeholder="min" value={min} onChange={e=>setMin(e.target.value)}/><button className="btn px-4">Start</button></form></div>
    <ul className="mt-4 space-y-2">{list.map(t=>{const left=t.end-now,done=t.done||left<=0
      return <li key={t.id} className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 ${done?'bg-cocoa text-cream':'bg-blush/60'}`}><span className="min-w-0 truncate text-sm font-medium">{t.label}</span><span className="flex items-center gap-2"><b className="font-serif text-xl tabular-nums">{done?'Done!':clock(left)}</b><button aria-label={done?'Dismiss timer':'Cancel timer'} onClick={()=>timers.remove(t.id)} className="grid h-6 w-6 place-items-center rounded-full text-sm hover:bg-white/30">×</button></span></li>})}
      {!list.length&&<li className="text-sm text-caramel">No timers running. They keep counting while you browse BakeNote.</li>}</ul></div>
}
function UseItUp({pantry,recipes}){
  const day=p=>Math.ceil((new Date(p.exp)-new Date(fmt(new Date())))/864e5),soon=pantry.filter(p=>p.exp&&+p.qty>0&&day(p)<=7).sort((a,b)=>day(a)-day(b)).slice(0,4)
  const idea=p=>{const n=p.name.trim().toLowerCase();return recipes.find(r=>r.ingredients.some(i=>{const m=i.name.trim().toLowerCase();return m.includes(n)||n.includes(m)}))}
  return <div className="card p-5"><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-xl font-bold">Use it up</h2><Link to="/pantry" className="rounded-full bg-cocoa px-3 py-1 text-xs font-medium text-cream transition hover:bg-berry">Pantry</Link></div>
    {soon.length?<ul className="space-y-3">{soon.map(p=>{const d=day(p),r=idea(p);return <li key={p.id} className="text-sm"><div className="flex justify-between gap-2"><b>{p.name}</b><span className={d<0?'font-bold text-red-700':'text-caramel'}>{d<0?'Expired':d===0?'Expires today':`Expires in ${d}d`}</span></div>{r?<Link to={'/recipes/'+r.id} className="text-caramel underline">Bake with it: {r.title}</Link>:<span className="text-caramel">No saved recipe uses it yet.</span>}</li>})}</ul>
    :<p className="text-sm text-caramel">Nothing in your pantry is close to expiring. Add expiry dates to your ingredients and they will show up here.</p>}</div>
}
export default function Dashboard(){
  const {user,data}=useApp(),rec=data.recipes,[now,setNow]=useState(()=>new Date()),h=now.getHours(),greet=h>=5&&h<12?'Good morning':h>=12&&h<18?'Good afternoon':h>=18&&h<22?'Good evening':'Hello'
  useEffect(()=>{const i=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(i)},[])
  return <div className="space-y-10">
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cocoa via-[#57423A] to-berry p-6 text-cream md:p-9">
      <span className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-rose/25"/><span className="absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-blush/15"/>
      <div className="relative flex flex-wrap items-center justify-between gap-6"><div className="rise shrink-0"><h1 className="text-3xl font-bold md:text-4xl">{greet}, {user.name.split(' ')[0]}</h1><p className="mt-1 text-blush">{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p></div>
        <div className="flex shrink-0 -space-x-6">{[0,1,2].map(i=><Dot key={i} i={i} r={rec[i]} s={[96,76,60][i]}/>)}</div></div></section>
      <aside aria-label="Baker’s tip of the day" className="border-l-2 border-rose py-0.5 pl-4 md:pl-5"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-caramel">Baker’s tip of the day</p><p className="mt-1 font-serif text-base leading-snug md:text-lg">{TIPS[Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5)%TIPS.length]}</p></aside></div>
    <section><Head title="Continue baking" sub="Pick up where you left off" to="/recipes"/>
      {rec.length?<div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{rec.slice(0,4).map(r=><Mini key={r.id} r={r}/>)}</div>
      :<Empty>Nothing yet. <Link className="underline" to="/discover">Find a recipe to save</Link> or <Link className="underline" to="/recipes/new">write your own</Link>.</Empty>}</section>
    <section className="stagger grid gap-6 lg:grid-cols-3"><Calendar journal={data.journal} recipes={rec}/><Timers/><UseItUp pantry={data.pantry} recipes={rec}/></section>
</div>
}
