export interface Task {
  id: string
  name: string
  duration: number // 15分単位の数値（例：1 = 15分、2 = 30分）
  position: Position | null // null の場合はタスク置き場にある
}

export interface Position {
  row: number // タイムライン上の縦の位置（0から開始）
  startTime: string // 開始時刻（例："09:00"）
}

export interface TimeSlot {
  start: string // 開始時刻（例："09:00"）
  end: string // 終了時刻（例："18:00"）
}

export interface WorkingHours {
  start: string // 業務開始時刻（例："09:00"）
  end: string // 業務終了時刻（例："18:00"）
}

export type TaskStatus = 'pool' | 'timeline'