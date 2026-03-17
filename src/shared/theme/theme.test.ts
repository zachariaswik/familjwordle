import { describe, expect, it } from "vitest"

import theme from "./theme"

describe("theme", () => {
  it("exports configured palette values", () => {
    expect(theme.palette.primary.main).toBe("#0f766e")
    expect(theme.palette.secondary.main).toBe("#f97316")
    expect(theme.palette.background.default).toBe("#f8fafc")
  })
})
