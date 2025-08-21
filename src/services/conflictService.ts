import type { Task } from '../types';
import { timeToMinutes, formatDuration } from '../utils/timeUtils';
import { TIME_SLOT_INCREMENT_MINUTES } from '../constants';

/**
 * 重複エラーメッセージの生成サービス
 */
export class ConflictService {
  /**
   * 重複タスクの詳細な警告メッセージを生成
   * @param conflictingTasks 重複しているタスクの配列
   * @returns フォーマットされた警告メッセージ
   */
  static generateConflictMessage(
    conflictingTasks: Array<{
      task: Task;
      conflictType: string;
      overlapType: string;
    }>
  ): string {
    const conflictMessages = conflictingTasks
      .map(({ task: conflictingTask, conflictType, overlapType }) => {
        const conflictStart = conflictingTask.position!.startTime;
        const durationText = formatDuration(conflictingTask.duration);

        return `・${conflictType}: "${conflictingTask.name}" (${conflictStart}開始, ${durationText}) - ${overlapType}`;
      })
      .join('\n');

    const summary =
      conflictingTasks.length === 1
        ? '1つのタスクと重複'
        : `${conflictingTasks.length}つのタスクと重複`;

    return `タスクの時間が重複しています (${summary}):\n\n${conflictMessages}\n\n別の時間帯または行に配置してください。`;
  }

  /**
   * タイムスロットでの競合を検出
   * @param tasks 全タスクリスト
   * @param timeSlot チェックするタイムスロット
   * @returns そのタイムスロットにあるタスクの配列
   */
  static getTasksInTimeSlot(tasks: Task[], timeSlot: string): Task[] {
    const slotTime = timeToMinutes(timeSlot);

    return tasks.filter((task) => {
      if (!task.position) return false;

      const taskStart = timeToMinutes(task.position.startTime);
      const taskEnd = taskStart + task.duration * TIME_SLOT_INCREMENT_MINUTES;

      return slotTime >= taskStart && slotTime < taskEnd;
    });
  }

  /**
   * 特定のタイムスロットに複数のタスクがあるかチェック
   * @param tasks 全タスクリスト
   * @param timeSlot チェックするタイムスロット
   * @returns 競合がある場合true
   */
  static hasTimeSlotConflict(tasks: Task[], timeSlot: string): boolean {
    const tasksInSlot = this.getTasksInTimeSlot(tasks, timeSlot);
    return tasksInSlot.length > 1;
  }

  /**
   * Check if a specific task is involved in any conflicts
   * @param tasks All tasks in the timeline
   * @param targetTask The specific task to check for conflicts
   * @returns true if the target task has conflicts with other tasks
   */
  static isTaskConflicted(tasks: Task[], targetTask: Task): boolean {
    if (!targetTask.position) return false;

    const taskStart = timeToMinutes(targetTask.position.startTime);
    const taskEnd =
      taskStart + targetTask.duration * TIME_SLOT_INCREMENT_MINUTES;

    // Check if any other task overlaps with the target task
    return tasks.some((otherTask) => {
      if (otherTask.id === targetTask.id || !otherTask.position) return false;

      const otherStart = timeToMinutes(otherTask.position.startTime);
      const otherEnd =
        otherStart + otherTask.duration * TIME_SLOT_INCREMENT_MINUTES;

      // Check for any overlap between the time ranges
      return taskStart < otherEnd && taskEnd > otherStart;
    });
  }

  /**
   * 競合しているタスクのツールチップテキストを生成
   * @param tasks 全タスクリスト
   * @param timeSlot チェックするタイムスロット
   * @returns ツールチップ用のテキスト
   */
  static generateConflictTooltip(tasks: Task[], timeSlot: string): string {
    if (!this.hasTimeSlotConflict(tasks, timeSlot)) {
      return '';
    }

    const conflictingTasks = this.getTasksInTimeSlot(tasks, timeSlot);
    return `Conflict detected: ${conflictingTasks
      .map((task) => `"${task.name}" (Row ${task.position!.row + 1})`)
      .join(', ')}`;
  }
}
