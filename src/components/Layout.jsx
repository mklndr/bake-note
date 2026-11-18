import {useState,useEffect,useRef} from 'react'
import {motion} from 'framer-motion'
import {NavLink,Link,Outlet,useNavigate,useLocation} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {timers,beep} from '../timers.js'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
const links=[['/dashboard','Overview'],['/recipes','Recipe Book'],['/discover','Discover'],['/journal','Journal'],['/notes','BakeNotes'],['/pantry','Pantry'],['/bake','What can I bake?'],['/shopping','Shopping list']]
export const Avatar=({u,size=40})=><span style={{width:size,height:size,background:u.color||'#E8D8CE',fontSize:size*.55}} className="rounded-full inline-grid place-items-center shrink-0">{u.avatar||'🧁'}</span>
export default function Layout(){
  const {user,data,logout,toast}=useApp(),[menu,setMenu]=useState(false),nav=useNavigate(),loc=useLocation(),navRef=useRef(null),[sh,setSh]=useState({l:false,r:false})
  const today=new Date().toLocaleDateString('en-CA'),count={'/pantry':data.pantry.filter(p=>p.exp&&+p.qty>0&&Math.ceil((new Date(p.exp)-new Date(today))/864e5)<=7).length}
  useEffect(()=>{const i=setInterval(()=>{timers.get().forEach(t=>{if(!t.done&&t.end<=Date.now()){timers.markDone(t.id);toast(`${t.label} timer is done!`);beep()}})},1000);return()=>clearInterval(i)},[toast])
  useEffect(()=>{setMenu(false);const a=navRef.current?.querySelector('[aria-current="page"]');a?.scrollIntoView?.({inline:'center',block:'nearest'})},[loc.pathname])
  useEffect(()=>{const el=navRef.current;if(!el)return;const u=()=>setSh({l:el.scrollLeft>4,r:el.scrollLeft+el.clientWidth<el.scrollWidth-4});u()
    el.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);let ro;if(typeof ResizeObserver!=='undefined'){ro=new ResizeObserver(u);ro.observe(el);if(el.firstElementChild)ro.observe(el.firstElementChild)}
    return()=>{el.removeEventListener('scroll',u);window.removeEventListener('resize',u);ro?.disconnect()}},[])
  const slide=d=>navRef.current?.scrollBy({left:d*220,behavior:'smooth'})
  useEffect(()=>{if(!menu)return;const k=e=>e.key==='Escape'&&setMenu(false),c=e=>{if(!e.target.closest?.('[data-acct]'))setMenu(false)};window.addEventListener('keydown',k);window.addEventListener('pointerdown',c);return()=>{window.removeEventListener('keydown',k);window.removeEventListener('pointerdown',c)}},[menu])
  return <div className="frame">
    <header className="noprint sticky top-0 z-40 pt-[env(safe-area-inset-top)] border-b border-white/60 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:gap-x-4 sm:px-4 sm:py-3 xl:flex-nowrap xl:px-6">
        <Link to="/dashboard" aria-label="BakeNote home" className="shrink-0"><Logo tag/></Link>
        <div className="relative order-last -mx-3 w-[calc(100%+1.5rem)] sm:-mx-4 sm:w-[calc(100%+2rem)] xl:order-none xl:mx-0 xl:w-auto xl:min-w-0 xl:flex-1"><nav ref={navRef} aria-label="Main" className="hide-sb overflow-x-auto px-3 sm:px-4 xl:px-0"><div className="mx-auto flex w-max items-center gap-0.5 pb-0.5">
          {links.map(([to,l])=><NavLink key={to} to={to} className={({isActive})=>`relative shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${isActive?'text-cream':'hover:bg-blush'}`}>{({isActive})=><>{isActive&&<motion.span layoutId="navpill" transition={{type:'spring',stiffness:420,damping:34}} className="absolute inset-0 rounded-full bg-cocoa"/>}<span className="relative whitespace-nowrap">{l}{count[to]>0&&<span title={`${count[to]} ingredient${count[to]>1?'s':''} expired or expiring within a week`} aria-label={`${count[to]} expiring soon`} className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${isActive?'bg-white/25':'bg-rose/50'}`}>{count[to]}</span>}</span></>}</NavLink>)}</div></nav>
          {[['l','left-0','bg-gradient-to-r','‹','Scroll menu left',-1],['r','right-0','bg-gradient-to-l','›','Scroll menu right',1]].map(([k,pos,grad,ch,lab,d])=><div key={k} aria-hidden={!sh[k]} className={`pointer-events-none absolute inset-y-0 ${pos} flex w-12 items-center ${k==='l'?'justify-start pl-1':'justify-end pr-1'} ${grad} from-[#F0E4DB] via-[#F0E4DB]/80 to-transparent transition-opacity duration-200 ${sh[k]?'opacity-100':'opacity-0'}`}><button type="button" tabIndex={sh[k]?0:-1} aria-label={lab} onClick={()=>slide(d)} className={`grid h-7 w-7 place-items-center rounded-full border border-rose/40 bg-white text-lg leading-none shadow-sm transition hover:bg-blush ${sh[k]?'pointer-events-auto':''}`}>{ch}</button></div>)}</div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ml-0"><Link to="/help" aria-label="Baking help" title="Baking help" className="grid h-10 w-10 place-items-center rounded-full border border-rose/40 bg-white transition hover:bg-blush"><Icon n="help" size={20}/></Link>
          <Link to="/recipes/new" className="btn"><span className="sm:hidden">+ New</span><span className="hidden sm:inline">New recipe</span></Link>
          <div data-acct className="relative"><button aria-expanded={menu} aria-label="Account menu" onClick={()=>setMenu(!menu)} className="flex items-center gap-2 rounded-full border border-rose/40 bg-white py-1 pl-1 pr-1 transition hover:bg-blush 2xl:pr-3"><Avatar u={user} size={32}/><span className="hidden max-w-28 truncate text-sm font-medium 2xl:inline">{user.name}</span></button>
            {menu&&<div className="absolute right-0 z-50 mt-2 w-44 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-blush bg-cream p-2 text-sm shadow-xl"><p className="truncate px-3 py-1 text-xs text-caramel">{user.name}</p><Link to="/profile" onClick={()=>setMenu(false)} className="block rounded-xl px-3 py-2 hover:bg-blush">My profile</Link><button onClick={()=>{logout();nav('/')}} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blush">Log out</button></div>}</div></div></div></header>
    <main className="mx-auto min-w-0 max-w-[1400px] px-3 py-4 sm:p-5 md:p-8"><div className="rise" key={loc.pathname+loc.search}><Outlet/></div></main></div>
}
