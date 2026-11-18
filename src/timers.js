import {useSyncExternalStore} from 'react'
const K='bakenote-timers'
const load=()=>{try{return JSON.parse(localStorage.getItem(K))||[]}catch{return[]}}
let list=load();const subs=new Set()
const save=()=>{try{localStorage.setItem(K,JSON.stringify(list))}catch{}subs.forEach(f=>f())}
export const timers={get:()=>list,sub:f=>{subs.add(f);return()=>subs.delete(f)},
  add(label,mins){list=[...list,{id:Date.now()+Math.random(),label:label||'Timer',end:Date.now()+mins*60000,done:false}];save()},
  remove(id){list=list.filter(t=>t.id!==id);save()},
  markDone(id){list=list.map(t=>t.id===id?{...t,done:true}:t);save()}}
export const useTimers=()=>useSyncExternalStore(timers.sub,timers.get)
export function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator();o.connect(c.destination);o.frequency.value=880;o.start();setTimeout(()=>{o.stop();c.close()},700)}catch{}}
