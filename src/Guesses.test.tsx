import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import Guesses from "./Guesses"

describe("Guesses", () => {
  it("renders empty board", () => {
    render(<Guesses guesses={[]} currentGuess="" />)
    expect(screen.getAllByText("_")).toHaveLength(30)
  })

  it("renders submitted and current guesses", () => {
    render(
      <Guesses
        guesses={[
          {
            text: "crane",
            letterStates: ["correct", "absent", "present", "absent", "absent"],
          },
        ]}
        currentGuess="ab"
      />,
    )

    expect(screen.getByText("c")).toBeTruthy()
    expect(screen.getByText("r")).toBeTruthy()
    expect(screen.getAllByText("_")).toHaveLength(23)
  })
})
