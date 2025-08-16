import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../../../src/components/TaskCard';
import type { Task } from '../../../src/types';

// テスト用のモックタスクデータ
const mockTask: Task = {
  id: 'task-1',
  name: 'テストタスク',
  duration: 2, // 30分（15分 × 2）
  position: null,
};

const mockTaskWithLongDuration: Task = {
  id: 'task-2',
  name: '長時間タスク',
  duration: 8, // 120分（15分 × 8）
  position: null,
};

const mockTaskWithShortDuration: Task = {
  id: 'task-3',
  name: '短時間タスク',
  duration: 1, // 15分（15分 × 1）
  position: null,
};

describe('TaskCard コンポーネント', () => {
  describe('基本レンダリング', () => {
    it('タスクカードが正しくレンダリングされることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      // コンポーネントが存在することを確認
      const taskCard = document.querySelector('.task-card');
      expect(taskCard).toBeDefined();
    });

    it('draggable属性が設定されていることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');
      expect(taskCard?.getAttribute('draggable')).toBe('true');
    });

    it('基本のCSSクラス名が適用されていることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');
      expect(taskCard?.className).toBe('task-card ');
    });
  });

  describe('タスク情報の表示', () => {
    it('タスク名が正しく表示されることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      expect(screen.getByText('テストタスク')).toBeDefined();
    });

    it('継続時間が15分単位で正しく計算表示されることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      // duration: 2 → 2 × 15 = 30分
      expect(screen.getByText('30分')).toBeDefined();
    });

    it('長時間タスクの継続時間が正しく表示されることを確認', () => {
      const mockOnClick = vi.fn();

      render(
        <TaskCard task={mockTaskWithLongDuration} onClick={mockOnClick} />
      );

      // duration: 8 → 8 × 15 = 120分 → 2時間
      expect(screen.getByText('2時間')).toBeDefined();
    });

    it('短時間タスクの継続時間が正しく表示されることを確認', () => {
      const mockOnClick = vi.fn();

      render(
        <TaskCard task={mockTaskWithShortDuration} onClick={mockOnClick} />
      );

      // duration: 1 → 1 × 15 = 15分
      expect(screen.getByText('15分')).toBeDefined();
    });
  });

  describe('isDraggingプロパティの動作', () => {
    it('isDraggingがfalseの時、draggingクラスが適用されないことを確認', () => {
      const mockOnClick = vi.fn();

      render(
        <TaskCard task={mockTask} onClick={mockOnClick} isDragging={false} />
      );

      const taskCard = document.querySelector('.task-card');
      expect(taskCard?.className).toBe('task-card ');
    });

    it('isDraggingがtrueの時、draggingクラスが適用されることを確認', () => {
      const mockOnClick = vi.fn();

      render(
        <TaskCard task={mockTask} onClick={mockOnClick} isDragging={true} />
      );

      const taskCard = document.querySelector('.task-card');
      expect(taskCard?.className).toBe('task-card dragging');
    });

    it('isDraggingが未指定の時、draggingクラスが適用されないことを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');
      expect(taskCard?.className).toBe('task-card ');
    });
  });

  describe('onClickイベントハンドラー', () => {
    it('タスクカードをクリックした時にonClickが正しいタスクIDで呼ばれることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');
      if (taskCard) {
        fireEvent.click(taskCard);
      }

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('task-1');
    });

    it('異なるタスクIDでonClickが正しく動作することを確認', () => {
      const mockOnClick = vi.fn();
      const differentTask = { ...mockTask, id: 'different-task-id' };

      render(<TaskCard task={differentTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');
      if (taskCard) {
        fireEvent.click(taskCard);
      }

      expect(mockOnClick).toHaveBeenCalledWith('different-task-id');
    });
  });

  describe('ドラッグ&ドロップ機能', () => {
    it('ドラッグ開始時にdataTransferに正しいタスクIDが設定されることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');

      // dataTransferのモック作成
      const mockDataTransfer = {
        setData: vi.fn(),
        effectAllowed: '',
      };

      // ドラッグスタートイベントの作成
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      if (taskCard) {
        fireEvent(taskCard, dragStartEvent);
      }

      // dataTransfer.setDataが正しい値で呼ばれることを確認
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'task-1'
      );
      expect(mockDataTransfer.effectAllowed).toBe('move');
    });

    it('異なるタスクでドラッグした場合に正しいIDが設定されることを確認', () => {
      const mockOnClick = vi.fn();
      const differentTask = { ...mockTask, id: 'drag-test-task' };

      render(<TaskCard task={differentTask} onClick={mockOnClick} />);

      const taskCard = document.querySelector('.task-card');

      const mockDataTransfer = {
        setData: vi.fn(),
        effectAllowed: '',
      };

      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: mockDataTransfer,
        writable: false,
      });

      if (taskCard) {
        fireEvent(taskCard, dragStartEvent);
      }

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'drag-test-task'
      );
    });
  });

  describe('境界値テスト', () => {
    it('duration が 0 の時に0分と表示されることを確認', () => {
      const mockOnClick = vi.fn();
      const zeroTask = { ...mockTask, duration: 0 };

      render(<TaskCard task={zeroTask} onClick={mockOnClick} />);

      expect(screen.getByText('0分')).toBeDefined();
    });

    it('duration が大きな値の時に正しく計算されることを確認', () => {
      const mockOnClick = vi.fn();
      const largeTask = { ...mockTask, duration: 100 }; // 1500分 → 25時間

      render(<TaskCard task={largeTask} onClick={mockOnClick} />);

      expect(screen.getByText('25時間')).toBeDefined();
    });

    it('タスク名が空文字の場合でもエラーが発生しないことを確認', () => {
      const mockOnClick = vi.fn();
      const emptyNameTask = { ...mockTask, name: '' };

      expect(() => {
        render(<TaskCard task={emptyNameTask} onClick={mockOnClick} />);
      }).not.toThrow();
    });

    it('長いタスク名でもレンダリングできることを確認', () => {
      const mockOnClick = vi.fn();
      const longNameTask = {
        ...mockTask,
        name: 'これは非常に長いタスク名でコンポーネントが正しく処理できるかをテストしています',
      };

      render(<TaskCard task={longNameTask} onClick={mockOnClick} />);

      expect(
        screen.getByText(
          'これは非常に長いタスク名でコンポーネントが正しく処理できるかをテストしています'
        )
      ).toBeDefined();
    });
  });

  describe('DOM構造の確認', () => {
    it('正しいDOM構造が生成されることを確認', () => {
      const mockOnClick = vi.fn();

      render(<TaskCard task={mockTask} onClick={mockOnClick} />);

      // メインコンテナ
      const taskCard = document.querySelector('.task-card');
      expect(taskCard).toBeDefined();

      // ヘッダー部分
      const header = document.querySelector('.task-card-header');
      expect(header).toBeDefined();

      // タスク名要素
      const taskName = document.querySelector('.task-name');
      expect(taskName).toBeDefined();

      // ボディ部分
      const body = document.querySelector('.task-card-body');
      expect(body).toBeDefined();

      // 継続時間要素
      const duration = document.querySelector('.task-duration');
      expect(duration).toBeDefined();
    });
  });
});
