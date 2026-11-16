import {Link} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Empty,RecipeCard} from '../components/ui.jsx'
import {matchRecipes} from '../utils.js'
const Dot=({r,s})=><div style={{width:s,height:s}} className="rounded-full border-4 border-white overflow-hidden bg-blush grid place-items-center shadow-lg shrink-0">{r?.image?<img src={r.image} alt="" className="h-full w-full object-cover"/>:<span style={{fontSize:s/3}}>🧁</span>}</div>
const tiles=[['/recipes/new','📖','New recipe'],['/discover','🔍','Discover'],['/journal','🧁','Log a bake'],['/notes','📝','New note'],['/pantry','🫙','Pantry'],['/shopping','🛒','Shopping']]
const Panel=({title,to,children})=><section><div className="flex justify-between items-baseline mb-2"><h3 className="text-lg font-bold">{title}</h3><Link to={to} className="text-xs underline">See all</Link></div>{children}</section>
export default function Dashboard(){
  const {user,data}=useApp(),rec=data.recipes,close=matchRecipes(rec,data.pantry).sort((a,b)=>b.pct-a.pct).slice(0,3)
  const notes=[...data.notes].sort((a,b)=>!!b.pinned-!!a.pinned).slice(0,3),buy=data.shopping.filter(s=>!s.done).slice(0,4)
  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose to-[#c4727c] text-cream p-6 md:p-10 flex flex-wrap items-center justify-between gap-6">
      <span className="absolute -right-10 -top-12 h-52 w-52 rounded-full bg-white/10"/><span className="absolute right-40 -bottom-16 h-40 w-40 rounded-full bg-white/10"/>
      <div className="relative"><p className="hand text-3xl">Good to see you</p><h1 className="text-4xl md:text-5xl font-bold leading-tight">Hello, {user.name}</h1><p className="mt-1 mb-5">What will you bake today?</p>
        <div className="flex gap-2 flex-wrap"><Link to="/recipes/new" className="btn">New recipe</Link><Link to="/discover" className="btn-o border-cream text-cream hover:bg-white/20">Discover</Link></div></div>
      <div className="relative flex items-end gap-3"><Dot r={rec[0]} s={150}/><div className="flex flex-col gap-3"><Dot r={rec[1]} s={80}/><Dot r={rec[2]} s={80}/></div></div></section>
    <section><h2 className="text-2xl font-bold mb-1">What will you wish for?</h2><div className="grid grid-cols-3 md:grid-cols-6 gap-3">{tiles.map(([to,e,l])=><Link key={to} to={to} className="card lift bg-white py-4 text-center"><span className="block text-3xl">{e}</span><span className="text-sm font-medium">{l}</span></Link>)}</div></section>
    <div className="grid xl:grid-cols-3 gap-6"><section className="xl:col-span-2"><h2 className="text-2xl font-bold mb-3">Continue baking</h2>
      {rec.length?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{rec.slice(0,3).map(r=><RecipeCard key={r.id} r={r}><Link className="btn-o" to={'/recipes/'+r.id}>Open</Link></RecipeCard>)}</div>
      :<Empty>Nothing yet. <Link className="underline" to="/discover">Find a recipe to save</Link> or <Link className="underline" to="/recipes/new">write your own</Link>.</Empty>}</section>
      <aside className="card bg-blush/50 p-5 space-y-6">
        <Panel title="Closest to baking" to="/bake">{close.length?close.map(({r,pct})=><Link key={r.id} to={'/recipes/'+r.id} className="block mb-2"><div className="flex justify-between text-sm"><span className="truncate">{r.title}</span><b>{pct}%</b></div><div className="h-2 rounded-full bg-white overflow-hidden"><div style={{width:pct+'%'}} className="h-full bg-rose"/></div></Link>):<p className="text-sm">Save a recipe and stock your pantry.</p>}</Panel>
        <Panel title="Pinned notes" to="/notes">{notes.length?<div className="flex flex-wrap gap-2">{notes.map(n=><span key={n.id} style={{background:n.color}} className="hand text-xl px-3 py-1 rounded-sm shadow">{n.title||n.text.slice(0,16)}</span>)}</div>:<p className="text-sm">No notes yet.</p>}</Panel>
        <Panel title="Shopping peek" to="/shopping">{buy.length?<ul className="text-sm">{buy.map(s=><li key={s.id}>• {s.name}</li>)}</ul>:<p className="text-sm">Nothing to buy.</p>}</Panel></aside></div></div>
}
