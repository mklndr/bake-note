export const Title=({children,sub,action})=><div className="flex flex-wrap items-end justify-between gap-3 mb-6 noprint"><div><h1 className="text-3xl font-bold">{children}</h1>{sub&&<p className="text-cocoa/70 mt-1">{sub}</p>}</div>{action}</div>
export const Empty=({children})=><div className="card p-10 text-center text-cocoa/70">{children}</div>
export const Field=({label,error,children})=><label className="block text-sm font-medium">{label}<div className="mt-1">{children}</div>{error&&<span className="text-red-700 text-xs">{error}</span>}</label>
export const Stars=({value=0,onChange})=><div className="flex">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+' stars'} onClick={()=>onChange?.(n)} className={`text-xl ${n<=value?'text-caramel':'text-rose/50'} ${onChange?'cursor-pointer':'cursor-default'}`}>★</button>)}</div>
export function ImageUpload({value,onChange}){
  const pick=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,700/im.width),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);onChange(c.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(f)}
  return <div>{value&&<img src={value} alt="" className="h-40 rounded-2xl object-cover mb-2"/>}<input type="file" accept="image/*" onChange={pick} className="text-sm"/>{value&&<button type="button" className="text-xs underline ml-2" onClick={()=>onChange('')}>Remove</button>}</div>
}
export const RecipeCard=({r,to,children})=><div className="card lift group overflow-hidden flex flex-col">
  {r.image?<img src={r.image} alt={r.title} className="h-44 w-full object-cover group-hover:scale-105 transition duration-500"/>:<div className="h-44 bg-blush grid place-items-center text-5xl">🧁</div>}
  <div className="p-4 flex-1 flex flex-col"><span className="text-xs text-caramel">{r.category||'Baking'}</span><h3 className="text-lg font-bold">{r.title}</h3>
  <p className="text-sm text-cocoa/70 mb-3">{r.servings?r.servings+' servings':''} {r.bake?'· '+r.bake+' min':''}</p><div className="mt-auto flex gap-2">{children}</div></div></div>
