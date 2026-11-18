import {createContext,useContext,useEffect,useState,useCallback} from 'react'
import {isDemo,seedData,bookEntries,SAMPLE_BOOK} from './demoSeed.js'
const C=createContext()
export const useApp=()=>useContext(C)
export const uid=()=>Math.random().toString(36).slice(2,9)
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
const empty={recipes:[],journal:[],journals:[],notes:[],pantry:[],equipment:[],shopping:[]}
// Older versions stored several batches inside one jar. Each batch now gets its own container so expiry dates stay clear.
const splitJar=p=>{if(!p.batches)return[p];const{batches,...r}=p,bs=batches.filter(b=>+b.qty>0);if(!bs.length)return[r];return bs.map((b,k)=>({...r,id:k?p.id+'-'+k:p.id,qty:+b.qty,exp:b.exp||'',full:bs.length===1?Math.max(p.full||0,+b.qty):+b.qty}))}
const load=id=>{const d={...empty,...ls('bn_data_'+id,{})};return{...d,pantry:d.pantry.flatMap(splitJar)}}
export function Provider({children}){
  const [user,setUser]=useState(()=>ls('bn_session',null))
  const [data,setData]=useState(()=>user?load(user.id):empty)
  const [msg,setMsg]=useState(null),[dlg,setDlg]=useState(null)
  const ask=useCallback(o=>new Promise(res=>setDlg({...o,res})),[])
  const answer=v=>{dlg?.res(v);setDlg(null)}
  useEffect(()=>{if(!dlg)return;const k=e=>e.key==='Escape'&&answer(false);window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[dlg])
  useEffect(()=>{if(user)try{localStorage.setItem('bn_data_'+user.id,JSON.stringify(data))}catch{setMsg({t:'Storage is full – delete some photos.',err:1})}},[data,user])
  useEffect(()=>{if(!user||!isDemo(user))return
    const seeded=localStorage.getItem('bn_seeded_'+user.id),v3=localStorage.getItem('bn_seeded_j3_'+user.id)
    if(!seeded){setData(d=>seedData(d,uid));localStorage.setItem('bn_seeded_'+user.id,'1');localStorage.setItem('bn_seeded_j3_'+user.id,'1');setMsg({t:'Sample ingredients and journals added to your account'});setTimeout(()=>setMsg(null),3500)}
    else if(!v3){localStorage.setItem('bn_seeded_j3_'+user.id,'1')
      // move the extra sample pages out of My Baking Journal into their own journal
      const extra=['Golden top and a tender middle.','Tasty, but it sank slightly','Flaky layers and a perfect rise.']
      setData(d=>{const journal=d.journal.filter(j=>!(j.sample&&extra.some(x=>(j.notes||'').startsWith(x))))
        if(d.journals.some(b=>b.id===SAMPLE_BOOK.id))return{...d,journal}
        return{...d,journals:[...d.journals,SAMPLE_BOOK],journal:[...bookEntries(d.recipes).map(e=>({id:uid(),...e})),...journal]}});setMsg({t:'New sample journal “Weekend Experiments” added to your shelf'});setTimeout(()=>setMsg(null),3500)}},[user])
  const toast=useCallback((t,err)=>{setMsg({t,err});setTimeout(()=>setMsg(null),2500)},[])
  const start=u=>{setData(load(u.id));setUser(u);localStorage.setItem('bn_session',JSON.stringify(u))}
  const register=(name,email,pw)=>{
    if(name.trim().length<2)return 'Enter your name (2+ characters).'
    if(!/^\S+@\S+\.\S+$/.test(email))return 'Enter a valid email address.'
    if(pw.length<6)return 'Password must be at least 6 characters.'
    const us=ls('bn_users',[]);if(us.some(u=>u.email===email.toLowerCase()))return 'That email is already registered.'
    const u={id:uid(),name:name.trim(),email:email.toLowerCase(),pw:btoa(pw)};localStorage.setItem('bn_users',JSON.stringify([...us,u]))
    start({id:u.id,name:u.name,email:u.email,avatar:u.avatar,color:u.color});return null}
  const login=(email,pw)=>{const u=ls('bn_users',[]).find(u=>u.email===email.toLowerCase()&&u.pw===btoa(pw));if(!u)return 'Email or password is incorrect.';start({id:u.id,name:u.name,email:u.email,avatar:u.avatar,color:u.color});return null}
  const logout=()=>{localStorage.removeItem('bn_session');setUser(null);setData(empty)}
  const updateProfile=p=>{const u={...user,...p};setUser(u);localStorage.setItem('bn_session',JSON.stringify(u));localStorage.setItem('bn_users',JSON.stringify(ls('bn_users',[]).map(x=>x.id===u.id?{...x,...p}:x)))}
  const restore=d=>setData({...empty,...d})
  const add=(k,item)=>setData(d=>({...d,[k]:[{id:uid(),...item},...d[k]]}))
  const upd=(k,id,p)=>setData(d=>({...d,[k]:d[k].map(i=>i.id===id?{...i,...p}:i)}))
  const del=(k,id)=>setData(d=>({...d,[k]:d[k].filter(i=>i.id!==id)}))
  return <C.Provider value={{user,data,updateProfile,restore,register,login,logout,add,upd,del,toast,ask}}>{children}
    {dlg&&<div className="fixed inset-0 z-[80] grid place-items-center bg-cocoa/40 p-4 backdrop-blur-sm" onClick={()=>answer(false)}><div role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-3xl border border-white/70 bg-cream p-6 shadow-2xl">
      <h2 id="dlg-t" className="text-xl font-bold">{dlg.title}</h2>{dlg.text&&<p className="mt-2 text-sm text-caramel">{dlg.text}</p>}
      <div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-o" onClick={()=>answer(false)}>Cancel</button><button type="button" autoFocus className="btn" style={dlg.danger?{background:'#9B2C2C'}:undefined} onClick={()=>answer(true)}>{dlg.ok||'OK'}</button></div></div></div>}
    {msg&&<div role="status" className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2 text-sm shadow-lg ${msg.err?'bg-red-700':'bg-cocoa'} text-cream`}>{msg.t}</div>}</C.Provider>
}
