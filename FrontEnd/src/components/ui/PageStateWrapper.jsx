import React from 'react';
import {
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Clock,
  Activity,
  Inbox,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, Button, StatusBadge } from './index';

/**
 * PageStateWrapper
 * Standardized container handling the 5 core states for every API-driven screen:
 * 1. Loading  - Skeleton shimmer & telemetry connecting indicator
 * 2. Success  - Clean rendering with live sync badge
 * 3. Empty    - Empty record message with recovery action
 * 4. Error    - Detailed error state with retry button
 * 5. Offline  - Prominent stale data warning banner + timestamp, or full offline card
 */
export const PageStateWrapper = ({
  loading = false,
  error = null,
  isOffline = false,
  lastUpdated = null,
  isEmpty = false,
  emptyTitle = 'No Telemetry Records Found',
  emptyMessage = 'No active records have been reported by the CJack sensor array yet.',
  emptyAction = null,
  hasData = true,
  onRetry = null,
  screenTitle = 'Telemetry Stream',
  children
}) => {
  const formatTime = (ts) => {
    if (!ts) return 'Never';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    } catch {
      return String(ts);
    }
  };

  const formattedLastUpdated = formatTime(lastUpdated);

  // 1. Initial Loading State (No existing data to display)
  if (loading && !hasData) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        {/* Loading Banner */}
        <div className="bg-surface-cardLight dark:bg-surface-cardDark border border-surface-borderLight dark:border-surface-borderDark rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <Activity className="h-10 w-10 text-brand-primary animate-bounce" />
            <div className="absolute inset-0 rounded-full border-2 border-brand-primary/30 animate-ping" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Synchronizing {screenTitle}...
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Establishing secure telemetry communication bridge with CJack first-aid jacket and backend services.
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 bg-surface-mutedLight/70 dark:bg-surface-mutedDark/70 rounded-xl border border-surface-borderLight dark:border-surface-borderDark"
            />
          ))}
        </div>
      </div>
    );
  }

  // 2. Fatal Error State (Initial fetch failed and no cached data exists)
  if (error && !hasData && !isOffline) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto my-8">
        <Card className="border-status-emergency/40 bg-status-emergency/5 dark:bg-status-emergency/10">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-status-emergency/20 text-status-emergency">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Communication Failure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Unable to load telemetry data for {screenTitle}.
              </p>
              <p className="text-xs font-mono text-status-emergency mt-2 p-2 rounded bg-black/10 dark:bg-black/30 inline-block">
                {String(error?.message || error)}
              </p>
            </div>
            {onRetry && (
              <div className="pt-2">
                <Button onClick={onRetry} variant="primary" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Full-Screen Offline State (Offline and zero cached data)
  if (isOffline && !hasData) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto my-8">
        <Card className="border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-500">
              <WifiOff className="h-8 w-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                OFFLINE
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Backend Service Unreachable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
                The CJack server is offline or disconnected from the local network. No cached data is available for this screen.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Last successful update: {formattedLastUpdated}</span>
              </div>
            </div>
            {onRetry && (
              <div className="pt-2">
                <Button onClick={onRetry} variant="secondary" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Attempt Reconnection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Empty State
  if (isEmpty && !loading) {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto my-8">
        <Card className="border-dashed border-gray-300 dark:border-gray-700 bg-surface-cardLight dark:bg-surface-cardDark">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {emptyTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {emptyMessage}
            </p>
            {emptyAction && <div className="pt-2">{emptyAction}</div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5. Success / Normal State with Stale Data Warning Banner if Offline
  return (
    <div className="space-y-4">
      {/* High-visibility Offline Banner when running with cached data */}
      {isOffline && (
        <div className="rounded-xl border border-amber-500/60 bg-amber-500/10 dark:bg-amber-950/40 p-3 sm:p-4 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white tracking-wider">
                  OFFLINE
                </span>
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  Telemetry Stream Disconnected
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                <strong>STALE DATA NOTICE:</strong> You are viewing cached data. Live telemetry updates are paused because the CJack backend is currently unreachable.
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Last successful update: <strong className="text-gray-700 dark:text-gray-300">{formattedLastUpdated}</strong></span>
              </div>
            </div>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="secondary"
              className="shrink-0 text-xs gap-1.5 self-end sm:self-center border-amber-500/40 hover:bg-amber-500/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reconnect
            </Button>
          )}
        </div>
      )}

      {/* Render the working page UI */}
      {children}
    </div>
  );
};

export default PageStateWrapper;
