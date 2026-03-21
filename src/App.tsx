import { BrowserRouter, Routes, Route } from "react-router-dom"

import About from "@features/about/pages/About"
import PlayPage from "@features/game/pages/PlayPage"
import Home from "@features/home/pages/Home"
import Layout from "@features/layout/components/Layout"
import AllTimeScores from "@features/scoreboard/pages/AllTimeScores"
import Scoreboard from "@features/scoreboard/pages/Scoreboard"
import StatsPage from "@features/stats/pages/StatsPage"

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/all-time" element={<AllTimeScores />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
