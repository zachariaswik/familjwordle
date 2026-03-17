import React from "react"

type ErrorBoundaryProps = {
  fallbackRender: (props: { resetErrorBoundary: () => void }) => React.ReactNode
  children: React.ReactNode
  onReset?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error): void {
    // Keep this for debug visibility in development.
    console.error("Play route failed to render:", error)
  }

  public reset = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false })
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallbackRender({ resetErrorBoundary: this.reset })
    }

    return this.props.children
  }
}

export default ErrorBoundary
