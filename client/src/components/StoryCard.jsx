import { useState } from 'react';

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const STATUS_STYLE = {
  backlog: 'bg-gray-800 border-gray-700',
  'ready-for-dev': 'bg-blue-950 border-blue-800',
  'in-progress': 'bg-amber-950 border-amber-800',
  review: 'bg-purple-950 border-purple-800',
  done: 'bg-emerald-950 border-emerald-900',
  cancelled: 'bg-gray-900 border-gray-700 opacity-50',
};

export default function StoryCard({ story, artifactsDir }) {
  const [copied, setCopied] = useState(false);

  const storyPath = `${artifactsDir}/${story.id}.md`;

  function handleCopy(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(storyPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={`group relative rounded-md border p-2.5 ${STATUS_STYLE[story.status] || STATUS_STYLE.backlog}`}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-600 leading-none mb-1">{story.id}</p>
          <p className={`text-xs text-gray-200 leading-snug ${story.status === 'cancelled' ? 'line-through text-gray-500' : ''}`}>
            {story.title}
          </p>
        </div>
        <button
          onClick={handleCopy}
          title="Copy story file path"
          className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-600 hover:text-gray-300 transition-all"
        >
          {copied ? (
            <span className="text-[10px] text-emerald-400 whitespace-nowrap">Copied</span>
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>
    </div>
  );
}
