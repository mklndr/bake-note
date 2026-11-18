import {useState} from 'react'
import {useApp} from '../store.jsx'
import {Title,Field} from '../components/ui.jsx'
import {Avatar} from '../components/Layout.jsx'
const AV=['🧁','🍪','🥐','🍰','🥖','🍩','🥧','🍓','👩‍🍳','🧑‍🍳','🍞','🥯'],
  COL=[['#F4C6C3','Blush'],['#D98A92','Rose'],['#C9A98B','Caramel'],['#F7F0E6','Cream'],['#fde68a','Butter'],['#bfdbfe','Sky']],
  BANNERS=[['Sunrise','linear-gradient(135deg,#F7C59F 0%,#EFA7A7 55%,#C97B84 100%)'],['Cocoa','linear-gradient(135deg,#3B2A2A 0%,#6B4A45 55%,#B98F88 100%)'],['Berry','linear-gradient(135deg,#8E3B5A 0%,#C96A86 55%,#F4B6C2 100%)'],['Matcha','linear-gradient(135deg,#8FA97A 0%,#C3D3A6 55%,#F2EBC8 100%)'],['Vanilla','linear-gradient(135deg,#F9EBD7 0%,#F4D9B5 55%,#E8B98F 100%)'],['Dusk','linear-gradient(135deg,#7C6A9B 0%,#B79AB8 55%,#F2C6C2 100%)']]
export default function Profile(){
  const {user,data,updateProfile,toast}=useApp(),[name,setName]=useState(user.name),banner=user.banner||BANNERS[0][1]
  const save=()=>name.trim().length<2?toast('Name needs 2+ characters',1):(updateProfile({name:name.trim()}),toast('Profile updated'))
  const stats=[[data.recipes.length,'Recipes'],[data.journal.length,'Bakes logged'],[data.recipes.filter(r=>r.fav).length,'Favorites']]
  const Label=({children})=><p className="mb-3 text-xs font-bold uppercase tracking-widest text-caramel">{children}</p>
  return <div><Title sub="Make BakeNote feel like your kitchen">My Profile</Title>
    <div className="grid max-w-5xl items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="card overflow-hidden lg:sticky lg:top-24">
        <div style={{background:banner}} className="relative h-32"><span className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20"/><span className="absolute bottom-[-30px] left-10 h-20 w-20 rounded-full bg-white/15"/></div>
        <div className="px-6 pb-6 text-center"><div className="-mt-12 inline-block rounded-full border-4 border-cream shadow-lg"><Avatar u={user} size={96}/></div>
          <h2 className="mt-3 text-2xl font-bold">{name.trim()||'Your name'}</h2><p className="text-sm text-caramel">{user.email}</p>
          <div className="mt-5 grid grid-cols-3 divide-x divide-blush rounded-2xl bg-blush/50 py-3">{stats.map(([n,l])=><div key={l}><b className="font-serif text-xl">{n}</b><p className="text-[11px] text-caramel">{l}</p></div>)}</div></div></div>
      <div className="card space-y-7 p-6">
        <div><Label>Display name</Label><Field label=""><input className="input" value={name} onChange={e=>setName(e.target.value)}/></Field></div>
        <div><Label>Avatar</Label><div className="grid grid-cols-6 gap-2 sm:grid-cols-12 lg:grid-cols-6 xl:grid-cols-12">{AV.map(a=><button key={a} aria-label={'Avatar '+a} aria-pressed={user.avatar===a} onClick={()=>updateProfile({avatar:a})} className={`grid aspect-square place-items-center rounded-2xl text-2xl transition hover:-translate-y-0.5 hover:shadow-md ${user.avatar===a?'bg-cocoa/10 ring-2 ring-cocoa':'bg-white ring-1 ring-blush'}`}>{a}</button>)}</div></div>
        <div><Label>Avatar background</Label><div className="flex flex-wrap gap-3">{COL.map(([c,n])=><button key={c} aria-label={n} title={n} aria-pressed={user.color===c} onClick={()=>updateProfile({color:c})} style={{background:c}} className={`h-10 w-10 rounded-full border-2 border-white shadow transition hover:scale-110 ${user.color===c?'ring-2 ring-cocoa ring-offset-2 ring-offset-cream':''}`}/>)}</div></div>
        <div><Label>Profile banner</Label><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BANNERS.map(([n,g])=><button key={n} aria-pressed={banner===g} onClick={()=>updateProfile({banner:g})} style={{background:g}} className={`relative h-16 rounded-2xl p-2 text-left text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${banner===g?'ring-2 ring-cocoa ring-offset-2 ring-offset-cream':''}`}><span className="rounded-full bg-black/25 px-2 py-0.5">{n}</span></button>)}</div></div>
        <button className="btn" onClick={save}>Save changes</button></div></div></div>
}
