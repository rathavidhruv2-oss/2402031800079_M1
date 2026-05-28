import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Navbar from "./Components/Navbar.jsx";
import Hello from './Components/Hello.jsx';
import './App.css'

function App() {
  const [theme,setTheme]=useState("light");
 

  return (
  <>
  <Navbar theme={theme}/>
  <Hello/>
  <img src="favicon.svg" alt="" />
  </>
  )
}

export default App
