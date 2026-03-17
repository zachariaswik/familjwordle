import { BrowserRouter, Routes, Route } from "react-router-dom"

import About from "@features/about/pages/About"
import PlayPage from "@features/game/pages/PlayPage"
import Home from "@features/home/pages/Home"
import Layout from "@features/layout/components/Layout"
import Scoreboard from "@features/scoreboard/pages/Scoreboard"

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
