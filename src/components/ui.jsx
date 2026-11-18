import {useRef,useEffect} from 'react'
import {createPortal} from 'react-dom'
import Icon from './Icon.jsx'
export const Title=({children,sub,action})=><div className="flex flex-wrap items-end justify-between gap-3 mb-6 noprint"><div><h1 className="text-3xl md:text-4xl font-bold">{children}</h1>{sub&&<p className="text-caramel mt-1 max-w-2xl">{sub}</p>}</div>{action}</div>
export const Empty=({children})=><div className="card p-10 text-center text-cocoa/70">{children}</div>
export const Field=({label,error,children})=><label className="block text-sm font-medium">{label}<div className="mt-1">{children}</div>{error&&<span className="text-red-700 text-xs">{error}</span>}</label>
export const Stars=({value=0,onChange})=><div className="flex">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+' stars'} onClick={()=>onChange?.(n)} className={`text-xl ${n<=value?'text-caramel':'text-rose/50'} ${onChange?'cursor-pointer':'cursor-default'}`}>★</button>)}</div>
export function ImageUpload({value,onChange,label='Add image'}){
  const ref=useRef(),pick=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,700/im.width),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);onChange(c.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(f)}
  return <div><input ref={ref} type="file" accept="image/*" hidden onChange={pick}/>
    {value?<div className="relative w-fit"><img src={value} alt="Preview" className="h-40 rounded-2xl object-cover shadow-sm"/><div className="mt-2 flex gap-2"><button type="button" className="btn-o px-4 py-1.5" onClick={()=>ref.current.click()}>Change image</button><button type="button" className="btn-o px-4 py-1.5" onClick={()=>onChange('')}>Remove</button></div></div>
    :<button type="button" onClick={()=>ref.current.click()} className="flex h-32 w-full min-w-48 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose/60 bg-white/50 text-sm font-medium text-caramel transition hover:border-caramel hover:bg-white/80"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/></svg>{label}<span className="text-xs font-normal opacity-70">JPG or PNG</span></button>}</div>
}
// In-site popup. Closes with Escape or a click on the backdrop.
export function Modal({title,onClose,children,wide}){
  useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[onClose])
  return createPortal(<div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-cocoa/40 p-4 backdrop-blur-sm" onClick={onClose}><div role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()} className={`my-auto w-full ${wide?'max-w-2xl':'max-w-md'} rounded-3xl border border-white/70 bg-cream p-6 shadow-2xl`}>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">{title}</h2><button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-blush">✕</button></div>{children}</div></div>,document.body)
}
const CC={Cakes:'bg-peach',Cookies:'bg-butter',Brownies:'bg-lilac',Bread:'bg-pistachio',Dessert:'bg-peach',Pastry:'bg-butter',Pies:'bg-lilac'}
export const RecipeCard=({r,children})=>{const meta=[r.servings&&r.servings+' servings',r.bake&&r.bake+' min'].filter(Boolean).join(', ')
  return <div className="card lift group flex flex-col p-3"><div className="relative overflow-hidden rounded-2xl">
    {r.image?<img src={r.image} alt={r.title} className="h-44 w-full object-cover group-hover:scale-105 transition duration-500"/>:<div className="h-44 bg-blush grid place-items-center text-rose"><Icon n="cake" size={48}/></div>}
    <span className={`absolute left-2 top-2 rounded-full px-3 py-1 text-xs font-medium ${CC[r.category]||'bg-cream'}`}>{r.category||'Baking'}</span>
    {r.fav&&<span aria-label="Favorite" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-berry">♥</span>}</div>
    <div className="px-1 pt-3 flex-1 flex flex-col"><h3 className="text-lg font-bold leading-snug">{r.title}</h3><p className="text-sm text-caramel mb-3 min-h-5">{meta}</p><div className="mt-auto flex gap-2">{children}</div></div></div>}

export const UNITS=['g','kg','ml','l','tsp','tbsp','cup','oz','lb','pcs','pinch','clove','slice']
export const UnitSelect=({value,onChange,label='Unit',className=''})=><select aria-label={label} className={'input '+className} value={value||''} onChange={e=>onChange(e.target.value)}>{!value&&<option value="">Unit</option>}{value&&!UNITS.includes(value)&&<option value={value}>{value}</option>}{UNITS.map(u=><option key={u}>{u}</option>)}</select>
