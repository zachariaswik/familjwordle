import { describe, expect, it } from "vitest"

import { formatTime } from "./formatTime"

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("0:00")
  })

  it("formats seconds below a minute", () => {
    expect(formatTime(42)).toBe("0:42")
  })

  it("formats exactly one minute", () => {
    expect(formatTime(60)).toBe("1:00")
  })

  it("formats minutes and seconds", () => {
    expect(formatTime(90)).toBe("1:30")
    expect(formatTime(125)).toBe("2:05")
  })
})
