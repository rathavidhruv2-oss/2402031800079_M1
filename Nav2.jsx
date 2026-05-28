import React, { useContext } from 'react'
import { ThemeDataContext } from '../Context/ThemeContext'


const Nav2 = () => {
  const [theme,setTheme]=useContext(ThemeDataContext)
  
  return (
    <div>
      <div className='nav2'>
        <h4>Home</h4>
        <h4>About</h4>
        <h4>Contac</h4>
        <h4> Services </h4>
        <h4>{theme}</h4>
      </div>
    </div>
  )
}
export default Nav2
