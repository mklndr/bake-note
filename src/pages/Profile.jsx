import {useState} from 'react'
import {useApp} from '../store.jsx'
import {Title,Field} from '../components/ui.jsx'
import {Avatar} from '../components/Layout.jsx'
const AV=['🧁','🍪','🥐','🍰','🥖','🍩','🥧','🍓','👩‍🍳','🧑‍🍳'],COL=['#F4C6C3','#D98A92','#C9A98B','#F7F0E6','#fde68a','#bfdbfe']
export default function Profile(){
  const {user,updateProfile,data,restore,toast}=useApp(),[name,setName]=useState(user.name)
  const save=()=>name.trim().length<2?toast('Name needs 2+ characters',1):(updateProfile({name:name.trim()}),toast('Profile updated'))
  const KEYS=['recipes','journal','journals','notes','pantry','equipment','shopping'],LABEL={recipes:'recipes',journal:'journal entries',notes:'notes',pantry:'pantry items',shopping:'shopping items'},stamp=()=>new Date().toLocaleDateString('en-CA')
  const [last,setLast]=useState(()=>localStorage.getItem('bn_last_backup')||''),sum=o=>Object.keys(LABEL).map(k=>`${(o[k]||[]).length} ${LABEL[k]}`).join(', ')
  const exp=()=>{const file={app:'BakeNote',version:2,exportedAt:new Date().toISOString(),profile:{name:user.name,avatar:user.avatar,color:user.color},currency:localStorage.getItem('bn_cur')||'',data};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(file,null,1)],{type:'application/json'}));a.download=`bakenote-backup-${stamp()}.json`;a.click();localStorage.setItem('bn_last_backup',stamp());setLast(stamp());toast('Backup downloaded')}
  const imp=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result),d=j&&j.data&&typeof j.data==='object'?j.data:j;if(!d||typeof d!=='object'||Array.isArray(d)||!KEYS.some(k=>Array.isArray(d[k])))throw 0
    const clean={};KEYS.forEach(k=>{if(Array.isArray(d[k]))clean[k]=d[k]})
    if(!confirm(`Replace everything in this browser with this backup?\n${sum(clean)}${j.exportedAt?'\nSaved on '+new Date(j.exportedAt).toLocaleDateString():''}`))return
    restore(clean);if(j.profile)updateProfile({name:j.profile.name||user.name,avatar:j.profile.avatar||user.avatar,color:j.profile.color||user.color});if(j.currency)localStorage.setItem('bn_cur',j.currency);toast('Backup restored')}catch{toast('That file is not a BakeNote backup',1)}};r.readAsText(f)}
  return <div><Title sub="Choose how you appear in BakeNote">My Profile</Title><div className="grid items-start gap-6 lg:grid-cols-2">
    <div className="card p-5 space-y-4"><div className="flex items-center gap-4"><Avatar u={user} size={80}/><div className="flex-1"><Field label="Display name"><input className="input" value={name} onChange={e=>setName(e.target.value)}/></Field></div></div>
      <div><p className="text-sm font-medium mb-2">Pick a profile</p><div className="flex flex-wrap gap-2">{AV.map(a=><button key={a} aria-label={'Avatar '+a} onClick={()=>updateProfile({avatar:a})} className={`h-12 w-12 text-2xl rounded-full transition hover:scale-110 ${user.avatar===a?'ring-2 ring-cocoa bg-blush':'bg-white'}`}>{a}</button>)}</div></div>
      <div><p className="text-sm font-medium mb-2">Background color</p><div className="flex gap-2">{COL.map(c=><button key={c} aria-label={'Color '+c} onClick={()=>updateProfile({color:c})} style={{background:c}} className={`h-9 w-9 rounded-full border-2 transition hover:scale-110 ${user.color===c?'border-cocoa':'border-transparent'}`}/>)}</div></div>
      <button className="btn" onClick={save}>Save name</button></div>
    <div className="card p-5"><h2 className="mb-1 text-xl font-bold">Backup</h2><p className="mb-3 text-sm text-caramel">Your data lives in this browser only. Download a copy to keep it safe or to move it to another device.</p>
      <p className="mb-4 rounded-2xl bg-blush/60 p-3 text-sm"><b>In this browser:</b> {sum(data)}<br/>{last?`Last backup: ${last}`:'You have not made a backup yet.'}</p>
      <div className="flex flex-wrap items-center gap-2"><button className="btn" onClick={exp}>Download backup</button><label className="btn-o cursor-pointer">Restore from file<input type="file" accept="application/json,.json" hidden onChange={imp}/></label></div></div></div></div>
}
