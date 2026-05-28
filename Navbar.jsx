
import react ,{useContext, useState} from "react";
import Nav2 from "./Nav2.jsx";
import { ThemeDataContext } from "../Context/ThemeContext.jsx";

const Navbar=()=>{   
    const [theme]=useContext(ThemeDataContext)
        return(
        <>
        <div className={theme}>
            <h2>parthiv</h2>
            <Nav2 />
        </div>
        </>
    )
}
export default Navbar;