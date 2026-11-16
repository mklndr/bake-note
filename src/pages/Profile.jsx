import {useState} from 'react'
import {useApp} from '../store.jsx'
import {Title,Field} from '../components/ui.jsx'
import {Avatar} from '../components/Layout.jsx'
const AV=['🧁','🍪','🥐','🍰','🥖','🍩','🥧','🍓','👩‍🍳','🧑‍🍳'],COL=['#F4C6C3','#D98A92','#C9A98B','#F7F0E6','#fde68a','#bfdbfe']
export default function Profile(){
  const {user,updateProfile,data,restore,toast}=useApp(),[name,setName]=useState(user.name)
  const save=()=>name.trim().length<2?toast('Name needs 2+ characters',1):(updateProfile({name:name.trim()}),toast('Profile updated'))
  const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='bakenote-backup.json';a.click()}
  const imp=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{restore(JSON.parse(r.result));toast('Backup restored')}catch{toast('Invalid backup file',1)}};r.readAsText(f)}
  return <div className="max-w-xl space-y-6"><Title sub="Choose how you appear in BakeNote">My Profile</Title>
    <div className="card p-5 space-y-4"><div className="flex items-center gap-4"><Avatar u={user} size={80}/><div className="flex-1"><Field label="Display name"><input className="input" value={name} onChange={e=>setName(e.target.value)}/></Field></div></div>
      <div><p className="text-sm font-medium mb-2">Pick a profile</p><div className="flex flex-wrap gap-2">{AV.map(a=><button key={a} aria-label={'Avatar '+a} onClick={()=>updateProfile({avatar:a})} className={`h-12 w-12 text-2xl rounded-full transition hover:scale-110 ${user.avatar===a?'ring-2 ring-cocoa bg-blush':'bg-white'}`}>{a}</button>)}</div></div>
      <div><p className="text-sm font-medium mb-2">Background color</p><div className="flex gap-2">{COL.map(c=><button key={c} aria-label={'Color '+c} onClick={()=>updateProfile({color:c})} style={{background:c}} className={`h-9 w-9 rounded-full border-2 transition hover:scale-110 ${user.color===c?'border-cocoa':'border-transparent'}`}/>)}</div></div>
      <button className="btn" onClick={save}>Save name</button></div>
    <div className="card p-5"><h2 className="text-xl font-bold mb-1">Backup</h2><p className="text-sm mb-3">Your data lives in this browser only. Export a copy to keep it safe.</p><div className="flex flex-wrap gap-2 items-center"><button className="btn" onClick={exp}>Export backup</button><label className="btn-o">Import backup<input type="file" accept="application/json" hidden onChange={imp}/></label></div></div></div>
}
