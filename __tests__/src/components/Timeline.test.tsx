import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from '../../../src/components/Timeline';
import type { Task, WorkingHours } from '../../../src/types';

// モックデータ定義
const mockWorkingHours: WorkingHours = {
  start: '09:00',
  end: '12:00', // 3時間 = 12スロット（15分刻み）
};

const mockWorkingHoursLong: WorkingHours = {
  start: '08:00',
  end: '18:00', // 10時間
};

const mockTaskInTimeline: Task = {
  id: 'task-1',
  name: '配置済みタスク',
  duration: 2, // 30分
  position: {
    row: 0,
    startTime: '09:00',
  },
};

const mockTaskInPool: Task = {
  id: 'task-2',
  name: '未配置タスク',
  duration: 1, // 15分
  position: null,
};

describe('Timeline コンポーネント', () => {
  describe('基本レンダリング', () => {
    it('コンポーネントが正しくレンダリングされることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText(/タイムライン/)).toBeDefined();
    });

    it('勤務時間が正しく表示されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('タイムライン (09:00 - 12:00)')).toBeDefined();
    });

    it('タイムラインの基本構造が存在することを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timeline = document.querySelector('.timeline');
      const timelineGrid = document.querySelector('.timeline-grid');
      const header = document.querySelector('.timeline-header');

      expect(timeline).toBeDefined();
      expect(timelineGrid).toBeDefined();
      expect(header).toBeDefined();
    });
  });

  describe('時間スロット生成とヘッダー表示', () => {
    it('15分刻みで正しく時間スロットが生成されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // 09:00-12:00 = 3時間 = 12スロット（15分刻み）
      expect(screen.getByText('09:00')).toBeDefined();
      expect(screen.getByText('09:15')).toBeDefined();
      expect(screen.getByText('09:30')).toBeDefined();
      expect(screen.getByText('09:45')).toBeDefined();
      expect(screen.getByText('10:00')).toBeDefined();
      expect(screen.getByText('11:45')).toBeDefined();

      // 12:00は終了時間なので含まれない
      expect(() => screen.getByText('12:00')).toThrow();
    });

    it('長い勤務時間でも正しくスロットが生成されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHoursLong}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('08:00')).toBeDefined();
      expect(screen.getByText('12:00')).toBeDefined();
      expect(screen.getByText('17:45')).toBeDefined();
    });
  });

  describe('タイムライン行の生成', () => {
    it('5行のタイムライン行が生成されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timelineRows = document.querySelectorAll('.timeline-row');
      expect(timelineRows.length).toBe(5);
    });

    it('タイムライン行に正しいクラス名が適用されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timelineRows = document.querySelectorAll('.timeline-row');
      expect(timelineRows.length).toBe(5);
    });
  });

  describe('タスクの表示と配置', () => {
    it('配置済みタスクが正しい位置に表示されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[mockTaskInTimeline]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('配置済みタスク')).toBeDefined();
    });

    it('未配置タスクが表示されないことを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[mockTaskInPool]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(() => screen.getByText('未配置タスク')).toThrow();
    });

    it('複数タスクが正しく表示されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const task1: Task = {
        id: 'task-multi-1',
        name: 'タスク1',
        duration: 1,
        position: { row: 0, startTime: '09:00' },
      };

      const task2: Task = {
        id: 'task-multi-2',
        name: 'タスク2',
        duration: 1,
        position: { row: 1, startTime: '09:15' },
      };

      render(
        <Timeline
          tasks={[task1, task2]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('タスク1')).toBeDefined();
      expect(screen.getByText('タスク2')).toBeDefined();
    });

    it('継続時間が複数スロットにまたがるタスクが正しく配置されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const longTask: Task = {
        id: 'long-task',
        name: '長時間タスク',
        duration: 4, // 60分 = 4スロット
        position: { row: 0, startTime: '10:00' },
      };

      render(
        <Timeline
          tasks={[longTask]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('長時間タスク')).toBeDefined();

      // タスクカードは開始時刻のスロットにのみ表示されるべき
      const taskCards = screen.getAllByText('長時間タスク');
      expect(taskCards.length).toBe(1);
    });
  });

  describe('ドラッグ&ドロップ機能', () => {
    it('ドラッグオーバー時にデフォルトが防止されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timelineSlots = document.querySelectorAll('.timeline-slot');
      const firstSlot = timelineSlots[0];

      // dataTransferプロパティを含む適切なイベントオブジェクトを作成
      const mockDataTransfer = {
        dropEffect: '',
      };

      const dragOverEvent = new Event('dragover', {
        bubbles: true,
      }) as DragEvent;
      dragOverEvent.dataTransfer = mockDataTransfer;
      dragOverEvent.preventDefault = vi.fn();

      fireEvent(firstSlot, dragOverEvent);

      // preventDefault が呼ばれることを確認
      expect(dragOverEvent.preventDefault).toHaveBeenCalled();
      // dropEffect が "move" に設定されることを確認
      expect(mockDataTransfer.dropEffect).toBe('move');
    });

    it('ドロップ時にonTaskDropが正しいパラメータで呼ばれることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timelineSlots = document.querySelectorAll('.timeline-slot');
      const firstSlot = timelineSlots[0]; // 行0, 時刻09:00のスロット

      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue('dropped-task-id'),
      };

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      Object.defineProperty(dropEvent, 'preventDefault', {
        value: vi.fn(),
        writable: false,
      });

      fireEvent(firstSlot, dropEvent);

      expect(mockDataTransfer.getData).toHaveBeenCalledWith('text/plain');
      expect(mockOnTaskDrop).toHaveBeenCalledWith(
        'dropped-task-id',
        0,
        '09:00'
      );
    });

    it('異なる行・時間へのドロップが正しく処理されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const timelineSlots = document.querySelectorAll('.timeline-slot');
      // 行2、時刻09:30のスロットを取得（概算: 2行目 * 12スロット + 2番目の時刻）
      const targetSlot = timelineSlots[2 * 12 + 2]; // 行2, 09:30

      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue('test-task-123'),
      };

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      Object.defineProperty(dropEvent, 'preventDefault', {
        value: vi.fn(),
        writable: false,
      });

      fireEvent(targetSlot, dropEvent);

      expect(mockOnTaskDrop).toHaveBeenCalledWith('test-task-123', 2, '09:30');
    });
  });

  describe('競合検知機能', () => {
    it('時間が重複するタスクがある場合に競合が検知されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      // 同じ時間帯に複数のタスクを配置
      const conflictTasks: Task[] = [
        {
          id: 'conflict-1',
          name: '競合タスク1',
          duration: 2,
          position: { row: 0, startTime: '10:00' },
        },
        {
          id: 'conflict-2',
          name: '競合タスク2',
          duration: 1,
          position: { row: 1, startTime: '10:00' }, // 同じ時刻、異なる行
        },
      ];

      render(
        <Timeline
          tasks={conflictTasks}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      // 競合インジケーターの存在確認
      const conflictIndicators = document.querySelectorAll(
        '.conflict-indicator'
      );
      expect(conflictIndicators.length).toBeGreaterThan(0);
    });

    it('競合がない場合は競合インジケーターが表示されないことを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const nonConflictTasks: Task[] = [
        {
          id: 'task-1',
          name: 'タスク1',
          duration: 1,
          position: { row: 0, startTime: '09:00' },
        },
        {
          id: 'task-2',
          name: 'タスク2',
          duration: 1,
          position: { row: 1, startTime: '09:15' }, // 異なる時刻
        },
      ];

      render(
        <Timeline
          tasks={nonConflictTasks}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const conflictIndicators = document.querySelectorAll(
        '.conflict-indicator'
      );
      expect(conflictIndicators.length).toBe(0);
    });
  });

  describe('タスククリック機能', () => {
    it('タスクカードクリック時にonTaskClickが呼ばれることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[mockTaskInTimeline]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const taskCard = screen.getByText('配置済みタスク').closest('.task-card');
      if (taskCard) {
        fireEvent.click(taskCard);
      }

      expect(mockOnTaskClick).toHaveBeenCalledWith('task-1');
    });
  });

  describe('境界値テスト', () => {
    it('空のタスク配列でもエラーが発生しないことを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      expect(() => {
        render(
          <Timeline
            tasks={[]}
            workingHours={mockWorkingHours}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });

    it('非常に短い勤務時間（1スロット）でも動作することを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const shortHours: WorkingHours = {
        start: '09:00',
        end: '09:15', // 15分のみ
      };

      render(
        <Timeline
          tasks={[]}
          workingHours={shortHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      expect(screen.getByText('09:00')).toBeDefined();
      expect(() => screen.getByText('09:15')).toThrow();
    });

    it('duration が0のタスクでもエラーが発生しないことを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const zeroTask: Task = {
        id: 'zero-task',
        name: '0分タスク',
        duration: 0,
        position: { row: 0, startTime: '09:00' },
      };

      expect(() => {
        render(
          <Timeline
            tasks={[zeroTask]}
            workingHours={mockWorkingHours}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });

    it('勤務時間外のタスクでもエラーが発生しないことを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const outsideTask: Task = {
        id: 'outside-task',
        name: '時間外タスク',
        duration: 1,
        position: { row: 0, startTime: '08:00' }, // 勤務開始前
      };

      expect(() => {
        render(
          <Timeline
            tasks={[outsideTask]}
            workingHours={mockWorkingHours}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });

    it('非常に長いdurationのタスクでも処理できることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const longTask: Task = {
        id: 'very-long-task',
        name: '超長時間タスク',
        duration: 100, // 25時間相当
        position: { row: 0, startTime: '09:00' },
      };

      expect(() => {
        render(
          <Timeline
            tasks={[longTask]}
            workingHours={mockWorkingHours}
            onTaskClick={mockOnTaskClick}
            onTaskDrop={mockOnTaskDrop}
          />
        );
      }).not.toThrow();
    });
  });

  describe('CSS クラスの適用', () => {
    it('空のスロットに正しいクラスが適用されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const emptySlots = document.querySelectorAll('.timeline-slot.empty');
      expect(emptySlots.length).toBeGreaterThan(0);
    });

    it('占有されたスロットに正しいクラスが適用されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      render(
        <Timeline
          tasks={[mockTaskInTimeline]}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const occupiedSlots = document.querySelectorAll(
        '.timeline-slot.occupied'
      );
      expect(occupiedSlots.length).toBeGreaterThan(0);
    });

    it('競合スロットに conflict クラスが適用されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      const conflictTasks: Task[] = [
        {
          id: 'conflict-a',
          name: '競合A',
          duration: 1,
          position: { row: 0, startTime: '10:00' },
        },
        {
          id: 'conflict-b',
          name: '競合B',
          duration: 1,
          position: { row: 1, startTime: '10:00' },
        },
      ];

      render(
        <Timeline
          tasks={conflictTasks}
          workingHours={mockWorkingHours}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const conflictSlots = document.querySelectorAll(
        '.timeline-slot.conflict'
      );
      expect(conflictSlots.length).toBeGreaterThan(0);
    });
  });

  describe('パフォーマンス最適化', () => {
    it('大量のタスクでも性能が維持されることを確認', () => {
      const mockOnTaskClick = vi.fn();
      const mockOnTaskDrop = vi.fn();

      // 大量のタスクを生成
      const manyTasks: Task[] = [];
      for (let i = 0; i < 100; i++) {
        manyTasks.push({
          id: `task-${i}`,
          name: `タスク ${i}`,
          duration: 1,
          position: {
            row: i % 5,
            startTime: `${9 + Math.floor(i / 20)}:${(i % 4) * 15}`.padStart(
              5,
              '0'
            ),
          },
        });
      }

      const startTime = performance.now();

      render(
        <Timeline
          tasks={manyTasks}
          workingHours={mockWorkingHoursLong}
          onTaskClick={mockOnTaskClick}
          onTaskDrop={mockOnTaskDrop}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // レンダリング時間が1秒以下であることを確認（パフォーマンス要件）
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
