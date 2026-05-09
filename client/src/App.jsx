import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import StoryPanel from './components/StoryPanel.jsx';
import StoryDetail from './components/StoryDetail.jsx';
import { useSSE } from './hooks/useSSE.js';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      setSelectedProject(prev => {
        if (prev) return prev;
        if (!initialized.current && data.length > 0) {
          initialized.current = true;
          return data[0].name;
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useSSE(fetchProjects);

  const project = projects.find(p => p.name === selectedProject);

  function handleEpicClick(epic) {
    setSelectedEpic(epic);
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      <Sidebar
        projects={projects}
        selected={selectedProject}
        onSelect={name => { setSelectedProject(name); setSelectedEpic(null); }}
        onRefresh={fetchProjects}
      />

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Scanning projects…
          </div>
        ) : project ? (
          <KanbanBoard project={project} onEpicClick={handleEpicClick} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No BMAD projects found in /code
          </div>
        )}
      </main>

      {selectedEpic && project && (
        <StoryPanel
          epic={selectedEpic}
          project={project}
          onClose={() => { setSelectedEpic(null); setSelectedStory(null); }}
          onStoryClick={story => setSelectedStory({ story, project })}
          storyOpen={!!selectedStory}
        />
      )}

      {selectedStory && (
        <StoryDetail
          story={selectedStory.story}
          project={selectedStory.project}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
