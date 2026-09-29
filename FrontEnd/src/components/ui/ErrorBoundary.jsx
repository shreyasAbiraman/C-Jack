import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 max-w-2xl mx-auto my-8">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold font-mono uppercase text-red-800 dark:text-red-300">
                UI Telemetry Rendering Exception
              </h3>
              <p className="text-xs text-red-700 dark:text-red-400 font-sans leading-relaxed">
                An uncaught component error occurred while rendering this interface.
              </p>
              {this.state.error && (
                <pre className="p-3 rounded bg-slate-950 text-red-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              )}
              <button
                onClick={this.handleReset}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Component
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
