import {useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import Icon from './Icon.jsx'
const OPEN=1.5,EASE=[0.25,0,0,1],H3D={backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden'}
export default function InteractiveBook({coverImage,bookTitle='Book title',bookAuthor='',pages,width=320,height=460,defaultOpen=false,index,onIndexChange,onClose,bookmarks=[],overlay,pageNotes}){
  const [open,setOpen]=useState(defaultOpen),[idx,setI]=useState(-1),[hover,setHover]=useState(false),setIdx=f=>setI(c=>typeof f==='function'?f(c):f)
  useEffect(()=>{onIndexChange?.(idx)},[idx])
  useEffect(()=>{if(index!==undefined&&index!==idx)setI(index)},[index])
  const next=e=>{e?.stopPropagation();setIdx(i=>Math.min(i+1,pages.length-1))}
  const prev=e=>{e?.stopPropagation();setIdx(i=>Math.max(i-1,-1))}
  const close=e=>{e?.stopPropagation();setOpen(false);setIdx(-1);onClose?.()}
  useEffect(()=>{if(!open)return
    const k=e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();if(e.key==='Escape')close()}
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[open])
  const paper='absolute inset-0 w-full h-full bg-cream border border-blush',stop=e=>e.stopPropagation(),notesLayer=f=>pageNotes&&<div className="pointer-events-none absolute inset-0" onClick={stop}>{pageNotes(f)}</div>
  return <div className="relative flex items-center justify-center" style={{width:width*2.2,height:height+90,perspective:2000}}>
    <motion.div className="relative" style={{width,height,transformStyle:'preserve-3d'}} animate={{x:open?width/2:0,y:open?0:[0,-8,0]}} transition={{duration:OPEN,ease:EASE,y:{duration:4,repeat:open?0:Infinity,ease:'easeInOut'}}}>
      <motion.div className="absolute inset-0 origin-left" style={{transformStyle:'preserve-3d'}} initial={{rotateY:0,zIndex:100}}
        animate={{rotateY:open?-180:hover?-15:0,zIndex:open?0:100}} transition={{rotateY:{duration:OPEN,ease:EASE},zIndex:{delay:open?OPEN*.6:OPEN*.4}}}
        onHoverStart={()=>!open&&setHover(true)} onHoverEnd={()=>setHover(false)}>
        <button type="button" aria-label="Open the book" onClick={()=>setOpen(true)} disabled={open} style={{...H3D,transform:'translateZ(0.5px)'}} className="absolute inset-0 overflow-hidden rounded-r-xl rounded-l-sm bg-berry text-left shadow-2xl cursor-pointer">
          <span className="absolute inset-0 bg-[linear-gradient(145deg,#7A6258,#3B2A2A)]"/>
          <span className="absolute inset-3 rounded-r-lg border-2 border-butter/70"/><span className="absolute inset-5 rounded-r border border-butter/40"/>
          <span className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 overflow-hidden rounded-full border-4 border-butter bg-blush shadow-xl">{coverImage&&<span className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${coverImage})`}}/>}</span>
          <span className="absolute inset-x-8 bottom-12 text-center text-cream"><span className="block font-serif text-3xl font-bold leading-tight">{bookTitle}</span><span className="mt-2 block h-px bg-butter/60"/>{bookAuthor&&<span className="hand mt-1 block text-2xl text-butter">by {bookAuthor}</span>}</span>
          <span className="absolute right-7 top-0 h-14 w-5 bg-butter [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]"/>
          <span className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/30 to-transparent"/></button>
        <div onClick={prev} style={{...H3D,transform:'rotateY(180deg) translateZ(0.5px)'}} className="absolute inset-0 flex flex-col items-center justify-center rounded-l-xl bg-cream p-8 text-center border-r border-blush cursor-pointer">
          <h2 className="font-serif text-2xl font-bold">{bookTitle}</h2><span className="my-3 h-px w-10 bg-rose"/><p className="hand text-2xl text-caramel">Every recipe has a story.</p>{notesLayer('cover')}</div>
      </motion.div>
      <div className="absolute inset-0" style={{transformStyle:'preserve-3d',zIndex:0}}>
        {pages.map((p,i)=>{const flipped=i<=idx
          return <motion.div key={i} className={paper+' origin-left rounded-r-xl rounded-l-sm shadow-sm'} style={{transformStyle:'preserve-3d'}} initial={{rotateY:0,zIndex:pages.length-i}}
            animate={{rotateY:flipped?-180:0,zIndex:flipped?i+1:pages.length-i}} transition={{duration:.6,ease:[.645,.045,.355,1]}}>
            <div onClick={next} style={{...H3D,transform:'translateZ(0.5px)'}} className="absolute inset-0 flex flex-col bg-cream bg-[repeating-linear-gradient(transparent,transparent_27px,rgba(185,143,136,.18)_28px)] p-6 cursor-pointer">
              <span className="mb-2 text-right text-xs text-caramel">{p.pageNumber*2-1}</span><div className="min-h-0 flex-1 overflow-y-auto">{p.content}</div>{notesLayer(`f:${p.id??i}`)}
              {bookmarks.includes(i)&&<span aria-label="Bookmarked" className="absolute right-6 top-0 h-14 w-5 bg-berry [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]"/>}<span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-cocoa/10 to-transparent"/></div>
            <div onClick={prev} style={{...H3D,transform:'rotateY(180deg) translateZ(0.5px)'}} className="absolute inset-0 flex flex-col bg-cream bg-[repeating-linear-gradient(transparent,transparent_27px,rgba(185,143,136,.18)_28px)] p-6 border-r border-blush cursor-pointer">
              <span className="mb-2 text-xs text-caramel">{p.pageNumber*2}</span><div className="min-h-0 flex-1 overflow-y-auto">{p.backContent}</div>{notesLayer(`b:${p.id??i}`)}
              <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cocoa/10 to-transparent"/></div></motion.div>})}
        <div className={paper+' rounded-r-xl grid place-items-center text-center shadow-xl'} style={{transform:'translateZ(-1px)',zIndex:-1}}>
          <div><p className="font-serif italic text-caramel">The end</p><button type="button" onClick={e=>{e.stopPropagation();setIdx(-1)}} className="btn-o mt-3"><Icon n="refresh" size={14}/>Read again</button></div>{notesLayer('end')}</div></div>
    </motion.div>
    <AnimatePresence>{open&&<motion.button type="button" aria-label="Close the book" initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.8}} onClick={close} className="absolute right-2 top-2 z-[1000] grid h-10 w-10 place-items-center rounded-full border border-blush bg-white/80 hover:bg-white transition"><Icon n="x" size={20}/></motion.button>}</AnimatePresence>
    {open&&overlay&&<div className="pointer-events-none absolute z-[500]" style={{left:width*.1,top:45,width:width*2,height}}>{overlay}</div>}
    {!open&&<motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1,duration:1}} className="absolute bottom-2 hand text-2xl text-caramel">Click the book to open</motion.p>}
  </div>
}
