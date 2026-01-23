import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BoxMesh } from './Box.jsx';
import { SceneOne} from './Scene1.jsx';
import { SceneTwo } from './Scene02.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
										<SceneTwo />
  )
}

export default App
