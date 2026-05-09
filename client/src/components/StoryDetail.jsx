import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const STATUS_BADGE = {
  backlog: 'bg-gray-800 text-gray-400',
  'ready-for-dev': 'bg-blue-900/60 text-blue-300',
  'in-progress': 'bg-amber-900/60 text-amber-300',
  review: 'bg-purple-900/60 text-purple-300',
  done: 'bg-emerald-900/60 text-emerald-300',
  cancelled: 'bg-red-900/60 text-red-400',
};

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function StoryDetail({ story, project, onClose }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const storyPath = `${project.artifactsDir}/${story.id}.md`;

  useEffect(() => {
    setLoading(true);
    setContent(null);
    setError(null);
    fetch(`/api/story?path=${encodeURIComponent(storyPath)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setContent(data.content);
      })
      .catch(() => setError('Failed to load story'))
      .finally(() => setLoading(false));
  }, [storyPath]);

  // Escape closes this modal (capture phase runs before StoryPanel's bubble-phase listener)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  function handleCopy() {
    navigator.clipboard.writeText(storyPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />

      <div className="fixed inset-x-16 inset-y-10 bg-gray-900 border border-gray-700 rounded-xl z-[70] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                {story.id}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[story.status] || STATUS_BADGE.backlog}`}>
                {story.status}
              </span>
            </div>
            <h2 className="text-base font-semibold text-white truncate">{story.title}</h2>
          </div>
          <button
            onClick={handleCopy}
            title="Copy story file path"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <span className="text-emerald-400">Copied!</span>
            ) : (
              <><CopyIcon /><span>Copy path</span></>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading && (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Loading…
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <span className="text-gray-500 text-sm">{error}</span>
              <span className="text-xs text-gray-600">{storyPath}</span>
            </div>
          )}
          {content && (
            <div className="
              prose prose-invert prose-sm max-w-none
              prose-headings:font-semibold prose-headings:text-gray-100
              prose-h1:text-xl prose-h2:text-base prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-1
              prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-100
              prose-code:text-amber-300 prose-code:before:content-none prose-code:after:content-none
              prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
              prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0
              prose-blockquote:border-gray-600 prose-blockquote:text-gray-400
              prose-hr:border-gray-700
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              [&_input[type=checkbox]]:mr-1.5 [&_input[type=checkbox]]:accent-amber-400 [&_input[type=checkbox]]:cursor-default
              [&_li:has(input[type=checkbox])]:list-none [&_li:has(input[type=checkbox])]:pl-0
              [&_ul:has(input[type=checkbox])]:pl-2
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
