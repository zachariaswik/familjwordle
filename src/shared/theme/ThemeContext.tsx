import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react"

type ThemeMode = "light" | "dark"

type ThemeModeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export const useThemeMode = (): ThemeModeContextValue => {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider")
  }
  return ctx
}

export const ThemeModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme-mode")
    return stored === "dark" ? "dark" : "light"
  })

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light"
      localStorage.setItem("theme-mode", next)
      return next
    })
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  )
}
