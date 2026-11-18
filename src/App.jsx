import {Routes,Route,Navigate} from 'react-router-dom'
import {useApp} from './store.jsx'
import Layout from './components/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import {Recipes,RecipeDetail,RecipeForm} from './pages/Recipes.jsx'
import Discover from './pages/Discover.jsx'
import Journal from './pages/Journal.jsx'
import Notes from './pages/Notes.jsx'
import Help from './pages/Help.jsx'
import Profile from './pages/Profile.jsx'
import {Pantry,Bake,Shopping} from './pages/Pantry.jsx'
const Guard=({children})=>useApp().user?children:<Navigate to="/login" replace/>
export default function App(){
  const {user}=useApp()
  return <Routes>
    <Route path="/" element={user?<Navigate to="/dashboard" replace/>:<Landing/>}/>
    <Route path="/login" element={<Auth/>}/><Route path="/register" element={<Auth register/>}/>
    <Route element={<Guard><Layout/></Guard>}>
      <Route path="/dashboard" element={<Dashboard/>}/><Route path="/recipes" element={<Recipes/>}/>
      <Route path="/recipes/new" element={<RecipeForm/>}/><Route path="/recipes/:id" element={<RecipeDetail/>}/><Route path="/recipes/:id/edit" element={<RecipeForm/>}/>
      <Route path="/discover" element={<Discover/>}/><Route path="/journal" element={<Journal/>}/><Route path="/notes" element={<Notes/>}/>
      <Route path="/help" element={<Help/>}/><Route path="/profile" element={<Profile/>}/><Route path="/pantry" element={<Pantry/>}/><Route path="/bake" element={<Bake/>}/><Route path="/shopping" element={<Shopping/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
