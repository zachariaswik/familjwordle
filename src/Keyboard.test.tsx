import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import Keyboard from "./Keyboard"

describe("Keyboard", () => {
  it("renders all key groups", () => {
    render(
      <Keyboard
        getState={() => "#333333"}
        onChange={() => undefined}
        onSubmit={() => false}
      />,
    )

    expect(screen.getByRole("button", { name: "q" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "a" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "z" })).toBeTruthy()
    expect(screen.getByLabelText("Submit guess")).toBeTruthy()
    expect(screen.getByLabelText("Delete last letter")).toBeTruthy()
  })
})
