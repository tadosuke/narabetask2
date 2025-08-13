import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard = ({ task, onClick, isDragging }: TaskCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = () => {
    onClick(task.id);
  };

  return (
    <div
      className={`task-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="task-card-header">
        <span className="task-name">{task.name}</span>
      </div>
      <div className="task-card-body">
        <span className="task-duration">{task.duration * 15}分</span>
      </div>
    </div>
  );
};
