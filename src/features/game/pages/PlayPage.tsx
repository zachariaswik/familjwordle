import { Box, Chip, Paper, Typography, useTheme } from "@mui/material"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { Suspense, type FC } from "react"

import Play from "@features/game/components/Play"
import { GameProvider } from "@features/game/context/GameContext"
import { useStats } from "@features/stats/context/StatsContext"
import {
  useDailyWordSuspense,
  useWordListSuspense,
} from "@features/word/hooks/useWordService"
import ErrorBoundary from "@shared/components/ErrorBoundary"
import PlayLoadError from "@shared/components/PlayLoadError"

const PlayContent: FC = () => {
  const word = useDailyWordSuspense()
  const validWords = useWordListSuspense()

  return (
    <GameProvider initialWord={word} validWords={validWords}>
      <Play />
    </GameProvider>
  )
}

const PlayPage: FC = () => {
  const { hasPlayedToday } = useStats()
  const theme = useTheme()

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "primary.light",
        background: `linear-gradient(180deg, rgba(45,212,191,0.08) 0%, ${theme.palette.background.paper} 40%)`,
      }}
    >
      <Box textAlign="center">
        <Typography variant="h3" color="primary.dark" gutterBottom>
          Wordle
        </Typography>
        {import.meta.env.DEV && (
          <Chip
            label="Dev mode — unlimited plays enabled"
            color="warning"
            size="small"
            sx={{ mb: 2 }}
          />
        )}
        {hasPlayedToday ? (
          <Typography variant="body1" color="text.secondary" sx={{ py: 6 }}>
            You&apos;ve already played today. Come back tomorrow!
          </Typography>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Guess the hidden word in 6 tries.
            </Typography>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  fallbackRender={({ resetErrorBoundary }) => (
                    <PlayLoadError
                      onRetry={() => {
                        reset()
                        resetErrorBoundary()
                      }}
                    />
                  )}
                >
                  <Suspense
                    fallback={
                      <Box sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          Loading game...
                        </Typography>
                      </Box>
                    }
                  >
                    <PlayContent />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </>
        )}
      </Box>
    </Paper>
  )
}

export default PlayPage
