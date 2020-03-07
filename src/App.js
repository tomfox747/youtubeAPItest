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
    Axios.post('http://bcb77490.ngrok.io/setCode',{
      code:authCode
    })
    .then((res) =>{
      console.log(res.data)
    })
    .catch((error) =>{
      console.log("ERROR --> " + error)
    })
  }

  const getVideos = () =>{
    console.log("getting your videos")
    Axios.get('http://bcb77490.ngrok.io/getVideos')
    .then((res) =>{
      console.log(res)
    })
    .catch((err) =>{
      console.log(err)
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
      <button onClick={() => getVideos()}>Get Videos</button>
    </div>
    
  );
}

export default App;
