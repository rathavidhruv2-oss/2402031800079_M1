import React, { useState } from 'react'

const Counter = () => {
    const [count , setCount]=useState(0);
    const [ncount , setNcount]=useState(10);
    function inc(){
        setCount(count+1)
    }
    function dec(){
        setNcount(ncount-1)
    }
  return (
    <div>
      <h1>count:{count}</h1>
      <button onClick={inc}>increase</button>
      <h1>countDec:{ncount}</h1>
      <button onClick={dec}>decrease</button>
    </div>
  )
}

export default Counter
