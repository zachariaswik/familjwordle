const WORD_LIST_URL =
  "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
const WORD_DEFINITION_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"

export function isValidWord(value: string): boolean {
  return /^[a-z]{5}$/.test(value)
}

export async function fetchWordList(): Promise<string[]> {
  const response = await fetch(WORD_LIST_URL)

  if (!response.ok) {
    throw new Error(`Word list request failed with status ${response.status}`)
  }

  const text = await response.text()
  const words = text
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter(isValidWord)

  if (words.length === 0) {
    throw new Error("Word list returned no valid five-letter words")
  }

  return words
}

function todayInSweden(): string {
  return new Date().toLocaleDateString("sv-SE")
}

function dayIndex(): number {
  const today = todayInSweden()
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export async function fetchDailyWord(): Promise<string> {
  const words = await fetchWordList()
  return words[dayIndex() % words.length]
}

function extractDefinition(payload: unknown): string | null {
  if (!Array.isArray(payload)) {
    return null
  }

  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) {
      continue
    }

    const meanings = (entry as { meanings?: unknown }).meanings
    if (!Array.isArray(meanings)) {
      continue
    }

    for (const meaning of meanings) {
      if (typeof meaning !== "object" || meaning === null) {
        continue
      }

      const definitions = (meaning as { definitions?: unknown }).definitions
      if (!Array.isArray(definitions)) {
        continue
      }

      for (const definitionEntry of definitions) {
        if (typeof definitionEntry !== "object" || definitionEntry === null) {
          continue
        }

        const definition = (definitionEntry as { definition?: unknown })
          .definition
        if (typeof definition === "string" && definition.trim().length > 0) {
          return definition.trim()
        }
      }
    }
  }

  return null
}

export async function fetchWordDefinition(word: string): Promise<string> {
  const response = await fetch(
    `${WORD_DEFINITION_URL}/${encodeURIComponent(word)}`,
  )

  if (!response.ok) {
    throw new Error(`Definition request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  const definition = extractDefinition(payload)

  if (!definition) {
    throw new Error(`No definition found for ${word}`)
  }

  return definition
}
