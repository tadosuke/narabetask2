import React from 'react';
import type { Task } from '../types';
import './TaskSettings.css';

/**
 * Props interface for the TaskSettings component
 * Defines the shape of props expected by the component
 */
interface TaskSettingsProps {
  /**
   * The currently selected task to be edited
   * Null indicates no task is selected
   */
  task: Task | null;

  /**
   * Callback function to update the task
   * @param task - The updated task object
   */
  onUpdateTask: (task: Task) => void;

  /**
   * Callback function to delete the current task
   * @param taskId - Unique identifier of the task to be deleted
   */
  onDeleteTask: (taskId: string) => void;
}

/**
 * TaskSettings Component
 *
 * Provides a user interface for editing task details, including:
 * - Task name modification
 * - Task duration selection
 * - Task deletion
 *
 * @component
 * @param {TaskSettingsProps} props - Component properties
 * @returns {React.ReactElement|null} Rendered task settings UI or null if no task is selected
 */
export const TaskSettings: React.FC<TaskSettingsProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
}) => {
  // If no task is selected, render nothing
  if (!task) return null;

  return (
    <div>
      {/* Section title with delete button on the right */}
      <div className="task-settings-header">
        <h3 className="task-settings-title">タスク設定</h3>
        {/* Delete task button */}
        <button onClick={() => onDeleteTask(task.id)} aria-label="Delete task">
          <span className="material-icons">delete</span>
        </button>
      </div>

      {/* Task name input field */}
      <div className="task-input-container">
        <label htmlFor="task-name" className="task-settings-label">
          タスク名:{' '}
        </label>
        <input
          id="task-name"
          value={task.name}
          onChange={(e) =>
            // Update task name while preserving other task properties
            onUpdateTask({ ...task, name: e.target.value })
          }
          aria-label="Edit task name"
        />
      </div>

      {/* Task duration selection */}
      <div className="task-duration-container">
        <label htmlFor="task-duration" className="task-settings-label">
          工数:{' '}
        </label>
        <input
          id="task-duration"
          type="range"
          min="1"
          max="16"
          step="1"
          value={task.duration}
          onChange={(e) =>
            // Update task duration while preserving other task properties
            onUpdateTask({ ...task, duration: Number(e.target.value) })
          }
          aria-label="Select task duration"
          className="task-duration-slider"
        />
        <span className="task-duration-display">
          {task.duration * 15}分
        </span>
      </div>
    </div>
  );
};
