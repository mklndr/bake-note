import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Title} from '../components/ui.jsx'
import {Avatar} from '../components/Layout.jsx'
const AV=['🧁','🍪','🥐','🍰','🥖','🍩','🥧','🍓','👩‍🍳','🧑‍🍳','🍞','🥯'],
  COL=[['#E8D8CE','Blush'],['#B98F88','Rose'],['#D9C4B4','Oat'],['#EADBCB','Butter'],['#D8C0B8','Lilac'],['#FBF7F4','Cream']],
  BANNERS=[['Cocoa','linear-gradient(135deg,#3B2A2A,#7A6258)'],['Rose','linear-gradient(135deg,#B98F88,#E8D8CE)'],['Oat','linear-gradient(135deg,#D9C4B4,#FBF7F4)'],['Blush','linear-gradient(135deg,#E8D8CE,#F4EBE4)'],['Caramel','linear-gradient(135deg,#7A6258,#D9C4B4)'],['Mocha','linear-gradient(135deg,#8F6E63,#E6C9BE)']],
  LEVELS=[[0,'Apprentice'],[5,'Home baker'],[15,'Skilled baker'],[30,'Pastry pro'],[60,'Master baker']],
  LINKS=[['/recipes','Recipe Book'],['/journal','Journal'],['/pantry','Pantry']]
const Label=({children})=><p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-caramel">{children}</p>
const ring='ring-2 ring-cocoa ring-offset-2 ring-offset-cream'
export default function Profile(){
  const {user,data,updateProfile,logout,toast}=useApp(),nav=useNavigate(),[name,setName]=useState(user.name)
  const banner=BANNERS.some(b=>b[1]===user.banner)?user.banner:BANNERS[0][1]
  const save=()=>name.trim().length<2?toast('Name needs 2+ characters',1):(updateProfile({name:name.trim()}),toast('Profile updated'))
  const bakes=data.journal.length,li=LEVELS.reduce((a,l,i)=>bakes>=l[0]?i:a,0),cur=LEVELS[li],next=LEVELS[li+1]
  const pct=next?Math.round((bakes-cur[0])/(next[0]-cur[0])*100):100
  const cats={};data.recipes.forEach(r=>{if(r.category)cats[r.category]=(cats[r.category]||0)+1})
  const topCat=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0]
  const stats=[[data.recipes.length,'Recipes'],[bakes,'Bakes'],[data.recipes.filter(r=>r.fav).length,'Favorites']]
  return <div><Title sub="Make BakeNote feel like your kitchen">My Profile</Title>
    <div className="grid max-w-5xl items-start gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="card overflow-hidden md:sticky md:top-24">
        <div style={{background:banner}} className="h-24"/>
        <div className="px-6 pb-6 text-center">
          <div className="relative z-10 -mt-12 inline-block rounded-full border-4 border-cream bg-cream"><Avatar u={user} size={88}/></div>
          <h2 className="mt-3 truncate text-2xl font-bold">{name.trim()||'Your name'}</h2><p className="truncate text-sm text-caramel">{user.email}</p>
          <div className="mt-4 text-left"><div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs"><b className="text-sm">{cur[1]}</b><span className="text-caramel">{next?`${next[0]-bakes} more ${next[0]-bakes===1?'bake':'bakes'} to ${next[1]}`:'Top level reached'}</span></div>
            <div role="progressbar" aria-label="Baker level progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-blush"><div style={{width:pct+'%'}} className="h-full rounded-full bg-cocoa transition-all duration-500"/></div></div>
          <div className="mt-5 grid grid-cols-3 border-y border-blush py-3">{stats.map(([n,l])=><div key={l}><b className="font-serif text-xl">{n}</b><p className="text-[11px] text-caramel">{l}</p></div>)}</div>
          {topCat&&<p className="mt-3 text-xs text-caramel">Most baked: <b className="text-cocoa">{topCat}</b></p>}
          <div className="mt-4 flex flex-wrap justify-center gap-2">{LINKS.map(([to,l])=><Link key={to} to={to} className="btn-o px-3 py-1.5 text-xs">{l}</Link>)}</div></div></div>
      <div className="card space-y-7 p-5 sm:p-6">
        <div><Label>Display name</Label><input aria-label="Display name" className="input" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div><Label>Avatar</Label><div className="grid grid-cols-6 gap-2">{AV.map(a=><button key={a} type="button" aria-label={'Avatar '+a} aria-pressed={user.avatar===a} onClick={()=>updateProfile({avatar:a})} className={`grid aspect-square place-items-center rounded-2xl text-xl transition hover:bg-blush sm:text-2xl ${user.avatar===a?'bg-blush '+ring:'bg-white/70'}`}>{a}</button>)}</div></div>
        <div><Label>Avatar background</Label><div className="flex flex-wrap gap-3">{COL.map(([c,n])=><button key={c} type="button" aria-label={n} title={n} aria-pressed={user.color===c} onClick={()=>updateProfile({color:c})} style={{background:c}} className={`h-9 w-9 rounded-full border border-cocoa/15 transition hover:scale-110 ${user.color===c?ring:''}`}/>)}</div></div>
        <div><Label>Banner</Label><div className="grid grid-cols-3 gap-2 sm:gap-3">{BANNERS.map(([n,g])=><button key={n} type="button" aria-label={n+' banner'} aria-pressed={banner===g} onClick={()=>updateProfile({banner:g})} style={{background:g}} className={`h-12 rounded-xl border border-cocoa/10 transition hover:-translate-y-0.5 sm:h-14 ${banner===g?ring:''}`}/>)}</div></div>
        <div className="flex flex-wrap items-center gap-2 border-t border-blush pt-5"><button type="button" className="btn" onClick={save}>Save changes</button><button type="button" className="btn-o" onClick={()=>{logout();nav('/')}}>Log out</button></div></div></div></div>
}
