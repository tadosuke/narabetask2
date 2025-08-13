import { useState } from "react";
import type { Task, WorkingHours } from "./types";
import { TaskCard } from "./components/TaskCard";
import { Timeline } from "./components/Timeline";
import "./App.css";

// コンポーネントのプレースホルダー（後で実装）
const TaskCreator = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div>
    <button onClick={onCreateTask}>タスク作成</button>
  </div>
);

const TaskPool = ({
  tasks,
  onTaskClick,
  onTaskDrop,
}: {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onTaskDrop: (taskId: string) => void;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    onTaskDrop(taskId);
  };

  return (
    <div className="task-pool" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h3>タスク置き場</h3>
      <div className="task-pool-content">
        {tasks
          .filter((task) => task.position === null)
          .map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
      </div>
    </div>
  );
};

const TaskSettings = ({
  task,
  onUpdateTask,
  onClose,
}: {
  task: Task | null;
  onUpdateTask: (task: Task) => void;
  onClose: () => void;
}) => {
  if (!task) return null;

  return (
    <div>
      <h3>タスク設定</h3>
      <button onClick={onClose}>×</button>
      <div>
        <label>タスク名: </label>
        <input
          value={task.name}
          onChange={(e) => onUpdateTask({ ...task, name: e.target.value })}
        />
      </div>
      <div>
        <label>工数: </label>
        <select
          value={task.duration}
          onChange={(e) =>
            onUpdateTask({ ...task, duration: Number(e.target.value) })
          }
        >
          <option value={1}>15分</option>
          <option value={2}>30分</option>
          <option value={3}>45分</option>
          <option value={4}>1時間</option>
        </select>
      </div>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [workingHours] = useState<WorkingHours>({
    start: "09:00",
    end: "18:00",
  });

  // タスク作成
  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: `タスク ${tasks.length + 1}`,
      duration: 2, // デフォルト30分
      position: null, // タスク置き場に配置
    };
    setTasks([...tasks, newTask]);
  };

  // タスク選択
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // タスク更新
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  // タスク選択解除
  const handleCloseSettings = () => {
    setSelectedTaskId(null);
  };

  // 時間をHH:MM形式から分単位に変換
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // タスクの重複チェック（同一行のみ・後方互換性のため保持）
  // 新しいcheckAllRowsConflict関数で置き換え済み
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkTaskConflict = (
    taskId: string,
    row: number,
    startTime: string,
    duration: number
  ): boolean => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration * 15;

    return tasks.some((task) => {
      if (task.id === taskId || task.position === null) return false;
      if (task.position.row !== row) return false;

      const existingStart = timeToMinutes(task.position.startTime);
      const existingEnd = existingStart + task.duration * 15;

      // 時間が重複するかチェック
      return !(endMinutes <= existingStart || startMinutes >= existingEnd);
    });
  };
  // 全行での重複チェック（詳細な重複情報を返す）
  const checkAllRowsConflict = (
    taskId: string,
    row: number,
    startTime: string,
    duration: number
  ): { hasConflict: boolean; conflictingTasks: Array<{ task: Task; conflictType: string; overlapType: string }> } => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration * 15;
    const conflictingTasks: Array<{ task: Task; conflictType: string; overlapType: string }> = [];

    tasks.forEach((task) => {
      if (task.id === taskId || task.position === null) return;

      const existingStart = timeToMinutes(task.position.startTime);
      const existingEnd = existingStart + task.duration * 15;

      // 時間が重複するかチェック
      const hasTimeOverlap = !(endMinutes <= existingStart || startMinutes >= existingEnd);
      
      if (hasTimeOverlap) {
        const conflictType = task.position.row === row 
          ? "同一行重複" 
          : `異なる行重複 (行${task.position.row + 1})`;
        
        // 重複のタイプを詳細に分析
        let overlapType = "完全重複";
        if (startMinutes < existingStart && endMinutes > existingEnd) {
          overlapType = "包含重複";
        } else if (startMinutes >= existingStart && endMinutes <= existingEnd) {
          overlapType = "内包重複";
        } else if (startMinutes < existingStart) {
          overlapType = "前半重複";
        } else if (endMinutes > existingEnd) {
          overlapType = "後半重複";
        } else {
          overlapType = "部分重複";
        }
        
        conflictingTasks.push({ task, conflictType, overlapType });
      }
    });

    return {
      hasConflict: conflictingTasks.length > 0,
      conflictingTasks
    };
  };

  // タスクをタイムラインにドロップ
  const handleTaskDropToTimeline = (
    taskId: string,
    row: number,
    startTime: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 全行での重複チェック（詳細な重複情報を取得）
    const conflictResult = checkAllRowsConflict(taskId, row, startTime, task.duration);
    
    if (conflictResult.hasConflict) {
      // 詳細な重複警告メッセージを作成
      const conflictMessages = conflictResult.conflictingTasks.map(({ task: conflictingTask, conflictType, overlapType }) => {
        const conflictStart = conflictingTask.position!.startTime;
        const conflictDuration = conflictingTask.duration * 15; // 分単位
        const hours = Math.floor(conflictDuration / 60);
        const minutes = conflictDuration % 60;
        const durationText = hours > 0 ? `${hours}時間${minutes > 0 ? minutes + '分' : ''}` : `${minutes}分`;
        
        return `・${conflictType}: "${conflictingTask.name}" (${conflictStart}開始, ${durationText}) - ${overlapType}`;
      }).join('\n');
      
      const summary = conflictResult.conflictingTasks.length === 1 
        ? '1つのタスクと重複' 
        : `${conflictResult.conflictingTasks.length}つのタスクと重複`;
      
      alert(`タスクの時間が重複しています (${summary}):

${conflictMessages}

別の時間帯または行に配置してください。`);
      return;
    }

    // 業務時間内チェック
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + task.duration * 15;
    const workStartMinutes = timeToMinutes(workingHours.start);
    const workEndMinutes = timeToMinutes(workingHours.end);

    if (startMinutes < workStartMinutes || endMinutes > workEndMinutes) {
      alert("業務時間外には配置できません");
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, position: { row, startTime } } : t
      )
    );
  };

  // タスクをタスク置き場に戻す
  const handleTaskDropToPool = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, position: null } : task
      )
    );
  };

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) || null
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>タスク調整アプリ</h1>
      </header>

      <div className="app-content">
        {/* 上部：タイムライン（横スクロール可能） */}
        <div className="timeline-section">
          <Timeline
            tasks={tasks}
            workingHours={workingHours}
            onTaskClick={handleSelectTask}
            onTaskDrop={handleTaskDropToTimeline}
          />
        </div>

        {/* 中部：タスク置き場 */}
        <div className="task-section">
          <div className="task-creator-area">
            <TaskCreator onCreateTask={handleCreateTask} />
          </div>
          <TaskPool
            tasks={tasks}
            onTaskClick={handleSelectTask}
            onTaskDrop={handleTaskDropToPool}
          />
        </div>

        {/* 下部：タスク設定 */}
        <div className="settings-section">
          <TaskSettings
            task={selectedTask}
            onUpdateTask={handleUpdateTask}
            onClose={handleCloseSettings}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
