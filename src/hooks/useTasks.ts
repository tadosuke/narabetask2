import { useState, useCallback } from 'react';
import type { Task } from '../types';
import { TaskService } from '../services/taskService';
import { ConflictService } from '../services/conflictService';
import { isWithinWorkingHours } from '../utils/timeUtils';

/**
 * タスク管理のためのカスタムフック
 * タスクの作成、更新、削除、移動などの操作を提供
 */
export const useTasks = (workingStart: string, workingEnd: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  /**
   * 新しいタスクを作成
   */
  const createTask = useCallback(() => {
    const newTask = TaskService.createNewTask(tasks);
    setTasks([...tasks, newTask]);
  }, [tasks]);

  /**
   * タスクを更新
   */
  const updateTask = useCallback(
    (updatedTask: Task) => {
      setTasks(TaskService.updateTaskInList(tasks, updatedTask));
    },
    [tasks]
  );

  /**
   * タスクを削除
   */
  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks(TaskService.deleteTaskFromList(tasks, taskId));
      setSelectedTaskId(null);
    },
    [tasks]
  );

  /**
   * タスクを選択
   */
  const selectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  /**
   * タスクをタイムラインにドロップ
   */
  const dropTaskToTimeline = useCallback(
    (taskId: string, row: number, startTime: string) => {
      const task = TaskService.findTaskById(tasks, taskId);
      if (!task) return;

      // 重複チェック
      const conflictResult = TaskService.checkTaskConflicts(
        tasks,
        taskId,
        row,
        startTime,
        task.duration
      );

      if (conflictResult.hasConflict) {
        alert(
          ConflictService.generateConflictMessage(
            conflictResult.conflictingTasks
          )
        );
        return;
      }

      // 業務時間内チェック
      if (
        !isWithinWorkingHours(
          startTime,
          task.duration,
          workingStart,
          workingEnd
        )
      ) {
        alert('業務時間外には配置できません');
        return;
      }

      setTasks(TaskService.placeTaskOnTimeline(tasks, taskId, row, startTime));
    },
    [tasks, workingStart, workingEnd]
  );

  /**
   * タスクをタスク置き場に戻す
   */
  const dropTaskToPool = useCallback(
    (taskId: string) => {
      setTasks(TaskService.returnTaskToPool(tasks, taskId));
    },
    [tasks]
  );

  // 現在選択されているタスクを取得
  const selectedTask = selectedTaskId
    ? TaskService.findTaskById(tasks, selectedTaskId)
    : null;

  return {
    tasks,
    selectedTask,
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    dropTaskToTimeline,
    dropTaskToPool,
  };
};
