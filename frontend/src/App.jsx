import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.scss'
import DavidRenderer from './components/David/DavidRenderer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DavidRenderer></DavidRenderer>
    </>
  )
}

export default App
