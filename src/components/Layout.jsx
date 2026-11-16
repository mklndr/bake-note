import {useState} from 'react'
import {NavLink,Outlet,useNavigate} from 'react-router-dom'
import {useApp} from '../store.jsx'
import Logo from './Logo.jsx'
const links=[['/dashboard','Dashboard','🏠'],['/recipes','My Recipe Book','📖'],['/discover','Discover','🔍'],['/journal','Baking Journal','🧁'],['/notes','BakeNotes','📝'],['/pantry','My Pantry','🫙'],['/bake','What Can I Bake?','🔥'],['/shopping','Shopping List','🛒'],['/profile','My Profile','👤']]
export const Avatar=({u,size=40})=><span style={{width:size,height:size,background:u.color||'#F4C6C3',fontSize:size*.55}} className="rounded-full inline-grid place-items-center shrink-0">{u.avatar||'🧁'}</span>
export default function Layout(){
  const {user,logout}=useApp(),[open,setOpen]=useState(false),nav=useNavigate()
  return <div className="min-h-screen md:flex">
    <header className="noprint md:hidden flex items-center justify-between bg-blush px-4 py-2 sticky top-0 z-40"><Logo size={28}/><button className="btn-o" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button></header>
    <aside className={`noprint fixed md:sticky top-12 md:top-0 h-[calc(100vh-3rem)] md:h-screen w-64 shrink-0 bg-blush md:rounded-r-[2rem] p-5 z-30 flex flex-col transition-transform ${open?'':'-translate-x-full md:translate-x-0'}`}>
      <div className="hidden md:block mb-1"><Logo/></div><p className="hand text-xl text-caramel mb-5 hidden md:block">Every recipe has a story.</p>
      <nav className="flex flex-col gap-1 flex-1 overflow-auto">{links.map(([to,l,ic])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`rounded-full px-4 py-2 text-sm transition hover:translate-x-1 ${isActive?'bg-cocoa text-cream':'hover:bg-cream'}`}><span className="inline-block w-7">{ic}</span>{l}</NavLink>)}</nav>
      <div className="flex items-center gap-2 my-3"><Avatar u={user}/><span className="text-sm leading-tight">Baking as<br/><b>{user.name}</b></span></div>
      <button className="btn-o" onClick={()=>{logout();nav('/')}}>Log out</button></aside>
    <main className="flex-1 p-5 md:p-10 min-w-0"><Outlet/></main></div>
}
