import {sampleRecipes} from './data/sampleRecipes.js'
// Accounts with these names get the sample data once, the first time they log in on a browser.
export const DEMO_NAMES=['sean patrick bungay']
export const isDemo=u=>!!u&&DEMO_NAMES.includes(String(u.name||'').trim().toLowerCase())
const fmt=d=>d.toLocaleDateString('en-CA')
export const dayPlus=n=>{const d=new Date();d.setDate(d.getDate()+n);return fmt(d)}
export const dayAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return fmt(d)}
export const SAMPLE_PANTRY=[['Flour',1500,'g',200],['Sugar',800,'g',300],['Brown sugar',400,'g',250],['Powdered sugar',300,'g',250],['Butter',250,'g',5],['Egg',6,'pcs',4],['Milk',500,'ml',2],['Heavy cream',250,'ml',1],['Cream cheese',200,'g',6],['Baking powder',100,'g',180],['Baking soda',50,'g',220],['Cocoa powder',150,'g',160],['Chocolate chips',200,'g',120],['Vanilla extract',60,'ml',365],['Salt',500,'g',null],['Yeast',14,'g',30],['Vegetable oil',500,'ml',150],['Honey',250,'ml',null],['Lemon',2,'pcs',3],['Cornstarch',0,'g',null],['Walnuts',0,'g',null]]
export const SAMPLE_J=[[0,5,'Crisp edges and a chewy middle. Mixed dark and milk chocolate.','Chilled the dough overnight','Use less flaky salt on top'],[1,4,'Rose evenly and smelled amazing while baking.','Room-temperature eggs mixed in smoothly','Needed 3 more minutes in my oven'],[2,3,'Good flavor but a bit dry on the edges.','Nice golden color','Pull it out 5 minutes earlier next time'],[4,5,'Everyone asked for seconds.','Weighing the flour made a big difference','Try adding a pinch of cinnamon'],[6,4,'Soft and fluffy crumb.','Folded the flour gently','Cooled too fast, frosting slid a little'],[9,2,'Spread too thin and went flat.','Tasted great anyway','Butter was too soft, chill the dough first'],[13,4,'Crackly top and rich flavor.','Used good quality cocoa','Slightly underbaked in the center'],[18,5,'My best bake so far.','Followed the steps exactly','Nothing, I would make it again'],[3,4,'Golden top and a tender middle. The kitchen smelled wonderful.','Creamed the butter and sugar until pale','Add a little more vanilla'],[8,3,'Tasty, but it sank slightly in the middle.','Great flavor from browned butter','Do not open the oven door early'],[22,5,'Flaky layers and a perfect rise. Took a photo before it disappeared.','Kept everything cold while mixing','Try a sprinkle of coarse sugar on top']]
// Sample journal entries (without ids), starting at SAMPLE_J[from]
export const sampleEntries=(recipes,from=0)=>SAMPLE_J.slice(from).map(([ago,rating,notes,good,improve],k)=>{const r=recipes[(from+k)%Math.max(1,recipes.length)];return{recipeId:r?.id||'',date:dayAgo(ago),photo:r?.image||'',notes,good,improve,rating,sample:true}})
// Returns a new data object with sample recipes (only if there are none), pantry items and journal entries added.
export function seedData(d,uid){
  const recipes=d.recipes.length?d.recipes:sampleRecipes.map(r=>({id:'demo-'+r.sid,...r}))
  const have=n=>d.pantry.some(p=>p.name.toLowerCase()===n.toLowerCase())
  const pantry=[...SAMPLE_PANTRY.filter(x=>!have(x[0])).map(([name,qty,unit,days])=>({id:uid(),name,qty,unit,exp:days==null?'':dayPlus(days),full:qty||250})),...d.pantry]
  const journal=d.journal.some(j=>j.sample)?d.journal:[...sampleEntries(recipes).map(e=>({id:uid(),...e})),...d.journal]
  return{...d,recipes,pantry,journal}
}
