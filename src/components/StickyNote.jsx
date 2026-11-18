export const NOTE_COLORS=['#fde68a','#fbcfe8','#bfdbfe','#bbf7d0','#fed7aa','#ddd6fe']
export const CATS=['Baking Tips','Ingredient Substitutions','Recipe Ideas','Quick Reminders','Personal Notes']
export default function StickyNote({n,drag,onMove,onEdit,onDel,onPin,recipe,sc=1}){
  const tilt=(n.id.charCodeAt(0)%5-2)+'deg'
  const style={background:n.color,transform:`rotate(${tilt})`,...(drag?{position:'absolute',left:n.x??20,top:n.y??20,touchAction:'none',width:200,cursor:'grab',zIndex:5,pointerEvents:'auto'}:{})}
  const down=e=>{
    if(!drag||e.target.closest('button'))return
    const el=e.currentTarget,p=el.parentElement.getBoundingClientRect(),o={x:e.clientX/sc-el.offsetLeft,y:e.clientY/sc-el.offsetTop}
    el.setPointerCapture(e.pointerId)
    const mv=ev=>{el.style.left=Math.max(0,Math.min(p.width/sc-el.offsetWidth,ev.clientX/sc-o.x))+'px';el.style.top=Math.max(0,ev.clientY/sc-o.y)+'px'}
    const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);onMove(el.offsetLeft,el.offsetTop)}
    el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up)}
  return <div onPointerDown={down} style={style} className="p-4 shadow-md rounded-sm select-none text-cocoa">
    <div className="flex justify-between items-start gap-1"><h3 className="hand text-2xl leading-6 break-words">{n.title||'Untitled'}</h3>
      <button aria-label="Pin" onClick={onPin} className={n.pinned?'':'opacity-40'}>📌</button></div>
    <p className="text-sm whitespace-pre-wrap mt-1 break-words">{n.text}</p>
    <p className="text-[11px] mt-2 opacity-70">{n.category}{recipe?' · '+recipe.title:''}</p>
    <div className="flex gap-3 mt-2 text-xs underline"><button onClick={onEdit}>Edit</button><button onClick={onDel}>Delete</button></div></div>
}
