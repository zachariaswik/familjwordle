import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import Home from "./Home"

describe("Home page", () => {
  it("renders heading and start button", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText("Welcome to Wordle")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Start Playing" })).toBeTruthy()
  })

  it("navigates to play route on button click", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<div>Play Route Hit</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole("button", { name: "Start Playing" }))
    expect(screen.getByText("Play Route Hit")).toBeTruthy()
  })
})
