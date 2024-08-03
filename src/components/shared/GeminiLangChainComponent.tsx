// GeminiLangChainComponent.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { runGeminiLangChain } from '@/lib/langchain/GeminiLangChainComponent';

const GeminiLangChainComponent: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunGeminiLangChain = async () => {
    setLoading(true);
    const response = await runGeminiLangChain();
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Button onClick={handleRunGeminiLangChain} disabled={loading}>
        {loading ? 'Running...' : 'Run GeminiLangChain'}
      </Button>
      {result && (
        <p className="mt-4">
          Result: {result}
        </p>
      )}
    </div>
  );
};

export default GeminiLangChainComponent;