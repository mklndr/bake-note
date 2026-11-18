export const GLOSSARY=[
 {t:'Creaming',d:'Beating butter and sugar until pale and fluffy so the batter holds air.',m:['creaming','creamed','cream together']},
 {t:'Folding',d:'Gently combining a light mixture into a heavy one with a spatula so the air stays in.',m:['fold']},
 {t:'Kneading',d:'Pushing and folding dough to build gluten and give bread its chew.',m:['knead']},
 {t:'Proofing',d:'Letting shaped dough rise before baking. It is ready when it springs back slowly.',m:['proof']},
 {t:'Sifting',d:'Passing dry ingredients through a sieve to remove lumps and add air.',m:['sift']},
 {t:'Whisking',d:'Beating briskly with a whisk to add air or blend a mixture smooth.',m:['whisk']},
 {t:'Blind baking',d:'Baking a pastry shell before adding the filling so the base stays crisp.',m:['blind bake','blind baking']},
 {t:'Tempering',d:'Slowly adding hot liquid to eggs so they do not scramble, or controlling chocolate temperature so it sets glossy.',m:['temper']},
 {t:'Zesting',d:'Grating only the colored outer peel of citrus. The white pith underneath is bitter.',m:['zest']},
 {t:'Soft peaks',d:'Whipped whites or cream that hold a shape, with the tip folding over.',m:['soft peaks','soft peak']},
 {t:'Stiff peaks',d:'Whipped whites or cream that stand straight up when the whisk is lifted.',m:['stiff peaks','stiff peak']},
 {t:'Ribbon stage',d:'Beaten eggs and sugar so thick that the batter leaves a trail on the surface.',m:['ribbon stage']},
 {t:'Blooming',d:'Soaking gelatin or yeast in liquid to wake it up before using.',m:['bloom']},
 {t:'Scoring',d:'Cutting shallow slashes in dough so it expands evenly in the oven.',m:['score']},
 {t:'Docking',d:'Pricking dough with a fork so it does not puff up while baking.',m:['dock']},
 {t:'Streusel',d:'A crumbly topping of butter, flour and sugar.',m:['streusel']},
 {t:'Ganache',d:'Chocolate melted with warm cream into a smooth glaze or filling.',m:['ganache']},
 {t:'Resting',d:'Leaving dough or batter alone so the gluten relaxes and the flour hydrates.',m:[]}]
const pats=GLOSSARY.flatMap(g=>g.m.map(p=>[p,g])).sort((a,b)=>b[0].length-a[0].length)
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
const RX=new RegExp('\\b((?:'+pats.map(p=>esc(p[0])).join('|')+')(?:s|es|ed|d|ing)?)\\b','gi')
const find=w=>{const l=w.toLowerCase();return pats.find(p=>l.startsWith(p[0]))?.[1]}
export function GlossaryText({text}){
  return text.split(RX).map((p,i)=>{const g=i%2?find(p):null
    return g?<span key={i} tabIndex={0} className="group relative cursor-help underline decoration-rose decoration-dotted underline-offset-2">{p}<span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-[80] mb-1 w-60 rounded-xl max-sm:fixed max-sm:inset-x-4 max-sm:bottom-6 max-sm:mb-0 max-sm:w-auto bg-cocoa p-2.5 text-xs font-normal leading-snug text-cream shadow-lg group-hover:visible group-focus:visible"><b className="block">{g.t}</b>{g.d}</span></span>:p})
}
