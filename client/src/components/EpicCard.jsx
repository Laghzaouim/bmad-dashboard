import { useState } from 'react';

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const STATUS_BORDER = {
  'in-progress': 'border-amber-700/50',
  done: 'border-emerald-800/50',
  backlog: 'border-gray-700/50',
};

export default function EpicCard({ epic, sprintStatusPath, onClick }) {
  const [copied, setCopied] = useState(false);

  const activeStories = epic.stories.filter(s => s.status !== 'optional');
  const doneCount = activeStories.filter(s => s.status === 'done' || s.status === 'cancelled').length;
  const total = activeStories.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  function handleCopy(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(sprintStatusPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gray-900 rounded-lg border ${STATUS_BORDER[epic.status] || 'border-gray-700/50'} p-4 cursor-pointer hover:bg-gray-800 transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{epic.id.replace('epic-', 'Epic ')}</p>
          <p className="text-sm font-medium text-gray-100 leading-snug">{epic.title}</p>
        </div>
        <button
          onClick={handleCopy}
          title="Copy sprint-status.yaml path"
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-all"
        >
          {copied ? (
            <span className="text-xs text-emerald-400 whitespace-nowrap">Copied!</span>
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>

      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">{doneCount}/{total} stories</span>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
