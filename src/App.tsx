import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./Layout"
import About from "./pages/About"
import Home from "./pages/Home"
import PlayPage from "./pages/Play"
import Scoreboard from "./pages/Scoreboard"

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
