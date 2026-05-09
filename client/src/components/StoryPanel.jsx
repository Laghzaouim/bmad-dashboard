import { useEffect } from 'react';
import StoryCard from './StoryCard.jsx';

const STORY_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-gray-400' },
  { id: 'ready-for-dev', label: 'Ready', color: 'text-blue-400' },
  { id: 'in-progress', label: 'In Progress', color: 'text-amber-400' },
  { id: 'review', label: 'Review', color: 'text-purple-400' },
  { id: 'done', label: 'Done', color: 'text-emerald-400' },
  { id: 'cancelled', label: 'Cancelled', color: 'text-red-500' },
];

const EPIC_STATUS_BADGE = {
  'in-progress': 'bg-amber-900/50 text-amber-300',
  done: 'bg-emerald-900/50 text-emerald-300',
  backlog: 'bg-gray-800 text-gray-400',
};

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function StoryPanel({ epic, project, onClose, onStoryClick, storyOpen }) {
  useEffect(() => {
    if (storyOpen) return; // let StoryDetail handle Escape when it's open
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, storyOpen]);

  const columns = STORY_COLUMNS.map(col => ({
    ...col,
    stories: epic.stories.filter(s => s.status === col.id),
  })).filter(col => col.stories.length > 0 || col.id !== 'cancelled');

  const visibleColumns = columns.filter(
    col => col.stories.length > 0 || !['cancelled'].includes(col.id)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-[65%] bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-gray-500">{epic.id.replace('epic-', 'Epic ')}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EPIC_STATUS_BADGE[epic.status] || ''}`}>
                {epic.status}
              </span>
            </div>
            <h2 className="text-base font-semibold text-white truncate">{epic.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Story Kanban */}
        <div className="flex-1 overflow-auto p-5">
          {epic.stories.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              No stories yet
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(0, 1fr))` }}>
              {visibleColumns.map(col => (
                <div key={col.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-[10px] text-gray-600">{col.stories.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.stories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        artifactsDir={project.artifactsDir}
                        onClick={() => onStoryClick && onStoryClick(story)}
                      />
                    ))}
                    {col.stories.length === 0 && (
                      <div className="rounded border border-dashed border-gray-800 h-10 flex items-center justify-center">
                        <span className="text-[10px] text-gray-700">—</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
