import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeSlot } from '../../../src/components/TimeSlot';
import type { Task } from '../../../src/types';

// Mock utility modules
vi.mock('../../../src/utils/timelineUtils', () => ({
  TimelineUtils: {
    getTaskAtPosition: vi.fn(),
    isTaskStartSlot: vi.fn(),
  },
}));

vi.mock('../../../src/services/conflictService', () => ({
  ConflictService: {
    hasTimeSlotConflict: vi.fn(),
    generateConflictTooltip: vi.fn(),
  },
}));

vi.mock('../../../src/components/TaskCard', () => ({
  TaskCard: ({
    task,
    onClick,
  }: {
    task: Task;
    onClick: (id: string) => void;
  }) => (
    <div data-testid="task-card" onClick={() => onClick(task.id)}>
      {task.name}
    </div>
  ),
}));

import { TimelineUtils } from '../../../src/utils/timelineUtils';
import { ConflictService } from '../../../src/services/conflictService';

describe('TimeSlot', () => {
  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    duration: 2,
    position: { row: 0, startTime: '09:00' },
  };

  const defaultProps = {
    tasks: [mockTask],
    timelineTasks: [mockTask],
    timeSlot: '09:00',
    rowIndex: 0,
    onTaskClick: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(null);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    expect(screen.getByTestId('time-slot')).toBeInTheDocument();
  });

  it('applies empty class when no task is at position', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(null);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    expect(slot).toHaveClass('timeline-slot', 'empty');
  });

  it('applies occupied class when task is at position', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    expect(slot).toHaveClass('timeline-slot', 'occupied');
  });

  it('applies conflict class when there is a conflict', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(true);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue(
      'Conflict tooltip'
    );

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    expect(slot).toHaveClass('timeline-slot', 'occupied', 'conflict');
  });

  it('shows conflict indicator when there is a conflict', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(true);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue(
      'Conflict tooltip'
    );

    render(<TimeSlot {...defaultProps} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders TaskCard when task is at start slot', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(TimelineUtils.isTaskStartSlot).mockReturnValue(true);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    expect(screen.getByTestId('task-card')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('does not render TaskCard when task is not at start slot', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(TimelineUtils.isTaskStartSlot).mockReturnValue(false);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
  });

  it('handles drag over events', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(null);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    fireEvent.dragOver(slot);

    expect(defaultProps.onDragOver).toHaveBeenCalled();
  });

  it('handles drop events', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(null);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    fireEvent.drop(slot);

    expect(defaultProps.onDrop).toHaveBeenCalledWith(
      expect.any(Object),
      defaultProps.rowIndex,
      defaultProps.timeSlot
    );
  });

  it('displays conflict tooltip', () => {
    const tooltipText = 'Task conflict tooltip';
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(true);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue(
      tooltipText
    );

    render(<TimeSlot {...defaultProps} />);

    const slot = screen.getByTestId('time-slot');
    expect(slot).toHaveAttribute('title', tooltipText);
  });

  it('handles task click events', () => {
    vi.mocked(TimelineUtils.getTaskAtPosition).mockReturnValue(mockTask);
    vi.mocked(TimelineUtils.isTaskStartSlot).mockReturnValue(true);
    vi.mocked(ConflictService.hasTimeSlotConflict).mockReturnValue(false);
    vi.mocked(ConflictService.generateConflictTooltip).mockReturnValue('');

    render(<TimeSlot {...defaultProps} />);

    const taskCard = screen.getByTestId('task-card');
    fireEvent.click(taskCard);

    expect(defaultProps.onTaskClick).toHaveBeenCalledWith(mockTask.id);
  });
});
