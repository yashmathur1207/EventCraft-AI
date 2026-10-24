import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MilestoneRadialChart } from './MilestoneRadialChart';

describe('MilestoneRadialChart Component', () => {
  it('renders without crashing and displays execution count ratio', () => {
    render(<MilestoneRadialChart completedCount={4} totalCount={6} size={180} />);
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('4/6 Done')).toBeInTheDocument();
  });

  it('handles edge case when totalCount is zero without division by zero', () => {
    render(<MilestoneRadialChart completedCount={0} totalCount={0} size={180} />);
    expect(screen.getByText('0/1 Done')).toBeInTheDocument();
  });

  it('displays interactive legend for both completed and pending segments', () => {
    render(<MilestoneRadialChart completedCount={5} totalCount={10} size={180} />);
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    expect(screen.getAllByText('(5)')).toHaveLength(2);
  });
});
