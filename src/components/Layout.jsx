import {useState,useEffect} from 'react'
import {motion} from 'framer-motion'
import {NavLink,Link,Outlet,useNavigate,useLocation} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {timers,beep} from '../timers.js'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
const links=[['/dashboard','Overview'],['/recipes','Recipe Book'],['/discover','Discover'],['/journal','Journal'],['/notes','BakeNotes'],['/pantry','Pantry'],['/bake','What can I bake?'],['/shopping','Shopping list']]
export const Avatar=({u,size=40})=><span style={{width:size,height:size,background:u.color||'#E8D8CE',fontSize:size*.55}} className="rounded-full inline-grid place-items-center shrink-0">{u.avatar||'🧁'}</span>
export default function Layout(){
  const {user,data,logout,toast}=useApp(),[menu,setMenu]=useState(false),nav=useNavigate(),loc=useLocation()
  const count={'/recipes':data.recipes.length,'/journal':data.journal.length,'/notes':data.notes.length,'/pantry':data.pantry.length,'/shopping':data.shopping.filter(s=>!s.done).length}
  useEffect(()=>{const i=setInterval(()=>{timers.get().forEach(t=>{if(!t.done&&t.end<=Date.now()){timers.markDone(t.id);toast(`${t.label} timer is done!`);beep()}})},1000);return()=>clearInterval(i)},[toast])
  return <div className="frame">
    <header className="noprint sticky top-0 z-40 border-b border-white/60 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:flex-nowrap md:px-6">
        <Link to="/dashboard" aria-label="BakeNote home" className="shrink-0"><Logo tag/></Link>
        <nav aria-label="Main" className="hide-sb order-last w-full overflow-x-auto md:order-none md:w-auto md:min-w-0 md:flex-1"><div className="mx-auto flex w-max items-center gap-0.5">
          {links.map(([to,l])=><NavLink key={to} to={to} className={({isActive})=>`relative shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${isActive?'text-cream':'hover:bg-blush'}`}>{({isActive})=><>{isActive&&<motion.span layoutId="navpill" transition={{type:'spring',stiffness:420,damping:34}} className="absolute inset-0 rounded-full bg-cocoa"/>}<span className="relative whitespace-nowrap">{l}{count[to]>0&&<span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] leading-none ${isActive?'bg-white/20':'bg-blush'}`}>{count[to]}</span>}</span></>}</NavLink>)}</div></nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0"><Link to="/help" aria-label="Baking help" title="Baking help" className="grid h-10 w-10 place-items-center rounded-full border border-rose/40 bg-white transition hover:bg-blush"><Icon n="help" size={20}/></Link>
          <Link to="/recipes/new" className="btn"><span className="sm:hidden">+ New</span><span className="hidden sm:inline">New recipe</span></Link>
          <div className="relative"><button aria-expanded={menu} aria-label="Account menu" onClick={()=>setMenu(!menu)} className="flex items-center gap-2 rounded-full border border-rose/40 bg-white py-1 pl-1 pr-1 transition hover:bg-blush 2xl:pr-3"><Avatar u={user} size={32}/><span className="hidden max-w-28 truncate text-sm font-medium 2xl:inline">{user.name}</span></button>
            {menu&&<div className="card absolute right-0 mt-2 w-44 p-2 text-sm shadow-xl"><p className="truncate px-3 py-1 text-xs text-caramel">{user.name}</p><Link to="/profile" onClick={()=>setMenu(false)} className="block rounded-xl px-3 py-2 hover:bg-blush">My profile</Link><button onClick={()=>{logout();nav('/')}} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blush">Log out</button></div>}</div></div></div></header>
    <main className="mx-auto min-w-0 max-w-[1400px] p-4 md:p-8"><div className="rise" key={loc.pathname+loc.search}><Outlet/></div></main></div>
}
