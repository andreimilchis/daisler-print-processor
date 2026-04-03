'use client';

import { DpiCheckResult } from '@/types';

export default function DpiWarning({ result }: { result: DpiCheckResult }) {
  if (result.level === 'good') {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-green-600 text-lg">✓</span>
        <p className="text-sm text-green-700">{result.message}</p>
      </div>
    );
  }

  if (result.level === 'warning') {
    return (
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <span className="text-yellow-600 text-lg leading-5">⚠</span>
        <p className="text-sm text-yellow-700">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <span className="text-red-600 text-lg leading-5">✕</span>
      <p className="text-sm text-red-700">{result.message}</p>
    </div>
  );
}
