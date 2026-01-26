'use client';

import React, { useState, useEffect } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warn';
}

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Intercept console.log, console.error
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      if (message.includes('[signup') || message.includes('[Supabase')) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message,
          level: 'info'
        }].slice(-50)); // Keep last 50 logs
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message,
        level: 'error'
      }].slice(-50));
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message,
        level: 'warn'
      }].slice(-50));
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 text-sm font-medium"
      >
        {isOpen ? 'Hide' : 'Show'} Debug Logs ({logs.length})
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 left-4 md:left-auto md:w-[600px] h-[400px] z-50 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="font-semibold text-sm">Debug Logs</h3>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try signing up to see logs here.</p>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    log.level === 'error'
                      ? 'bg-red-900/30 text-red-200'
                      : log.level === 'warn'
                      ? 'bg-yellow-900/30 text-yellow-200'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <div className="text-[10px] text-gray-500 mb-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <pre className="whitespace-pre-wrap break-words">{log.message}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};
