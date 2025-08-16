import type { Task } from '../types';
import { timeToMinutes } from '../utils/timeUtils';

/**
 * タスク重複検出の詳細結果
 */
export interface ConflictResult {
  hasConflict: boolean;
  conflictingTasks: Array<{
    task: Task;
    conflictType: string;
    overlapType: string;
  }>;
}

/**
 * タスク管理に関するビジネスロジックを提供するサービス
 */
export class TaskService {
  /**
   * 新しいタスクを作成
   * @param existingTasks 既存のタスクリスト（連番生成のため）
   * @returns 新しく作成されたタスク
   */
  static createNewTask(existingTasks: Task[]): Task {
    return {
      id: `task-${Date.now()}`,
      name: `タスク ${existingTasks.length + 1}`,
      duration: 2, // デフォルト30分（15分単位で2 = 30分）
      position: null, // タスク置き場に配置（タイムライン上ではない）
    };
  }

  /**
   * タスクリストを更新（特定のタスクを新しい情報で置き換え）
   * @param tasks 既存のタスクリスト
   * @param updatedTask 更新されたタスク
   * @returns 更新後のタスクリスト
   */
  static updateTaskInList(tasks: Task[], updatedTask: Task): Task[] {
    return tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
  }

  /**
   * タスクリストから指定されたタスクを削除
   * @param tasks 既存のタスクリスト
   * @param taskId 削除するタスクのID
   * @returns 削除後のタスクリスト
   */
  static deleteTaskFromList(tasks: Task[], taskId: string): Task[] {
    return tasks.filter((task) => task.id !== taskId);
  }

  /**
   * タスクをタイムライン上に配置
   * @param tasks 既存のタスクリスト
   * @param taskId 配置するタスクのID
   * @param row 配置先の行
   * @param startTime 開始時刻
   * @returns 更新後のタスクリスト
   */
  static placeTaskOnTimeline(
    tasks: Task[],
    taskId: string,
    row: number,
    startTime: string
  ): Task[] {
    return tasks.map((task) =>
      task.id === taskId ? { ...task, position: { row, startTime } } : task
    );
  }

  /**
   * タスクをタスク置き場に戻す
   * @param tasks 既存のタスクリスト
   * @param taskId 戻すタスクのID
   * @returns 更新後のタスクリスト
   */
  static returnTaskToPool(tasks: Task[], taskId: string): Task[] {
    return tasks.map((task) =>
      task.id === taskId ? { ...task, position: null } : task
    );
  }

  /**
   * 全行でのタスク重複チェック（詳細な重複情報を返す）
   * @param tasks 全タスクリスト
   * @param taskId チェック対象のタスクID
   * @param row 配置予定の行番号
   * @param startTime 開始時刻（HH:MM形式）
   * @param duration 所要時間（15分単位）
   * @returns 重複有無と詳細な重複情報
   */
  static checkTaskConflicts(
    tasks: Task[],
    taskId: string,
    row: number,
    startTime: string,
    duration: number
  ): ConflictResult {
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
  }

  /**
   * タスク置き場のタスクのみをフィルタリング
   * @param tasks 全タスクリスト
   * @returns タスク置き場のタスクのみのリスト
   */
  static getPoolTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => task.position === null);
  }

  /**
   * タイムライン上のタスクのみをフィルタリング
   * @param tasks 全タスクリスト
   * @returns タイムライン上のタスクのみのリスト
   */
  static getTimelineTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => task.position !== null);
  }

  /**
   * 指定されたIDのタスクを検索
   * @param tasks 全タスクリスト
   * @param taskId 検索するタスクのID
   * @returns 見つかったタスク、見つからない場合はnull
   */
  static findTaskById(tasks: Task[], taskId: string): Task | null {
    return tasks.find((task) => task.id === taskId) || null;
  }
}
