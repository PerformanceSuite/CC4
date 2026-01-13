import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Map, ListTodo, DollarSign, Folder, Settings as SettingsIcon, Lightbulb } from 'lucide-react'
import Canvas from './components/Canvas'
import Ideas from './components/Ideas'
import Execution from './components/Execution'
import Dashboard from './components/Dashboard'
import ProjectDashboard from './components/ProjectDashboard'
import Settings from './components/Settings'
import LivingContextPanel from './components/LivingContextPanel'
import LivingOrb from './components/ui/LivingOrb'
import { ProjectFocusBar } from './components/project-focus/ProjectFocusBar'
import { useProjectsStore } from './stores/projectsStore'
import { useActivityStore } from './stores/activityStore'

function App() {
  const [showLivingContext, setShowLivingContext] = useState(false)
  const { fetchActiveProject } = useProjectsStore()
  const isAIActive = useActivityStore((state) => state.isActive)

  // Fetch active project on mount
  useEffect(() => {
    fetchActiveProject()
  }, [fetchActiveProject])

  return (
    <div className="flex h-screen bg-cc-bg">
      {/* Sidebar */}
      <nav className="w-16 bg-cc-surface border-r border-cc-border flex flex-col items-center py-4 gap-4">
        <Link
          to="/projects"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="Projects"
        >
          <Folder className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
        <Link
          to="/"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="VISLZR (Canvas)"
        >
          <Map className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
        <Link
          to="/ideas"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="Ideas"
        >
          <Lightbulb className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
        <Link
          to="/execution"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="Execution"
        >
          <ListTodo className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
        <Link
          to="/dashboard"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="Revenue Dashboard"
        >
          <DollarSign className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
        <div className="flex-1" />
        <LivingOrb
          isActive={isAIActive}
          isPanelOpen={showLivingContext}
          size={20}
          onClick={() => setShowLivingContext(!showLivingContext)}
        />
        <Link
          to="/settings"
          className="p-3 rounded-lg hover:bg-cc-border transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-6 h-6 text-gray-400 hover:text-white" />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Project Focus Bar */}
        <ProjectFocusBar />

        {/* Routes */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/projects" element={<ProjectDashboard />} />
            <Route path="/" element={<Canvas />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/execution" element={<Execution />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      {/* Living Context Panel (available on all tabs) */}
      <LivingContextPanel
        isOpen={showLivingContext}
        onClose={() => setShowLivingContext(false)}
      />
    </div>
  )
}

export default App
