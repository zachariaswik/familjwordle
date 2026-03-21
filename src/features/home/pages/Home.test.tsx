import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import Home from "./Home"

describe("Home page", () => {
  it("shows name dialog when no name is stored", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText("Welcome! What's your name?")).toBeTruthy()
  })

  it("shows personalized welcome after name is entered", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText("Your name"), "Erik")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByText("Welcome to Cenote Erik!")).toBeTruthy()
  })

  it("shows personalized welcome when name already stored", () => {
    localStorage.setItem("playerName", "Erik")

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText("Welcome to Cenote Erik!")).toBeTruthy()
    expect(screen.queryByText("Welcome! What's your name?")).toBeNull()
  })

  it("renders start button", () => {
    localStorage.setItem("playerName", "Erik")

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole("button", { name: "Start Playing" })).toBeTruthy()
  })

  it("navigates to play route on button click", async () => {
    localStorage.setItem("playerName", "Erik")
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
