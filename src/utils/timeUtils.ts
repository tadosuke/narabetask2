/**
 * 時間関連のユーティリティ関数集
 * 時間変換、タイムスロット生成、業務時間計算などを提供
 */

import {
  TIME_SLOT_INCREMENT_MINUTES,
  MINUTES_PER_HOUR,
  TIME_STRING_PADDING_LENGTH,
} from '../constants';

/**
 * HH:MM形式の時間文字列を分単位の数値に変換
 * @param timeStr "09:30" 形式の時間文字列
 * @returns 分単位の数値（例：570分）
 * @example timeToMinutes('14:30') // returns 870
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/**
 * 分単位の数値をHH:MM形式の時間文字列に変換
 * @param minutes 分単位の数値
 * @returns HH:MM形式の時間文字列
 * @example minutesToTime(870) // returns '14:30'
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const mins = minutes % MINUTES_PER_HOUR;
  return `${hours.toString().padStart(TIME_STRING_PADDING_LENGTH, '0')}:${mins.toString().padStart(TIME_STRING_PADDING_LENGTH, '0')}`;
};

/**
 * 指定された業務時間内で15分刻みのタイムスロットを生成
 * @param startTime 開始時刻（HH:MM形式）
 * @param endTime 終了時刻（HH:MM形式）
 * @returns タイムスロットの配列
 * @example generateTimeSlots('09:00', '18:00') // returns ['09:00', '09:15', '09:30', ...]
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string
): string[] => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slots: string[] = [];

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += TIME_SLOT_INCREMENT_MINUTES
  ) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
};

/**
 * 工数（15分単位）を時間と分の文字列に変換
 * @param duration 工数（15分単位）
 * @returns 時間と分の表示文字列
 * @example formatDuration(4) // returns '1時間'
 * @example formatDuration(3) // returns '45分'
 * @example formatDuration(5) // returns '1時間15分'
 */
export const formatDuration = (duration: number): string => {
  const totalMinutes = duration * TIME_SLOT_INCREMENT_MINUTES;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours > 0 && minutes > 0) {
    return `${hours}時間${minutes}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${minutes}分`;
  }
};

/**
 * 指定された時間が業務時間内かどうかをチェック
 * @param startTime 開始時刻（HH:MM形式）
 * @param duration 工数（15分単位）
 * @param workingStart 業務開始時刻（HH:MM形式）
 * @param workingEnd 業務終了時刻（HH:MM形式）
 * @returns 業務時間内の場合true、そうでなければfalse
 */
export const isWithinWorkingHours = (
  startTime: string,
  duration: number,
  workingStart: string,
  workingEnd: string
): boolean => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration * TIME_SLOT_INCREMENT_MINUTES;
  const workStartMinutes = timeToMinutes(workingStart);
  const workEndMinutes = timeToMinutes(workingEnd);

  return startMinutes >= workStartMinutes && endMinutes <= workEndMinutes;
};
