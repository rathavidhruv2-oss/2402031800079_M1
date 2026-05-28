import React from "react";

function Hello({data}){
    return(
        <div>
            <h2>name :{data.name}</h2>
            <h3>age :{data.age}</h3>
        </div>
    );
}
export default Hello;
