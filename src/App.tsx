import { useState } from "react"
import { Task, WorkingHours } from "./types"
import { TaskCard } from "./components/TaskCard"
import { Timeline } from "./components/Timeline"
import "./App.css"

// コンポーネントのプレースホルダー（後で実装）
const TaskCreator = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div>
    <button onClick={onCreateTask}>タスク作成</button>
  </div>
)

const TaskPool = ({ 
  tasks, 
  onTaskClick,
  onTaskDrop 
}: { 
  tasks: Task[]
  onTaskClick: (taskId: string) => void 
  onTaskDrop: (taskId: string) => void
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    onTaskDrop(taskId)
  }

  return (
    <div 
      className="task-pool"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3>タスク置き場</h3>
      <div className="task-pool-content">
        {tasks.filter(task => task.position === null).map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )
}


const TaskSettings = ({ 
  task, 
  onUpdateTask, 
  onClose 
}: { 
  task: Task | null
  onUpdateTask: (task: Task) => void
  onClose: () => void 
}) => {
  if (!task) return null
  
  return (
    <div>
      <h3>タスク設定</h3>
      <button onClick={onClose}>×</button>
      <div>
        <label>タスク名: </label>
        <input 
          value={task.name} 
          onChange={(e) => onUpdateTask({...task, name: e.target.value})}
        />
      </div>
      <div>
        <label>工数: </label>
        <select 
          value={task.duration} 
          onChange={(e) => onUpdateTask({...task, duration: Number(e.target.value)})}
        >
          <option value={1}>15分</option>
          <option value={2}>30分</option>
          <option value={3}>45分</option>
          <option value={4}>1時間</option>
        </select>
      </div>
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [workingHours] = useState<WorkingHours>({
    start: "09:00",
    end: "18:00"
  })

  // タスク作成
  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: `タスク ${tasks.length + 1}`,
      duration: 2, // デフォルト30分
      position: null // タスク置き場に配置
    }
    setTasks([...tasks, newTask])
  }

  // タスク選択
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  // タスク更新
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }

  // タスク選択解除
  const handleCloseSettings = () => {
    setSelectedTaskId(null)
  }

  // 時間をHH:MM形式から分単位に変換
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // タスクの重複チェック
  const checkTaskConflict = (taskId: string, row: number, startTime: string, duration: number): boolean => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + (duration * 15)

    return tasks.some(task => {
      if (task.id === taskId || task.position === null) return false
      if (task.position.row !== row) return false

      const existingStart = timeToMinutes(task.position.startTime)
      const existingEnd = existingStart + (task.duration * 15)

      // 時間が重複するかチェック
      return !(endMinutes <= existingStart || startMinutes >= existingEnd)
    })
  }

  // タスクをタイムラインにドロップ
  const handleTaskDropToTimeline = (taskId: string, row: number, startTime: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // 重複チェック
    if (checkTaskConflict(taskId, row, startTime, task.duration)) {
      alert('他のタスクと時間が重複しています')
      return
    }

    // 業務時間内チェック
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + (task.duration * 15)
    const workStartMinutes = timeToMinutes(workingHours.start)
    const workEndMinutes = timeToMinutes(workingHours.end)

    if (startMinutes < workStartMinutes || endMinutes > workEndMinutes) {
      alert('業務時間外には配置できません')
      return
    }

    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, position: { row, startTime } }
        : t
    ))
  }

  // タスクをタスク置き場に戻す
  const handleTaskDropToPool = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, position: null }
        : task
    ))
  }

  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) || null : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>タスク調整アプリ</h1>
      </header>
      
      <div className="app-content">
        <div className="left-panel">
          <TaskCreator onCreateTask={handleCreateTask} />
          <TaskPool 
            tasks={tasks} 
            onTaskClick={handleSelectTask} 
            onTaskDrop={handleTaskDropToPool}
          />
        </div>
        
        <div className="center-panel">
          <Timeline 
            tasks={tasks} 
            workingHours={workingHours} 
            onTaskClick={handleSelectTask}
            onTaskDrop={handleTaskDropToTimeline}
          />
        </div>
        
        <div className="right-panel">
          <TaskSettings 
            task={selectedTask}
            onUpdateTask={handleUpdateTask}
            onClose={handleCloseSettings}
          />
        </div>
      </div>
    </div>
  )
}

export default App
