import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import About from "./About"

describe("About page", () => {
  it("renders key informational sections", () => {
    render(<About />)

    expect(screen.getByText("About Wordle")).toBeTruthy()
    expect(screen.getByText("What is Wordle?")).toBeTruthy()
    expect(screen.getByText("How to Play")).toBeTruthy()
    expect(screen.getByText("Features")).toBeTruthy()
  })
})
