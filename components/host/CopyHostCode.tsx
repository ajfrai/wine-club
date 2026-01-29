'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyHostCodeProps {
  hostCode: string;
}

export function CopyHostCode({ hostCode }: CopyHostCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hostCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 text-gray-500 hover:text-wine hover:bg-wine-light rounded-lg transition-colors"
      title="Copy host code"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
