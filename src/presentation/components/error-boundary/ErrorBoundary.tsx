import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@presentation/components/ui/Button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production, forward to your monitoring service (e.g. Sentry)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">Something went wrong</h1>
              <p className="mt-2 text-slate-400 text-sm">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-4 p-4 rounded-lg bg-slate-900 border border-white/8 text-xs text-red-300 text-left overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}
              >
                Try again
              </Button>
              <Button onClick={() => window.location.reload()}>Reload page</Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
