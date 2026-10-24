import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthViewCalendar } from './MonthViewCalendar';
import { PlannerEvent } from '../types/event';

const mockEvent: PlannerEvent = {
  id: 'test-evt-1',
  title: 'Summer Seaside Gala',
  type: 'wedding',
  tagline: 'An unforgettable evening',
  date: '2026-09-18',
  time: '17:00',
  location: 'Positano, Italy',
  venueName: 'Villa Bellisima',
  targetGuestCount: 100,
  totalBudget: 50000,
  currency: '$',
  theme: 'Mediterranean',
  priorityFocus: 'Culinary experience',
  budgetCategories: [],
  budgetItems: [
    {
      id: 'b-1',
      categoryId: 'cat-1',
      title: 'Catering Deposit',
      estimatedCost: 10000,
      actualCost: 9500,
      isPaid: true,
      dueDate: '2026-09-01'
    }
  ],
  milestones: [
    {
      id: 'm-1',
      timePhase: '1 Month Before',
      title: 'Finalize Floor Plan',
      dueDate: '2026-08-18',
      completed: true,
      priority: 'high',
      category: 'Venue',
      assignee: 'Elena'
    },
    {
      id: 'm-2',
      timePhase: 'Event Week',
      title: 'Rehearsal Dinner',
      dueDate: '2026-09-17',
      completed: false,
      priority: 'medium',
      category: 'Schedule',
      assignee: 'Julian'
    }
  ],
  dayOfSchedule: [],
  vendors: [],
  guests: [],
  creative: {
    themeTitle: '',
    vibeDescription: '',
    palette: [],
    decorConcepts: [],
    signatureItems: [],
    invitations: [],
    speeches: [],
    favorsOrActivities: []
  },
  activityFeed: [],
  updatedAt: new Date().toISOString()
};

describe('MonthViewCalendar Component', () => {
  it('renders the calendar with month title and navigation controls', () => {
    render(<MonthViewCalendar event={mockEvent} />);
    expect(screen.getByText(/Interactive Month Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/September 2026/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Previous Month/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Next Month/i)).toBeInTheDocument();
  });

  it('allows toggling between Month Grid and Agenda List views', () => {
    render(<MonthViewCalendar event={mockEvent} />);
    const agendaBtn = screen.getByRole('button', { name: /Agenda/i });
    fireEvent.click(agendaBtn);

    expect(screen.getByText(/key milestones & target dates in chronological order/i)).toBeInTheDocument();
    expect(screen.getByText('Rehearsal Dinner')).toBeInTheDocument();

    const gridBtn = screen.getByRole('button', { name: /Grid/i });
    fireEvent.click(gridBtn);
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('filters items when filter buttons are clicked', () => {
    render(<MonthViewCalendar event={mockEvent} />);
    const budgetFilter = screen.getByRole('button', { name: /Budget Payments/i });
    fireEvent.click(budgetFilter);
    expect(budgetFilter).toBeInTheDocument();
  });
});
