import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import {useApp} from '../store.jsx'
const Eye=({off})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>{off&&<path d="M4 4l16 16"/>}</svg>
export default function Auth({register}){
  const {register:reg,login}=useApp(),nav=useNavigate(),[f,setF]=useState({name:'',email:'',pw:''}),[err,setErr]=useState(''),[show,setShow]=useState(false)
  const set=k=>e=>{setF({...f,[k]:e.target.value});setErr('')}
  const submit=e=>{e.preventDefault();const r=register?reg(f.name,f.email,f.pw):login(f.email,f.pw);r?setErr(r):nav('/dashboard')}
  const L='mb-1.5 block text-[11px] font-bold uppercase tracking-[.2em] text-caramel'
  return <main className="grid min-h-[100dvh] place-items-center px-4 py-8">
    <div className="w-full max-w-sm">
      <Link to="/" aria-label="BakeNote home" className="mx-auto mb-6 flex w-fit"><Logo size={64}/></Link>
      <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
        <div><h1 className="text-2xl font-bold">{register?'Create your notebook':'Welcome back'}</h1><p className="mt-1 text-sm text-caramel">{register?'Start keeping every recipe and bake in one place.':'Sign in to pick up where you left off.'}</p></div>
        {register&&<div><label htmlFor="name" className={L}>Name</label><input id="name" className="input" autoComplete="name" placeholder="Your name" value={f.name} onChange={set('name')}/></div>}
        <div><label htmlFor="email" className={L}>Email</label><input id="email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={f.email} onChange={set('email')}/></div>
        <div><label htmlFor="pw" className={L}>Password</label>
          <div className="relative"><input id="pw" className="input pr-11" type={show?'text':'password'} autoComplete={register?'new-password':'current-password'} placeholder={register?'At least 6 characters':'Your password'} value={f.pw} onChange={set('pw')}/>
            <button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'} aria-pressed={show} title={show?'Hide password':'Show password'} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-caramel transition hover:bg-blush hover:text-cocoa focus-visible:outline-2 focus-visible:outline-cocoa"><Eye off={show}/></button></div></div>
        {err&&<p role="alert" className="rounded-xl bg-red-50/80 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button className="btn w-full py-2.5">{register?'Create account':'Sign in'}</button>
        <p className="text-center text-sm text-caramel">{register?<>Have an account? <Link className="font-medium text-cocoa underline" to="/login">Sign in</Link></>:<>New here? <Link className="font-medium text-cocoa underline" to="/register">Create account</Link></>}</p></form>
      <p className="hand mt-6 text-center text-2xl text-caramel">Every recipe has a story.</p></div></main>
}
