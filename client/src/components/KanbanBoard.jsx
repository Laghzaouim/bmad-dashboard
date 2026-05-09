import EpicCard from './EpicCard.jsx';

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

const EPIC_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-gray-400' },
  { id: 'in-progress', label: 'In Progress', color: 'text-amber-400' },
  { id: 'done', label: 'Done', color: 'text-emerald-400' },
];

function formatDate(raw) {
  if (!raw) return '';
  const s = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return '';
  try {
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return s; }
}

export default function KanbanBoard({ project, onEpicClick }) {
  const columns = EPIC_COLUMNS.map(col => ({
    ...col,
    epics: project.epics.filter(e => e.status === col.id),
  }));

  const { total, done, pct } = projectProgress(project.epics);

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 pt-6 pb-4 border-b border-gray-800">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold text-white">{project.name}</h1>
          {project.lastUpdated && (
            <span className="text-xs text-gray-500">
              updated {formatDate(project.lastUpdated)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 mb-3">{project.sprintStatusPath}</p>
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
                    sprintStatusPath={project.sprintStatusPath}
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
