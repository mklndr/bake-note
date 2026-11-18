export default function Logo({size=36,text=true,tag=false}){
  return <span className="inline-flex items-center gap-2.5"><svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#3B2A2A"/><path d="M15 28h18l-2.2 9.5a2 2 0 0 1-2 1.5H19.2a2 2 0 0 1-2-1.5z" fill="#FBF7F4"/><path d="M13.5 28c-1.5-5.5 2-9.5 6.5-9.5.8-3.5 7.2-3.5 8 0 4.500 0 8 4 6.500 9.500z" fill="#E8D8CE"/><circle cx="24" cy="12" r="2.2" fill="#FBF7F4"/></svg>
  {text&&<span className="leading-none"><span className="block font-serif text-2xl font-bold tracking-tight">BakeNote</span>{tag&&<span className="hand mt-0.5 hidden text-lg leading-none text-caramel sm:block">Every recipe has a story.</span>}</span>}</span>
}
