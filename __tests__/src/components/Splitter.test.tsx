import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Splitter } from '../../../src/components/Splitter';

describe('Splitter', () => {
  it('renders horizontal splitter with correct attributes', () => {
    render(
      <Splitter
        orientation="horizontal"
        initialPosition={40}
        minPosition={20}
        maxPosition={80}
      />
    );

    const splitter = screen.getByRole('separator');
    expect(splitter).toBeInTheDocument();
    expect(splitter).toHaveAttribute('aria-orientation', 'horizontal');
    expect(splitter).toHaveAttribute('aria-valuenow', '40');
    expect(splitter).toHaveAttribute('aria-valuemin', '20');
    expect(splitter).toHaveAttribute('aria-valuemax', '80');
  });

  it('renders vertical splitter with correct attributes', () => {
    render(
      <Splitter
        orientation="vertical"
        initialPosition={50}
        minPosition={10}
        maxPosition={90}
      />
    );

    const splitter = screen.getByRole('separator');
    expect(splitter).toBeInTheDocument();
    expect(splitter).toHaveAttribute('aria-orientation', 'vertical');
    expect(splitter).toHaveAttribute('aria-valuenow', '50');
    expect(splitter).toHaveAttribute('aria-valuemin', '10');
    expect(splitter).toHaveAttribute('aria-valuemax', '90');
  });

  it('has correct CSS classes for horizontal orientation', () => {
    render(<Splitter orientation="horizontal" />);

    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveClass('splitter');
    expect(splitter).toHaveClass('splitter-horizontal');
  });

  it('has correct CSS classes for vertical orientation', () => {
    render(<Splitter orientation="vertical" />);

    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveClass('splitter');
    expect(splitter).toHaveClass('splitter-vertical');
  });

  it('applies custom className', () => {
    render(<Splitter orientation="horizontal" className="custom-splitter" />);

    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveClass('custom-splitter');
  });

  it('calls onPositionChange when dragged', () => {
    const mockOnPositionChange = vi.fn();

    render(
      <div className="app-content" style={{ width: '1000px', height: '600px' }}>
        <Splitter
          orientation="horizontal"
          initialPosition={40}
          onPositionChange={mockOnPositionChange}
        />
      </div>
    );

    const splitter = screen.getByRole('separator');

    // Start dragging
    fireEvent.mouseDown(splitter);

    // Mock mouse move event
    fireEvent.mouseMove(document, { clientY: 300 });

    // End dragging
    fireEvent.mouseUp(document);

    expect(mockOnPositionChange).toHaveBeenCalled();
  });

  it('has dragging class when being dragged', () => {
    render(
      <div className="app-content" style={{ width: '1000px', height: '600px' }}>
        <Splitter orientation="horizontal" />
      </div>
    );

    const splitter = screen.getByRole('separator');

    // Should not have dragging class initially
    expect(splitter).not.toHaveClass('splitter-dragging');

    // Start dragging
    fireEvent.mouseDown(splitter);

    // Should have dragging class now
    expect(splitter).toHaveClass('splitter-dragging');

    // End dragging
    fireEvent.mouseUp(document);

    // Should not have dragging class after drag ends
    expect(splitter).not.toHaveClass('splitter-dragging');
  });

  it('renders splitter handle with dots for horizontal orientation', () => {
    render(<Splitter orientation="horizontal" />);

    const handle = screen
      .getByRole('separator')
      .querySelector('.splitter-handle');
    expect(handle).toBeInTheDocument();

    const dotsContainer = handle?.querySelector('.splitter-dots-horizontal');
    expect(dotsContainer).toBeInTheDocument();

    const dots = handle?.querySelectorAll('.splitter-dot');
    expect(dots).toHaveLength(3);
  });

  it('renders splitter handle with dots for vertical orientation', () => {
    render(<Splitter orientation="vertical" />);

    const handle = screen
      .getByRole('separator')
      .querySelector('.splitter-handle');
    expect(handle).toBeInTheDocument();

    const dotsContainer = handle?.querySelector('.splitter-dots-vertical');
    expect(dotsContainer).toBeInTheDocument();

    const dots = handle?.querySelectorAll('.splitter-dot');
    expect(dots).toHaveLength(3);
  });

  it('has correct default values', () => {
    render(<Splitter orientation="horizontal" />);

    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveAttribute('aria-valuenow', '50'); // Default initialPosition
    expect(splitter).toHaveAttribute('aria-valuemin', '10'); // Default minPosition
    expect(splitter).toHaveAttribute('aria-valuemax', '90'); // Default maxPosition
  });

  it('is focusable', () => {
    render(<Splitter orientation="horizontal" />);

    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveAttribute('tabIndex', '0');

    splitter.focus();
    expect(document.activeElement).toBe(splitter);
  });
});
