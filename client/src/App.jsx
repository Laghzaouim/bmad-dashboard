import { useState, useEffect, useCallback, useRef } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';
import StoryPanel from './components/StoryPanel.jsx';
import StoryDetail from './components/StoryDetail.jsx';
import { useSSE } from './hooks/useSSE.js';

const LS_KEY = 'bmad-selected-project';

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
      if (!initialized.current && data.length > 0) {
        initialized.current = true;
        const saved = localStorage.getItem(LS_KEY);
        const found = saved && data.find(p => p.name === saved);
        setSelectedProject(found ? saved : data[0].name);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useSSE(fetchProjects);

  function selectProject(name) {
    setSelectedProject(name);
    setSelectedEpic(null);
    localStorage.setItem(LS_KEY, name);
  }

  const project = projects.find(p => p.name === selectedProject);

  return (
    <div className="h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {loading ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          Scanning projects…
        </div>
      ) : projects.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          No BMAD projects found in /code
        </div>
      ) : (
        <KanbanBoard
          project={project}
          projects={projects}
          selectedProject={selectedProject}
          onSelect={selectProject}
          onRefresh={fetchProjects}
          onEpicClick={epic => setSelectedEpic(epic)}
        />
      )}

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
