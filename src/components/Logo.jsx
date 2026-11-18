export default function Logo({size=56,tag=false}){
  return <span className="inline-flex items-center gap-3"><span style={{width:size,height:size}} className="relative shrink-0 overflow-hidden rounded-full bg-[#FFF7EA] shadow-md ring-1 ring-white/70"><img src="/logo.webp" alt="BakeNote" width={size} height={size} className="h-full w-full scale-[1.14] object-cover"/></span>
  {tag&&<span className="hand hidden text-2xl leading-none text-caramel sm:block">Every recipe has a story.</span>}</span>
}
