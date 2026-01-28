import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './styles.css'
import { BoxMesh } from './Box.jsx';
import { SceneOne} from './Scene1.jsx';
import { SceneTwo } from './Scene02.jsx';
import { GlbScene } from './Scene03.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
										<GlbScene />
  )
}

export default App
