import { useState } from "react"

const PLAYER_NAME_KEY = "playerName"

export const usePlayerName = (): {
  name: string
  saveName: (newName: string) => void
} => {
  const [name, setName] = useState<string>(
    () => localStorage.getItem(PLAYER_NAME_KEY) ?? "",
  )

  const saveName = (newName: string) => {
    const trimmed = newName.trim()
    localStorage.setItem(PLAYER_NAME_KEY, trimmed)
    setName(trimmed)
  }

  return { name, saveName }
}
