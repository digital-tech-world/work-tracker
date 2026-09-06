import { useState, useEffect } from 'react';

const DocsPage = () => {
  const [docs, setDocs] = useState<Array<{name: string; path: string; type: 'file' | 'directory'}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/docs');
        if (!response.ok) throw new Error('Failed to fetch docs');
        const data = await response.json();
        setDocs(data);
      } catch (err) {
        setError('Failed to load documentation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocs();
  }, []);
  
  const handleFileSelect = async (filePath: string) => {
    try {
      setSelectedFile(filePath);
      const response = await fetch(`/api/docs/content?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error('Failed to fetch file content');
      const text = await response.text();
      setFileContent(text);
    } catch (err) {
      setError('Failed to load file content');
      console.error(err);
    }
  };
  
  if (loading) return <div className="p-6">Loading documentation...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documentation</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* File Tree */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">File Tree</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {docs.map((item, index) => (
                <div key={index} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50" 
                     onClick={() => item.type === 'file' ? handleFileSelect(item.path) : null}>
                  <div className="flex-shrink-0">
                    {item.type === 'directory' ? (
                      <span className="material-icons">folder</span>
                    ) : (
                      <span className="material-icons">description</span>
                    )}
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-sm text-gray-900 truncate">{item.name}</p>
                    {item.type === 'directory' && (
                      <p className="text-xs text-gray-500">directory</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* File Content Viewer */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedFile ? (
                <span className="truncate max-w-[200px]">{selectedFile.split('/').pop()}</span>
              ) : (
                'Select a file to view'
              )}
            </h2>
          </div>
          <div className="p-4">
            {fileContent !== null ? (
              <div className="prose prose-sm max-w-none">
                {/* In a real app, we would use a markdown renderer like react-markdown */}
                <pre className="bg-gray-50 p-4 rounded overflow-auto">{fileContent}</pre>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a file from the tree to view its content</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
