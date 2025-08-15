import React from "react";
import type { Task } from "../types";

interface TaskSettingsProps {
  task: Task | null;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * Task settings component
 * Provides functionality to edit selected task name and duration
 */
export const TaskSettings: React.FC<TaskSettingsProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (!task) return null;

  return (
    <div>
      <h3>タスク設定</h3>
      <button onClick={() => onDeleteTask(task.id)}>×</button>
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