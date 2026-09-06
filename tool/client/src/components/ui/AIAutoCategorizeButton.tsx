import { useState } from 'react';

interface AIAutoCategorizeButtonProps {
  onCategorize: (taskData: {title: string; description: string}) => Promise<void>;
  className?: string;
}

const AIAutoCategorizeButton = ({ 
  onCategorize, 
  className = '' 
}: AIAutoCategorizeButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    areaId: number | null;
    priority: string;
    tags: number[];
  } | null>(null);

  const handleCategorize = async () => {
    // In a real implementation, we would get the current task data from the form
    // For demo, we'll use placeholder data
    const taskData = {
      title: 'Sample task title',
      description: 'Sample task description'
    };
    
    setIsProcessing(true);
    try {
      const aiSuggestion = await onCategorize(taskData);
      setSuggestion(aiSuggestion);
      
      // Auto-apply suggestion after a short delay
      setTimeout(() => {
        setSuggestion(null);
      }, 3000);
    } catch (error) {
      console.error('AI categorization failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCategorize}
      className={`flex items-center px-4 py-2 text-sm font-medium 
                bg-indigo-600 text-indigo-foreground hover:bg-indigo-700 
                disabled:opacity-50 transition-colors ${className}`}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin"><span className="material-icons">loading</span></span>
          AI Thinking...
        </>
      ) : (
        <>
          <span className="mr-2"><span className="material-icons">robot</span></span>
          AI Auto-Categorize
        </>
      )}
    </button>
  );
};

export default AIAutoCategorizeButton;
