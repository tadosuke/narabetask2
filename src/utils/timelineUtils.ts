import type { Task } from '../types';
import { timeToMinutes } from './timeUtils';
import {
  TIME_SLOT_INCREMENT_MINUTES,
  MINUTES_PER_HOUR,
  TIME_STRING_PADDING_LENGTH,
} from '../constants';

/**
 * タイムライン関連のユーティリティ関数集
 */
export class TimelineUtils {
  /**
   * 指定された位置（行・時刻）にあるタスクを検索
   * @param tasks タスクリスト
   * @param row 行番号
   * @param timeSlot 時刻（HH:MM形式）
   * @returns 該当位置のタスク、なければnull
   */
  static getTaskAtPosition(
    tasks: Task[],
    row: number,
    timeSlot: string
  ): Task | null {
    return (
      tasks.find((task) => {
        if (!task.position) return false;
        if (task.position.row !== row) return false;

        // タスクの時間範囲内かチェック
        const taskStart = timeToMinutes(task.position.startTime);
        const taskEnd = taskStart + task.duration * TIME_SLOT_INCREMENT_MINUTES;
        const slotTime = timeToMinutes(timeSlot);

        return slotTime >= taskStart && slotTime < taskEnd;
      }) || null
    );
  }

  /**
   * タスクが開始時刻のスロットかどうかを判定
   * @param task チェックするタスク
   * @param timeSlot 時刻（HH:MM形式）
   * @returns 開始時刻の場合true
   */
  static isTaskStartSlot(task: Task, timeSlot: string): boolean {
    return task.position?.startTime === timeSlot;
  }

  /**
   * タイムスロットのマップを作成（パフォーマンス最適化用）
   * @param tasks タスクリスト
   * @returns タイムスロットとタスクのマップ
   */
  static createTimeSlotTaskMap(tasks: Task[]): Map<string, Task[]> {
    const map = new Map<string, Task[]>();

    tasks
      .filter((task) => task.position !== null)
      .forEach((task) => {
        if (!task.position) return;

        const taskStart = timeToMinutes(task.position.startTime);
        const taskEnd = taskStart + task.duration * TIME_SLOT_INCREMENT_MINUTES;

        // タスクが占有する各15分スロットに追加
        for (
          let time = taskStart;
          time < taskEnd;
          time += TIME_SLOT_INCREMENT_MINUTES
        ) {
          const timeSlot = this.minutesToTime(time);
          if (!map.has(timeSlot)) {
            map.set(timeSlot, []);
          }
          map.get(timeSlot)!.push(task);
        }
      });

    return map;
  }

  /**
   * 分を時刻文字列に変換（内部ヘルパー）
   */
  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const mins = minutes % MINUTES_PER_HOUR;
    return `${hours.toString().padStart(TIME_STRING_PADDING_LENGTH, '0')}:${mins.toString().padStart(TIME_STRING_PADDING_LENGTH, '0')}`;
  }
}
