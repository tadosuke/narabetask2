import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { TaskService } from '../services/taskService';
import './TaskPool.css';

/**
 * Task creation component
 * Provides a button to create new tasks
 */
export const TaskCreator = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div>
    <button onClick={onCreateTask}>タスク作成</button>
  </div>
);

/**
 * Task pool component
 * Displays unscheduled tasks and allows drag & drop to receive tasks
 */
export const TaskPool = ({
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
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskDrop(taskId);
  };

  return (
    <div className="task-pool" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h3>タスク置き場</h3>
      <div className="task-pool-content">
        {TaskService.getPoolTasks(tasks).map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
};
