import { useState, useEffect, useCallback } from 'react';
import type { Task, WorkingHours } from './types';
import { Timeline } from './components/Timeline';
import { TaskSettings } from './components/TaskSettings';
import { TaskCreator, TaskPool } from './components/TaskPool';
import './App.css';


/**
 * メインアプリケーションコンポーネント
 * タスクの作成・編集・スケジューリング機能を提供
 */
function App() {
  // 全タスクのリスト（タスク置き場およびタイムライン上のタスク）
  const [tasks, setTasks] = useState<Task[]>([]);
  // 現在選択されているタスクのID（設定画面表示用）
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // 業務時間の設定（開始・終了時刻）
  const [workingHours] = useState<WorkingHours>({
    start: '09:00',
    end: '18:00',
  });

  /**
   * 新しいタスクを作成してタスク置き場に追加
   */
  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: `タスク ${tasks.length + 1}`,
      duration: 2, // デフォルト30分（15分単位で2 = 30分）
      position: null, // タスク置き場に配置（タイムライン上ではない）
    };
    setTasks([...tasks, newTask]);
  };

  /**
   * タスクを選択して設定画面を表示
   */
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  /**
   * タスクの情報を更新（名前、工数など）
   */
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  /**
   * タスクを削除する
   */
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      setTasks(tasks.filter((task) => task.id !== taskId));
      setSelectedTaskId(null);
    },
    [tasks]
  );

  /**
   * Delete key handler for deleting selected tasks
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedTaskId) {
        handleDeleteTask(selectedTaskId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTaskId, handleDeleteTask]);

  /**
   * 時間をHH:MM形式から分単位に変換
   * @param timeStr "09:30" 形式の時間文字列
   * @returns 分単位の数値（例：570分）
   */
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  /**
   * 全行でのタスク重複チェック（詳細な重複情報を返す）
   * @param taskId チェック対象のタスクID
   * @param row 配置予定の行番号
   * @param startTime 開始時刻（HH:MM形式）
   * @param duration 所要時間（15分単位）
   * @returns 重複有無と詳細な重複情報
   */
  const checkAllRowsConflict = (
    taskId: string,
    row: number,
    startTime: string,
    duration: number
  ): {
    hasConflict: boolean;
    conflictingTasks: Array<{
      task: Task;
      conflictType: string;
      overlapType: string;
    }>;
  } => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration * 15;
    const conflictingTasks: Array<{
      task: Task;
      conflictType: string;
      overlapType: string;
    }> = [];

    tasks.forEach((task) => {
      if (task.id === taskId || task.position === null) return;

      const existingStart = timeToMinutes(task.position.startTime);
      const existingEnd = existingStart + task.duration * 15;

      // 時間が重複するかチェック
      const hasTimeOverlap = !(
        endMinutes <= existingStart || startMinutes >= existingEnd
      );

      if (hasTimeOverlap) {
        const conflictType =
          task.position.row === row
            ? '同一行重複'
            : `異なる行重複 (行${task.position.row + 1})`;

        // 重複のタイプを詳細に分析
        let overlapType = '完全重複';
        if (startMinutes < existingStart && endMinutes > existingEnd) {
          overlapType = '包含重複';
        } else if (startMinutes >= existingStart && endMinutes <= existingEnd) {
          overlapType = '内包重複';
        } else if (startMinutes < existingStart) {
          overlapType = '前半重複';
        } else if (endMinutes > existingEnd) {
          overlapType = '後半重複';
        } else {
          overlapType = '部分重複';
        }

        conflictingTasks.push({ task, conflictType, overlapType });
      }
    });

    return {
      hasConflict: conflictingTasks.length > 0,
      conflictingTasks,
    };
  };

  /**
   * タスクをタイムラインにドロップした際の処理
   * 重複チェックと業務時間チェックを行った後にタスクを配置
   */
  const handleTaskDropToTimeline = (
    taskId: string,
    row: number,
    startTime: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 全行での重複チェック（詳細な重複情報を取得）
    const conflictResult = checkAllRowsConflict(
      taskId,
      row,
      startTime,
      task.duration
    );

    if (conflictResult.hasConflict) {
      // 詳細な重複警告メッセージを作成
      const conflictMessages = conflictResult.conflictingTasks
        .map(({ task: conflictingTask, conflictType, overlapType }) => {
          const conflictStart = conflictingTask.position!.startTime;
          const conflictDuration = conflictingTask.duration * 15; // 分単位
          const hours = Math.floor(conflictDuration / 60);
          const minutes = conflictDuration % 60;
          const durationText =
            hours > 0
              ? `${hours}時間${minutes > 0 ? minutes + '分' : ''}`
              : `${minutes}分`;

          return `・${conflictType}: "${conflictingTask.name}" (${conflictStart}開始, ${durationText}) - ${overlapType}`;
        })
        .join('\n');

      const summary =
        conflictResult.conflictingTasks.length === 1
          ? '1つのタスクと重複'
          : `${conflictResult.conflictingTasks.length}つのタスクと重複`;

      alert(
        `タスクの時間が重複しています (${summary}):\n\n${conflictMessages}\n\n別の時間帯または行に配置してください。`
      );
      return;
    }

    // 業務時間内チェック
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + task.duration * 15;
    const workStartMinutes = timeToMinutes(workingHours.start);
    const workEndMinutes = timeToMinutes(workingHours.end);

    if (startMinutes < workStartMinutes || endMinutes > workEndMinutes) {
      alert('業務時間外には配置できません');
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, position: { row, startTime } } : t
      )
    );
  };

  /**
   * タスクをタスク置き場に戻す
   * タイムライン上のタスクをタスク置き場にドロップした際の処理
   */
  const handleTaskDropToPool = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, position: null } : task
      )
    );
  };

  // 現在選択されているタスクオブジェクトを取得
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) || null
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>ナラベタスク</h1>
      </header>

      <div className="app-content">
        {/* Top: Timeline (horizontal scrollable) */}
        <div className="timeline-section">
          <Timeline
            tasks={tasks}
            workingHours={workingHours}
            onTaskClick={handleSelectTask}
            onTaskDrop={handleTaskDropToTimeline}
          />
        </div>

        {/* Bottom: Two-column layout for Task Pool and Settings */}
        <div className="two-column-section">
          {/* Left column: Task Pool */}
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

          {/* Right column: Task Settings */}
          <div className="settings-section">
            <TaskSettings
              task={selectedTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
