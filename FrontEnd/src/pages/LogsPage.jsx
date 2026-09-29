import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, CardHeader, CardTitle, CardContent, StatusBadge, Button, LoadingSpinner, PageStateWrapper } from '../components/ui';
import { FileText, RefreshCw, Filter, Download, Terminal } from 'lucide-react';
import { systemService } from '../services/systemService';
import { eventService } from '../services/eventService';
import { useSystem } from '../context/SystemContext';

const LogsPage = () => {
  const { backendOnline, lastSuccessfulUpdate } = useSystem();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getEvents(50);
      const rawEvents = res.data || res || [];
      const normalized = rawEvents.map((evt, idx) => ({
        id: evt.id || evt.eventId || evt._id || idx,
        timestamp: evt.timestamp || new Date().toISOString(),
        level: (evt.level || evt.severity || evt.eventType || 'INFO').toUpperCase(),
        category: evt.category || 'SYSTEM',
        message: evt.message || evt.description || evt.title || 'Telemetry packet recorded'
      }));
      setLogs(normalized);
    } catch (err) {
      console.warn('Direct eventService fetch failed, trying system fallback:', err);
      try {
        const fallbackRes = await systemService.getLogs();
        setLogs(fallbackRes.data || fallbackRes || []);
      } catch (fallbackErr) {
        setError(fallbackErr.message || 'Failed to retrieve event logs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = filterLevel === 'ALL'
    ? logs
    : logs.filter(l => l.level === filterLevel);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cjack_system_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageStateWrapper
      loading={loading && logs.length === 0}
      error={error}
      backendOnline={backendOnline}
      lastSuccessfulUpdate={lastSuccessfulUpdate}
      onRetry={fetchLogs}
      screenTitle="System Event Audit Logs"
      hasData={logs.length > 0}
      emptyMessage="No system audit logs recorded on this device."
    >
      <div className="space-y-6">
      <SectionHeader
        title="System Event & Telemetry Audit Logs"
        question="What is the chronological audit log of events, errors, and telemetry?"
        statusBadge={<StatusBadge status="safe" text="Audit Trail Verified" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchLogs}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={exportLogs}>
              Export JSON
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle icon={Terminal}>Chronological Event Sequence</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-500 font-mono">FILTER:</span>
            {['ALL', 'INFO', 'WARNING', 'EMERGENCY'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold transition-colors ${filterLevel === lvl
                  ? 'bg-cjack-primary text-white'
                  : 'bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <LoadingSpinner label="Retrieving Event Audit Stream..." />
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 font-mono">
              No log entries matching filter "{filterLevel}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-surface-borderLight dark:border-surface-borderDark text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Level</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Event Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-surface-mutedLight/50 dark:hover:bg-surface-mutedDark/50">
                      <td className="py-2.5 text-gray-500 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.level === 'EMERGENCY'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : log.level === 'WARNING'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-700 dark:text-gray-300 text-[11px]">
                        {log.category}
                      </td>
                      <td className="py-2.5 text-gray-900 dark:text-gray-100">
                        {log.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PageStateWrapper>
  );
};
export default LogsPage;
