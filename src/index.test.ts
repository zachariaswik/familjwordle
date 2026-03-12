import { describe, expect, it } from "vitest"

import * as publicApi from "./index"

describe("index exports", () => {
  it("exports all runtime members", () => {
    expect(publicApi.App).toBeDefined()
    expect(publicApi.Play).toBeDefined()
    expect(publicApi.Guesses).toBeDefined()
    expect(publicApi.Keyboard).toBeDefined()
    expect(publicApi.createState).toBeDefined()
    expect(publicApi.getLetterState).toBeDefined()
    expect(publicApi.checkGuess).toBeDefined()
    expect(publicApi.computeLetterStates).toBeDefined()
  })
})
