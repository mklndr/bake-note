import {useState} from 'react'
import Logo from '../components/Logo.jsx'
import {Link,useNavigate} from 'react-router-dom'
import {useApp} from '../store.jsx'
import {Field} from '../components/ui.jsx'
export default function Auth({register}){
  const {register:reg,login}=useApp(),nav=useNavigate(),[f,setF]=useState({name:'',email:'',pw:''}),[err,setErr]=useState('')
  const set=k=>e=>setF({...f,[k]:e.target.value})
  const submit=e=>{e.preventDefault();const r=register?reg(f.name,f.email,f.pw):login(f.email,f.pw);r?setErr(r):nav('/dashboard')}
  return <div className="min-h-screen grid place-items-center p-5 bg-gradient-to-br from-blush to-cream"><form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-4">
    <Link to="/"><Logo/></Link><h1 className="text-2xl">{register?'Create your notebook':'Welcome back'}</h1>
    {register&&<Field label="Name"><input className="input" value={f.name} onChange={set('name')}/></Field>}
    <Field label="Email"><input className="input" type="email" value={f.email} onChange={set('email')}/></Field>
    <Field label="Password"><input className="input" type="password" value={f.pw} onChange={set('pw')}/></Field>
    {err&&<p role="alert" className="text-sm text-red-700">{err}</p>}
    <button className="btn w-full">{register?'Create account':'Sign in'}</button>
    <p className="text-sm text-center">{register?<>Have an account? <Link className="underline" to="/login">Sign in</Link></>:<>New here? <Link className="underline" to="/register">Create account</Link></>}</p></form></div>
}
