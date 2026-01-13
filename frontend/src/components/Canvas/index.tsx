import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import IdeaNode from './nodes/IdeaNode'
import HypothesisNode from './nodes/HypothesisNode'
import InsightNode from './nodes/InsightNode'
import TaskNode from './nodes/TaskNode'
import TaskProgressNode from './nodes/TaskProgressNode'
import { useProjectFocus } from '../../hooks/useProjectFocus'

const nodeTypes = {
  idea: IdeaNode,
  hypothesis: HypothesisNode,
  insight: InsightNode,
  task: TaskNode,
  task_progress: TaskProgressNode,
}

const initialNodes = [
  {
    id: '1',
    type: 'idea',
    position: { x: 250, y: 100 },
    data: { label: 'Should we do an ICO?', status: 'new' },
  },
  {
    id: '2',
    type: 'hypothesis',
    position: { x: 100, y: 250 },
    data: { label: 'ICO would raise $10M+', confidence: 65 },
  },
  {
    id: '3',
    type: 'hypothesis',
    position: { x: 400, y: 250 },
    data: { label: 'Regulatory risk is manageable', confidence: 40 },
  },
  {
    id: '4',
    type: 'task_progress',
    position: { x: 550, y: 100 },
    data: { taskId: 'mock-task-1' },
  },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
]

export default function Canvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { hasFocus, isFocused } = useProjectFocus()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Apply focus filtering to nodes
  const filteredNodes = useMemo(() => {
    if (!hasFocus) {
      // No focus active - show all nodes normally
      return nodes
    }

    // Apply focus filtering: gray out non-focused nodes
    return nodes.map((node: Node) => {
      const nodeProjectId = node.data?.project_id

      // If node has no project_id, always show it normally (global items)
      if (!nodeProjectId) {
        return node
      }

      const isNodeFocused = isFocused(nodeProjectId)

      return {
        ...node,
        // Add opacity style to gray out non-focused nodes
        style: {
          ...node.style,
          opacity: isNodeFocused ? 1 : 0.3,
        },
        // Optionally disable non-focused nodes
        selectable: isNodeFocused,
        draggable: isNodeFocused,
      }
    })
  }, [nodes, hasFocus, isFocused])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-cc-bg"
      >
        <Controls className="!bg-cc-surface !border !border-cc-border rounded-xl shadow-lg" />
        <MiniMap className="!bg-cc-surface !border !border-cc-border rounded-xl shadow-lg" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
