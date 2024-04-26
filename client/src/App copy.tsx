import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './App.css'
import { AppContainer, MainContainer, WelcomeText } from './App-styles';


const socket = io("http://localhost:3001");


function App() {
  const [room, setRoom] = useState(1)
  const sendMessage = ()=> {
    socket.emit("send_message", {
      message: "Hello",
      room
    })
  }

  useEffect(()=> {
socket.on("receive_message", (data)=> {
  alert(data.message)
})

// socket.on("connect", ()=> {
//   socket.emit("")
// })
  }, [socket])
  const joinRoom = ()=> {
    socket.emit("join_room", room)
  }
  return (
    <AppContainer>
      <WelcomeText>Welcome to Tic-Tac-Toe</WelcomeText>
      <MainContainer>Hey!</MainContainer>
    </AppContainer>
  )
}

export default App
