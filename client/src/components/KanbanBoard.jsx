import EpicCard from './EpicCard.jsx';

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
        <p className="text-xs text-gray-600 mt-1">{project.sprintStatusPath}</p>
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
