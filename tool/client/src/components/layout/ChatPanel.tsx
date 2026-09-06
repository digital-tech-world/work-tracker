import { useState } from 'react';

const ChatPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <section className="mb-3 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Assistant</h2>
            <button className="text-sm text-gray-500 hover:text-gray-900" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-500">AI chat is available when Ollama is running.</p>
        </section>
      )}
      <button
        className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-500"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide assistant' : 'Assistant'}
      </button>
    </div>
  );
};

export default ChatPanel;
