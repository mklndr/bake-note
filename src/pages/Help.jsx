import {useState} from 'react'
import {Title} from '../components/ui.jsx'
import {GLOSSARY} from '../components/Glossary.jsx'
const FIX=[
 ['My cake sank in the middle',['Oven opened too early','Too much baking powder or soda','Underbaked centre'],['Keep the door shut until the last 10 minutes','Level your leavening spoons','Test with a skewer, it should come out clean']],
 ['Cookies spread too thin',['Butter or dough too warm','Not enough flour','Baking on a hot tray'],['Chill dough 30 minutes','Weigh the flour','Cool the tray between batches']],
 ['My bread is dense',['Old or dead yeast','Not enough kneading','Cut the rise short'],['Check the yeast foams in warm water','Knead until you can stretch a thin window','Let it double in size']],
 ['Cake is dry',['Baked too long','Too much flour','Oven running hot'],['Check 5 minutes early','Spoon and level, or weigh, the flour','Use an oven thermometer']],
 ['Brownies are cakey, not fudgy',['Too much flour','Over-mixing','Too much leavening'],['Use less flour','Fold until just combined','Skip the baking powder']],
 ['Cheesecake cracked',['Over-beaten batter','Oven too hot','Cooled too fast'],['Mix on low speed','Bake in a water bath','Cool in the oven with the door ajar']],
 ['Soggy pie bottom',['Wet filling','Crust underbaked'],['Blind bake the crust','Bake on a preheated tray on the lower rack']],
 ['Buttercream looks grainy or split',['Butter too cold or too warm','Added liquid too fast'],['Use butter around 20°C (68°F)','Beat longer, or warm the bowl slightly and rewhip']],
 ['Meringue is weeping',['Sugar not dissolved','Humid day','Underbaked'],['Add sugar a spoon at a time','Bake low and slow, then cool in the oven']],
 ['Top of the cake domes and cracks',['Oven too hot'],['Lower the temperature by 10 to 15°C','Use bake-even strips']],
 ['Muffins are tough',['Over-mixing the batter'],['Stir only until the flour disappears']],
 ['Cookies turned hard',['Baked too long','Too much flour'],['Pull them when the edges are set and the middle looks soft']]]
const SUB=[
 ['1 cup buttermilk','1 cup milk + 1 tbsp lemon juice or vinegar','Rest 5 minutes'],
 ['1 egg','1 tbsp ground flax + 3 tbsp water, or ¼ cup applesauce','Good for muffins and cookies, not meringue'],
 ['1 cup butter','¾ cup oil','Cakes and muffins only, not pastry'],
 ['1 cup cake flour','1 cup all-purpose flour, minus 2 tbsp, plus 2 tbsp cornstarch','Sift twice'],
 ['1 tsp baking powder','¼ tsp baking soda + ½ tsp cream of tartar',''],
 ['1 cup brown sugar','1 cup white sugar + 1 tbsp molasses',''],
 ['1 cup heavy cream','¾ cup milk + ¼ cup melted butter','Will not whip'],
 ['1 cup sour cream','1 cup plain yogurt',''],
 ['1 tbsp cornstarch','2 tbsp all-purpose flour','For thickening'],
 ['1 cup self-rising flour','1 cup all-purpose flour + 1½ tsp baking powder + ¼ tsp salt',''],
 ['1 oz unsweetened chocolate','3 tbsp cocoa + 1 tbsp butter or oil',''],
 ['1 cup powdered sugar','1 cup granulated sugar + 1 tbsp cornstarch, blended fine','Blend until powdery']]
const TABS=['Troubleshooting','Substitutions','Glossary']
export default function Help(){
  const [tab,setTab]=useState(0),[q,setQ]=useState(''),has=(...a)=>a.join(' ').toLowerCase().includes(q.trim().toLowerCase())
  return <div><Title sub="Quick answers for when a bake goes sideways.">Baking help</Title>
    <div className="mb-5 flex flex-wrap items-center gap-2">{TABS.map((t,i)=><button key={t} onClick={()=>setTab(i)} aria-pressed={tab===i} className={tab===i?'btn':'btn-o'}>{t}</button>)}
      <input aria-label="Search help" className="input ml-auto max-w-xs" placeholder="Search, e.g. sink, egg, fold" value={q} onChange={e=>setQ(e.target.value)}/></div>
    {tab===0&&<div className="stagger grid gap-3 lg:grid-cols-2">{FIX.filter(f=>has(f[0],f[1],f[2])).map(([p,c,s])=><details key={p} className="card group p-4"><summary className="cursor-pointer font-bold">{p}</summary><div className="mt-3 grid gap-4 text-sm sm:grid-cols-2"><div><p className="mb-1 font-bold text-caramel">Likely causes</p><ul className="list-disc space-y-1 pl-5">{c.map(x=><li key={x}>{x}</li>)}</ul></div><div><p className="mb-1 font-bold text-caramel">Try this</p><ul className="list-disc space-y-1 pl-5">{s.map(x=><li key={x}>{x}</li>)}</ul></div></div></details>)}</div>}
    {tab===1&&<div className="stagger grid gap-3 md:grid-cols-2">{SUB.filter(s=>has(...s)).map(([a,b,n])=><div key={a} className="card p-4"><p className="text-sm text-caramel">Instead of</p><p className="font-bold">{a}</p><p className="mt-2 text-sm text-caramel">Use</p><p>{b}</p>{n&&<p className="mt-2 text-xs text-caramel">{n}</p>}</div>)}</div>}
    {tab===2&&<div className="stagger grid gap-3 md:grid-cols-2 lg:grid-cols-3">{GLOSSARY.filter(g=>has(g.t,g.d)).sort((a,b)=>a.t.localeCompare(b.t)).map(g=><div key={g.t} className="card p-4"><p className="font-serif text-xl font-bold">{g.t}</p><p className="mt-1 text-sm">{g.d}</p></div>)}</div>}
    <p className="mt-6 text-sm text-caramel">Tip: words like these are underlined inside your recipe steps. Hover or tap them for a quick explanation.</p></div>
}
