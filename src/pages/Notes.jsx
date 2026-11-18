import {useState} from 'react'
import {createPortal} from 'react-dom'
import {useApp} from '../store.jsx'
import {Title,Empty,Field} from '../components/ui.jsx'
import StickyNote,{NOTE_COLORS,CATS} from '../components/StickyNote.jsx'
export default function Notes(){
  const {data,add,upd,del,toast}=useApp(),blank={title:'',text:'',color:NOTE_COLORS[0],category:CATS[0],pinned:false,onJournal:false,recipeId:'',x:30,y:30},[f,setF]=useState(null),[cat,setCat]=useState(''),[err,setErr]=useState('')
  const set=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value})
  const submit=e=>{e.preventDefault();if(!f.title.trim()&&!f.text.trim())return setErr('Write a title or some text.');f.id?upd('notes',f.id,f):add('notes',f);toast('Note saved');setF(null);setErr('')}
  const list=data.notes.filter(n=>!cat||n.category===cat).sort((a,b)=>!!b.pinned-!!a.pinned)
  return <div><Title sub={`${data.notes.length} notes · ${data.notes.filter(n=>n.pinned).length} pinned · stick any note on the journal to move it around`} action={<button className="btn" onClick={()=>setF(blank)}>New note</button>}>BakeNotes</Title>
    <div className="flex flex-wrap gap-2 mb-5">{['',...CATS].map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'btn':'btn-o'}>{c||'All'}</button>)}</div>
    {list.length?<div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">{list.map(n=><div key={n.id} className="min-w-0"><StickyNote n={n} onPin={()=>upd('notes',n.id,{pinned:!n.pinned})} onEdit={()=>setF(n)} onDel={()=>{del('notes',n.id);toast('Note deleted')}} recipe={data.recipes.find(r=>r.id===n.recipeId)}/>
      <button className="text-xs underline mt-1" onClick={()=>upd('notes',n.id,{onJournal:!n.onJournal})}>{n.onJournal?'Remove from journal':'Stick on journal'}</button></div>)}</div>:<Empty>No notes here yet. Jot down a tip or substitution.</Empty>}
    {f&&createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/60 p-3 sm:p-4"><form onSubmit={submit} className="max-h-[92dvh] w-full max-w-md space-y-3 overflow-auto rounded-3xl bg-cream p-4 sm:p-6">
      <h2 className="text-2xl font-bold">{f.id?'Edit note':'New note'}</h2>
      <Field label="Title"><input className="input" value={f.title} onChange={set('title')}/></Field><Field label="Note"><textarea rows={4} className="input" value={f.text} onChange={set('text')}/></Field>
      <div><p className="text-sm font-medium mb-1">Color</p><div className="flex items-center gap-2 flex-wrap">{NOTE_COLORS.map(c=><button type="button" key={c} aria-label={'Color '+c} onClick={()=>setF({...f,color:c})} style={{background:c}} className={`h-8 w-8 rounded-full border-2 ${f.color===c?'border-cocoa':'border-transparent'}`}/>)}<input type="color" aria-label="Custom color" value={f.color} onChange={set('color')} className="h-8 w-10"/></div></div>
      <Field label="Category"><select className="input" value={f.category} onChange={set('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
      <Field label="Attach to recipe"><select className="input" value={f.recipeId} onChange={set('recipeId')}><option value="">None</option>{data.recipes.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></Field>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={f.pinned} onChange={set('pinned')}/>Pin note</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={f.onJournal} onChange={set('onJournal')}/>Stick on journal</label>
      {err&&<p role="alert" className="text-red-700 text-sm">{err}</p>}<div className="flex gap-2"><button className="btn">Save note</button><button type="button" className="btn-o" onClick={()=>setF(null)}>Cancel</button></div></form></div>,document.body)}</div>
}
