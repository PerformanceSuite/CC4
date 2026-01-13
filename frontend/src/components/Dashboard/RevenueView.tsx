import { useState } from 'react'
import { DollarSign, ChevronRight, Activity, AlertCircle, CheckCircle } from 'lucide-react'
import useRevenue, { type ProjectRevenueDetails } from '../../hooks/useRevenue'
import ProjectRevenueModal from './ProjectRevenueModal'
import GoalProgressBar from './GoalProgressBar'

export default function RevenueView() {
  const { projects, isLoading, error, fetchProjectDetails, goalProgress } = useRevenue()
  const [selectedProject, setSelectedProject] = useState<ProjectRevenueDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProjectClick = async (projectId: string) => {
    const details = await fetchProjectDetails(projectId)
    if (details) {
      setSelectedProject(details)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    pipeline: { icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    'at-risk': { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    churned: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-cc-bg rounded-lg animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <>
        <GoalProgressBar goalProgress={goalProgress} isLoading={isLoading} />
        <div className="text-center py-8 mt-4">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No revenue streams yet</p>
          <button className="mt-4 px-4 py-2 bg-cc-accent/20 text-cc-accent rounded-lg hover:bg-cc-accent/30 transition-colors text-sm">
            Add Revenue Stream
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Goal Progress */}
      <div className="mb-4">
        <GoalProgressBar goalProgress={goalProgress} isLoading={isLoading} />
      </div>

      {/* Project Revenue Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Revenue by Project</h3>
        {projects.map((project) => {
          const config = statusConfig[project.status]
          const Icon = config.icon

          return (
            <button
              key={project.project_id}
              onClick={() => handleProjectClick(project.project_id)}
              className="w-full flex items-center justify-between p-3 bg-cc-bg rounded-lg hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 ${config.bg} rounded-lg`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{project.project_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${config.color} capitalize`}>{project.status}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      Started {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-green-400">
                    ${project.mrr.toLocaleString()}/mo
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(project.arr / 1000).toFixed(0)}k ARR
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cc-accent transition-colors" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Project Revenue Modal */}
      <ProjectRevenueModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
