import React, { useState, useEffect } from 'react';
import { systemService } from '../../services/systemService';
import { Clock, Activity, Heart, Wind, Database, RefreshCw } from 'lucide-react';

export const VitalHistoryChart = ({ className = '' }) => {
  const [range, setRange] = useState('5m'); // '1m', '5m', '15m', 'session'
  const [metric, setMetric] = useState('heartRate'); // 'heartRate', 'spo2', 'respirationRate'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await systemService.getVitalsHistory(range);
      const points = Array.isArray(res) ? res : res.data || [];
      setData(points);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [range]);

  const metricConfig = {
    heartRate: {
      label: 'Heart Rate',
      unit: 'BPM',
      color: '#EF4444',
      min: 40,
      max: 160,
      icon: Heart,
      target: '60 - 100 BPM'
    },
    spo2: {
      label: 'Oxygen Saturation (SpO2)',
      unit: '%',
      color: '#06B6D4',
      min: 70,
      max: 100,
      icon: Activity,
      target: '95 - 100%'
    },
    respirationRate: {
      label: 'Respiration Rate',
      unit: 'BPM',
      color: '#10B981',
      min: 8,
      max: 32,
      icon: Wind,
      target: '12 - 20 BPM'
    }
  }[metric];

  // SVG Chart Geometry calculations
  const width = 640;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const val = d[metric] ?? metricConfig.min;
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * chartW;
    const norm = (val - metricConfig.min) / (metricConfig.max - metricConfig.min);
    const clampedNorm = Math.max(0, Math.min(1, norm));
    const y = paddingTop + chartH - clampedNorm * chartH;
    return { x, y, val, time: d.timestamp, source: d.source || 'Simulation' };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`
    : '';

  // Get data source of current series
  const activeSource = points[0]?.source || 'Simulation';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cjack-accent" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Vital History Trends
          </h3>
          {/* Data Source Badge */}
          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border select-none ${
            activeSource === 'Hardware'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
              : activeSource === 'Simulation'
              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
          }`}>
            Source: {activeSource}
          </span>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-surface-mutedLight dark:bg-surface-mutedDark p-1 rounded-md border border-surface-borderLight dark:border-surface-borderDark self-start sm:self-auto">
          {[
            { id: '1m', label: '1 Min' },
            { id: '5m', label: '5 Mins' },
            { id: '15m', label: '15 Mins' },
            { id: 'session', label: 'Session' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors ${
                range === t.id
                  ? 'bg-surface-light dark:bg-surface-dark text-gray-950 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-2">
          {[
            { id: 'heartRate', label: 'Heart Rate', icon: Heart },
            { id: 'spo2', label: 'SpO2 Saturation', icon: Activity },
            { id: 'respirationRate', label: 'Respiration Rate', icon: Wind }
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  metric === m.id
                    ? 'bg-cjack-primary text-white border-cjack-primary shadow-xs'
                    : 'bg-surface-mutedLight/50 dark:bg-surface-mutedDark/50 text-gray-700 dark:text-gray-300 border-surface-borderLight dark:border-surface-borderDark hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-gray-500">
          Target: <strong className="text-gray-800 dark:text-gray-200">{metricConfig.target}</strong>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs font-mono text-gray-400">
            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cjack-primary" />
            Loading historical data buffer...
          </div>
        ) : (
          <svg
            className="w-full h-48"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            {/* Grid Horizontal Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
              const y = paddingTop + chartH - p * chartH;
              const val = Math.round(metricConfig.min + p * (metricConfig.max - metricConfig.min));
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Fill */}
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {areaD && (
              <path d={areaD} fill="url(#metricGrad)" />
            )}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={metricConfig.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Timestamps along X axis */}
            {points.length > 0 && [
              points[0],
              points[Math.floor(points.length / 2)],
              points[points.length - 1]
            ].map((p, idx) => {
              if (!p) return null;
              const dateObj = new Date(p.time);
              const timeStr = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '';

              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 8}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor={idx === 0 ? 'start' : idx === 2 ? 'end' : 'middle'}
                >
                  {timeStr}
                </text>
              );
            })}
          </svg>
        )}

        {/* Prototype Watermark */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono text-slate-400 border border-slate-700 select-none">
          SYNTHETIC BUFFER • NOT REAL CLINICAL TIME-SERIES
        </div>
      </div>
    </div>
  );
};

export default VitalHistoryChart;
