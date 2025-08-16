import { useMemo } from 'react';
import type { Task, WorkingHours } from '../types';
import { TaskCard } from './TaskCard';

interface TimelineProps {
  tasks: Task[];
  workingHours: WorkingHours;
  onTaskClick: (taskId: string) => void;
  onTaskDrop: (taskId: string, row: number, startTime: string) => void;
}

export const Timeline = ({
  tasks,
  workingHours,
  onTaskClick,
  onTaskDrop,
}: TimelineProps) => {
  // 時間をHH:MM形式から分単位に変換
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分単位を時間文字列に変換
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 15分単位のタイムスロットを生成
  const generateTimeSlots = (): string[] => {
    const startMinutes = timeToMinutes(workingHours.start);
    const endMinutes = timeToMinutes(workingHours.end);
    const slots: string[] = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 15) {
      slots.push(minutesToTime(minutes));
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();
  const timelineRows = 5; // 最大5行のタスクを配置可能

  // ドラッグオーバー処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ドロップ処理
  const handleDrop = (e: React.DragEvent, row: number, timeSlot: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskDrop(taskId, row, timeSlot);
  };

  // タスクがタイムライン上にあるかチェック（メモ化）
  const timelineTasks = useMemo(
    () => tasks.filter((task) => task.position !== null),
    [tasks]
  );
  // 時間スロットごとのタスクマップを作成（メモ化によるパフォーマンス最適化）
  const timeSlotTaskMap = useMemo(() => {
    const map = new Map<string, Task[]>();

    timelineTasks.forEach((task) => {
      if (!task.position) return;

      const taskStart = timeToMinutes(task.position.startTime);
      const taskEnd = taskStart + task.duration * 15;

      // タスクが占有する各15分スロットをマップに追加
      for (let time = taskStart; time < taskEnd; time += 15) {
        const timeSlot = minutesToTime(time);
        if (!map.has(timeSlot)) {
          map.set(timeSlot, []);
        }
        map.get(timeSlot)!.push(task);
      }
    });

    return map;
  }, [timelineTasks]);

  // 特定の位置にタスクがあるかチェック
  const getTaskAtPosition = (row: number, timeSlot: string): Task | null => {
    return (
      timelineTasks.find((task) => {
        if (!task.position) return false;
        if (task.position.row !== row) return false;

        // タスクの開始時刻から終了時刻までの範囲内かチェック
        const taskStart = timeToMinutes(task.position.startTime);
        const taskEnd = taskStart + task.duration * 15;
        const slotTime = timeToMinutes(timeSlot);

        return slotTime >= taskStart && slotTime < taskEnd;
      }) || null
    );
  };
  // 特定の時間帯に重複があるかチェック（最適化版）
  const checkTimeSlotConflict = (timeSlot: string): boolean => {
    const tasksInSlot = timeSlotTaskMap.get(timeSlot) || [];
    return tasksInSlot.length > 1;
  };

  // 特定の時間帯にある全てのタスクを取得（最適化版）
  const getTasksInTimeSlot = (timeSlot: string): Task[] => {
    return timeSlotTaskMap.get(timeSlot) || [];
  };

  return (
    <div
      className="timeline"
      style={{ '--time-slots': timeSlots.length } as React.CSSProperties}
    >
      <h3>
        タイムライン ({workingHours.start} - {workingHours.end})
      </h3>

      <div className="timeline-grid">
        {/* ヘッダー行（時刻表示） */}
        <div className="timeline-header">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="timeline-time-slot-header">
              {timeSlot}
            </div>
          ))}
        </div>

        {/* タイムライン行 */}
        {Array.from({ length: timelineRows }, (_, rowIndex) => (
          <div key={rowIndex} className="timeline-row">
            {timeSlots.map((timeSlot) => {
              const taskAtPosition = getTaskAtPosition(rowIndex, timeSlot);
              const hasConflict = checkTimeSlotConflict(timeSlot);
              const isConflictSlot = hasConflict && taskAtPosition;
              const conflictingTasks = hasConflict
                ? getTasksInTimeSlot(timeSlot)
                : [];

              // 重複情報のツールチップテキストを生成
              const conflictTooltip = hasConflict
                ? `重複検出: ${conflictingTasks.map((task) => `"${task.name}" (行${task.position!.row + 1})`).join(', ')}`
                : '';

              return (
                <div
                  key={`${rowIndex}-${timeSlot}`}
                  className={`timeline-slot ${taskAtPosition ? 'occupied' : 'empty'} ${isConflictSlot ? 'conflict' : ''}`}
                  title={conflictTooltip}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rowIndex, timeSlot)}
                >
                  {taskAtPosition &&
                    timeSlot === taskAtPosition.position!.startTime && (
                      <TaskCard task={taskAtPosition} onClick={onTaskClick} />
                    )}
                  {isConflictSlot && (
                    <div className="conflict-indicator">⚠️</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
