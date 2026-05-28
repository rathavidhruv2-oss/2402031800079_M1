import React, { useContext } from 'react'
import { ThemeDataContext } from '../Context/ThemeContext'

const Button = () => {
    const [theme,setTheme]=useContext(ThemeDataContext)
    const changetheme=()=>{
        setTheme("light");
    }
  return (
    <div>
      <button onClick={changetheme}>change Theme{theme}</button>
    </div>
  )
}

export default Button
