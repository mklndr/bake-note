import {useState} from 'react'
import {useApp} from '../store.jsx'
import {Title,Empty,Field,ImageUpload,Stars} from '../components/ui.jsx'
import StickyNote from '../components/StickyNote.jsx'
export default function Journal(){
  const {data,add,del,upd,toast}=useApp(),[open,setOpen]=useState(false),blank={recipeId:'',date:new Date().toISOString().slice(0,10),photo:'',notes:'',good:'',improve:'',rating:0},[f,setF]=useState(blank),[err,setErr]=useState('')
  const set=k=>e=>setF({...f,[k]:e.target.value}),title=id=>data.recipes.find(r=>r.id===id)?.title||'Freestyle bake'
  const submit=e=>{e.preventDefault();if(!f.date||(!f.notes.trim()&&!f.good.trim()))return setErr('Add a date and at least a few notes.');add('journal',f);setF(blank);setOpen(false);setErr('');toast('Journal entry saved')}
  const onBoard=data.notes.filter(n=>n.onJournal)
  return <div><Title sub={`${data.journal.length} bakes logged · drag the sticky notes anywhere, they remember where you left them`} action={<button className="btn" onClick={()=>setOpen(!open)}>{open?'Close form':'New entry'}</button>}>Baking Journal</Title>
    {open&&<form onSubmit={submit} className="card p-5 mb-6 grid md:grid-cols-2 gap-3 max-w-3xl">
      <Field label="Recipe"><select className="input" value={f.recipeId} onChange={set('recipeId')}><option value="">Freestyle bake</option>{data.recipes.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></Field>
      <Field label="Date"><input type="date" className="input" value={f.date} onChange={set('date')}/></Field>
      <Field label="What went well"><textarea className="input" value={f.good} onChange={set('good')}/></Field><Field label="What to improve"><textarea className="input" value={f.improve} onChange={set('improve')}/></Field>
      <Field label="Observations"><textarea className="input" value={f.notes} onChange={set('notes')}/></Field>
      <div><Field label="Photo of your bake"><ImageUpload value={f.photo} onChange={v=>setF({...f,photo:v})}/></Field><div className="mt-2"><Stars value={f.rating} onChange={v=>setF({...f,rating:v})}/></div></div>
      {err&&<p role="alert" className="text-red-700 text-sm">{err}</p>}<button className="btn md:col-span-2 w-fit">Save entry</button></form>}
    <div className="relative min-h-[640px] rounded-3xl p-5 md:p-8 border border-rose/40 shadow-inner" style={{background:'repeating-linear-gradient(#fffaf0,#fffaf0 31px,#f4c6c3 32px)'}}>
      {data.journal.length?<div className="grid md:grid-cols-2 gap-5 max-w-4xl">{[...data.journal].sort((a,b)=>b.date.localeCompare(a.date)).map(j=><div key={j.id} className="bg-white/90 rounded-2xl p-4 shadow">
        {j.photo&&<img src={j.photo} alt="" className="h-40 w-full object-cover rounded-xl mb-2"/>}
        <p className="hand text-2xl">{title(j.recipeId)}</p><p className="text-xs mb-1">{new Date(j.date+'T00:00').toDateString()}</p><Stars value={j.rating}/>
        {j.good&&<p className="text-sm mt-1"><b>Went well:</b> {j.good}</p>}{j.improve&&<p className="text-sm"><b>Improve:</b> {j.improve}</p>}{j.notes&&<p className="text-sm">{j.notes}</p>}
        <button className="text-xs underline mt-2" onClick={()=>{if(confirm('Delete this entry?'))del('journal',j.id)}}>Delete</button></div>)}</div>
      :<Empty>No entries yet. Log your first bake!</Empty>}
      {onBoard.map(n=><StickyNote key={n.id} n={n} drag onMove={(x,y)=>upd('notes',n.id,{x,y})} onPin={()=>upd('notes',n.id,{pinned:!n.pinned})} onEdit={()=>upd('notes',n.id,{onJournal:false})} onDel={()=>del('notes',n.id)} recipe={data.recipes.find(r=>r.id===n.recipeId)}/>)}
      {!onBoard.length&&<p className="hand text-xl text-caramel mt-6">Tip: turn on “Stick on journal” when you create a note.</p>}</div></div>
}
