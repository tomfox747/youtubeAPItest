import React from 'react';
import {useState, useEffect} from 'react'
import './App.css';

import Axios from 'axios'

function App() {
  const[authCode, setAuthCode] = useState("default")
  
  useEffect(() =>{
    console.log("authcode changed to ==> " + authCode)
  },[authCode])

  const setCode = () =>{
    Axios.post('http://d5c7bb4b.ngrok.io/setCode',{
      code:authCode
    })
    .then((res) =>{
      console.log(res.data)
    })
    .catch((error) =>{
      console.log("ERROR --> " + error)
    })
  }

  useEffect(() =>{
    let params = (new URL(document.location)).searchParams;
    let code = params.get("code");
    if(code !== undefined){
      setAuthCode(code)
      console.log("new code set " + code)
    }else{
      console.log("no code found")
    }
  },[])
  
  return (
    <div className="App">
      <p>Youtube test app with express server</p>
      <button onClick={() => setCode()}>Set Code</button>
    </div>
    
  );
}

export default App;
