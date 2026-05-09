const STATUS_DOT = {
  'in-progress': 'bg-amber-400',
  done: 'bg-emerald-500',
  backlog: 'bg-gray-600',
};

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

export default function Sidebar({ projects, selected, onSelect, onRefresh }) {
  return (
    <aside className="w-52 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-4 pt-5 pb-3 border-b border-gray-800">
        <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">BMAD</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {projects.map(p => (
          <button
            key={p.name}
            onClick={() => onSelect(p.name)}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
              selected === p.name
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[p.overallStatus] || 'bg-gray-600'}`} />
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>
    </aside>
  );
}
