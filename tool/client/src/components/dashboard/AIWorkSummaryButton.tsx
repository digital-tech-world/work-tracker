import { useState } from 'react';

interface AIWorkSummaryButtonProps {
  onGenerate: () => Promise<void> | void;
  className?: string;
}

const AIWorkSummaryButton = ({ 
  onGenerate, 
  className = '' 
}: AIWorkSummaryButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
      // In a real app, we would get the summary from the API response
      // For demo, we'll show a mock summary
      setSummary('Completed 3 tasks, started 2 new projects, attended 5 meetings. Made progress on the frontend dashboard component.');
    } catch (error) {
      console.error('Failed to generate work summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        onClick={handleGenerate}
        className={`flex items-center px-4 py-2 text-sm font-medium 
                  bg-indigo-600 text-indigo-foreground hover:bg-indigo-700 
                  disabled:opacity-50 transition-colors`}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin"><span className="material-icons">loading</span></span>
            Generating...
          </>
        ) : (
          <>
            <span className="mr-2"><span className="material-icons">robot</span></span>
            AI Work Summary
          </>
        )}
      </button>
      
      {summary && (
        <div className="px-4 py-3 bg-indigo-50 rounded border-l-4 border-indigo-500">
          <p className="text-sm text-indigo-800">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default AIWorkSummaryButton;
