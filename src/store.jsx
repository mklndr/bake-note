import {createContext,useContext,useEffect,useState,useCallback} from 'react'
import {isDemo,seedData,bookEntries,SAMPLE_BOOK} from './demoSeed.js'
const C=createContext()
export const useApp=()=>useContext(C)
export const uid=()=>Math.random().toString(36).slice(2,9)
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
const empty={recipes:[],journal:[],journals:[],notes:[],pantry:[],equipment:[],shopping:[]}
const load=id=>({...empty,...ls('bn_data_'+id,{})})
export function Provider({children}){
  const [user,setUser]=useState(()=>ls('bn_session',null))
  const [data,setData]=useState(()=>user?load(user.id):empty)
  const [msg,setMsg]=useState(null)
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
  return <C.Provider value={{user,data,updateProfile,restore,register,login,logout,add,upd,del,toast}}>{children}
    {msg&&<div role="status" className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2 text-sm shadow-lg ${msg.err?'bg-red-700':'bg-cocoa'} text-cream`}>{msg.t}</div>}</C.Provider>
}
