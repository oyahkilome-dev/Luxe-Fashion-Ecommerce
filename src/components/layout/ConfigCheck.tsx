import React, { useEffect, useState } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

interface ConfigStatus {
  isConfigured: boolean;
  missingVars: string[];
  missingOptionalVars?: string[];
}

export const ConfigCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
      })
      .then((data: ConfigStatus) => {
        setStatus(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-red-500">Error loading configuration check. Ensure server is running.</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-slate-500">Checking configuration...</div>
      </div>
    );
  }

  if (!status.isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full border border-red-100">
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <AlertTriangle className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Configuration Required</h1>
          </div>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            The application is missing required backend credentials. Please open the 
            <strong> Settings (Environment Variables) </strong> 
            in AI Studio and add the following missing keys:
          </p>
          
          <ul className="space-y-2 mb-8">
            {status.missingVars.map(v => (
              <li key={v} className="bg-slate-100 px-4 py-2 rounded-md font-mono text-sm text-slate-800 flex items-center justify-between">
                <span>{v}</span>
                <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Missing</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  After adding the variables in AI Studio, the application will automatically restart and pick up the new settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
