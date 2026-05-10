import { useState, useRef, useEffect } from 'react';
import EpicCard from './EpicCard.jsx';

const STATUS_DOT = {
  'in-progress': 'bg-amber-400',
  done: 'bg-emerald-500',
  backlog: 'bg-gray-600',
};

const EPIC_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-gray-400' },
  { id: 'in-progress', label: 'In Progress', color: 'text-amber-400' },
  { id: 'done', label: 'Done', color: 'text-emerald-400' },
];

function projectProgress(epics) {
  let total = 0, done = 0;
  for (const epic of epics) {
    for (const story of epic.stories) {
      if (story.status === 'optional') continue;
      total++;
      if (story.status === 'done') done++;
    }
  }
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function formatDate(raw) {
  if (!raw) return '';
  const s = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return '';
  try {
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return s; }
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ProjectDropdown({ projects, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selectedProject = projects.find(p => p.name === selected);

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm font-medium text-white transition-colors"
      >
        {selectedProject && (
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[selectedProject.overallStatus] || 'bg-gray-600'}`} />
        )}
        <span>{selected || 'Select project'}</span>
        <ChevronIcon />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-50 overflow-hidden">
          {projects.map(p => (
            <button
              key={p.name}
              onClick={() => { onSelect(p.name); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                selected === p.name
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[p.overallStatus] || 'bg-gray-600'}`} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ project, projects, selectedProject, onSelect, onRefresh, onEpicClick }) {
  const columns = EPIC_COLUMNS.map(col => ({
    ...col,
    epics: project ? project.epics.filter(e => e.status === col.id) : [],
  }));

  const { total, done, pct } = project ? projectProgress(project.epics) : { total: 0, done: 0, pct: 0 };

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 pt-4 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">BMAD</span>
            <ProjectDropdown projects={projects} selected={selectedProject} onSelect={onSelect} />
            {project?.lastUpdated && (
              <span className="text-xs text-gray-500">updated {formatDate(project.lastUpdated)}</span>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {project && (
          <>
            {project.sprintStatusPath && (
              <p className="text-xs text-gray-600 mt-2 mb-3">{project.sprintStatusPath}</p>
            )}
            {total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{done} / {total} stories done</span>
                  <span className={`text-xs font-semibold ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-5 h-full">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold tracking-wider uppercase ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-gray-600">{col.epics.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {col.epics.map(epic => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    sprintStatusPath={project?.sprintStatusPath}
                    onClick={() => onEpicClick(epic)}
                  />
                ))}
                {col.epics.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-800 h-16 flex items-center justify-center">
                    <span className="text-xs text-gray-700">—</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
