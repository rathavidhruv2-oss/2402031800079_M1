import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate();
    const goToAbout=()=>{
        
    }
  return (
    <div>
      <h2>welcome to home page</h2>
      <button onclick={goToAbout}>Go to About</button>
    </div>
  )
}

export default Home
