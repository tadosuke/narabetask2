import { useEffect, useState } from 'react';
import type { WorkingHours } from './types';
import { Timeline } from './components/Timeline';
import { TaskSettings } from './components/TaskSettings';
import { TaskCreator, TaskPool } from './components/TaskPool';
import { Splitter } from './components/Splitter';
import { useTasks } from './hooks/useTasks';
import { DEFAULT_WORKING_HOURS } from './constants';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 * タスクの作成・編集・スケジューリング機能を提供
 */
function App() {
  // State for splitter position (percentage)
  const [splitterPosition, setSplitterPosition] = useState(40);

  // 業務時間の設定（開始・終了時刻）
  const workingHours: WorkingHours = {
    start: DEFAULT_WORKING_HOURS.START,
    end: DEFAULT_WORKING_HOURS.END,
  };

  // カスタムフックでタスク管理ロジックを分離
  const {
    tasks,
    selectedTask,
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    dropTaskToTimeline,
    dropTaskToPool,
  } = useTasks(workingHours.start, workingHours.end);

  /**
   * Delete key handler for deleting selected tasks
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedTask) {
        deleteTask(selectedTask.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTask, deleteTask]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ナラベタスク</h1>
      </header>

      <div
        className="app-content"
        style={{
          gridTemplateRows: `${splitterPosition}% auto ${100 - splitterPosition}%`,
        }}
      >
        {/* Top: Timeline (horizontal scrollable) */}
        <div className="timeline-section">
          <Timeline
            tasks={tasks}
            workingHours={workingHours}
            onTaskClick={selectTask}
            onTaskDrop={dropTaskToTimeline}
          />
        </div>

        {/* Draggable splitter */}
        <Splitter
          orientation="horizontal"
          initialPosition={splitterPosition}
          minPosition={20}
          maxPosition={80}
          onPositionChange={setSplitterPosition}
          className="main-splitter"
        />

        {/* Bottom: Two-column layout for Task Pool and Settings */}
        <div className="two-column-section">
          {/* Left column: Task Pool */}
          <div className="task-section">
            <div className="task-creator-area">
              <TaskCreator onCreateTask={createTask} />
            </div>
            <TaskPool
              tasks={tasks}
              onTaskClick={selectTask}
              onTaskDrop={dropTaskToPool}
            />
          </div>

          {/* Right column: Task Settings */}
          <div className="settings-section">
            <TaskSettings
              task={selectedTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
