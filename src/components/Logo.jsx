export default function Logo({size=34,text=true}){
  return <span className="inline-flex items-center gap-2"><svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#D98A92"/><path d="M14 27h20l-3 12H17z" fill="#5A3A3A"/><path d="M13 27c0-6 4-9 7-9 1-4 8-4 9 0 3 0 6 3 6 9z" fill="#F7F0E6"/><circle cx="24" cy="13.5" r="2.5" fill="#8E5F5F"/></svg>
  {text&&<span className="font-serif font-bold text-xl leading-none">BakeNote</span>}</span>
}
