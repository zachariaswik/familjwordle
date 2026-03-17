import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseQueryResult,
} from "@tanstack/react-query"

import {
  fetchDailyWord,
  fetchWordDefinition,
  fetchWordList,
} from "@features/word/api/wordApi"

export const DAILY_WORD_QUERY_KEY = ["daily-word"] as const
const WORD_LIST_QUERY_KEY = ["word-list"] as const
const wordDefinitionQueryKey = (word: string) =>
  ["word-definition", word] as const

export function useDailyWordSuspense(): string {
  const { data } = useSuspenseQuery({
    queryKey: DAILY_WORD_QUERY_KEY,
    queryFn: fetchDailyWord,
  })

  return data
}

export function useWordListSuspense(): Set<string> {
  const { data } = useSuspenseQuery({
    queryKey: WORD_LIST_QUERY_KEY,
    queryFn: fetchWordList,
  })

  return new Set(data)
}

export function useWordDefinition(
  word: string,
  enabled: boolean,
): UseQueryResult<string> {
  return useQuery({
    queryKey: wordDefinitionQueryKey(word),
    queryFn: () => fetchWordDefinition(word),
    enabled,
    retry: false,
    staleTime: Infinity,
  })
}

export function usePrefetchDailyWord(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.prefetchQuery({
      queryKey: DAILY_WORD_QUERY_KEY,
      queryFn: fetchDailyWord,
    })
  }
}
