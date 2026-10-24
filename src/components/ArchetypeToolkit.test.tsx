import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchetypeToolkit } from './ArchetypeToolkit';
import { INITIAL_EVENTS } from '../data/mockEvents';

describe('ArchetypeToolkit Component', () => {
  const mockNavigate = vi.fn();

  it('renders Wedding archetype tools including Seating Plan and Ceremony Roles', () => {
    const weddingEvent = INITIAL_EVENTS.find(e => e.type === 'wedding') || INITIAL_EVENTS[0];
    render(<ArchetypeToolkit event={weddingEvent} onNavigateTab={mockNavigate} />);

    expect(screen.getByText(/Wedding Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/Ceremony & Reception Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Seating Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Table 1: Family & Parents/i)).toBeInTheDocument();
    expect(screen.getByText(/Officiant Mateo/i)).toBeInTheDocument();
  });

  it('renders Birthday archetype tools including Surprise Cues and Arcade Hub', () => {
    const birthdayEvent = INITIAL_EVENTS.find(e => e.type === 'birthday') || INITIAL_EVENTS[1];
    render(<ArchetypeToolkit event={birthdayEvent} onNavigateTab={mockNavigate} />);

    expect(screen.getByText(/Milestone Celebration Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestone Experience & Tribute Coordinator/i)).toBeInTheDocument();
    expect(screen.getByText(/Surprise Cues/i)).toBeInTheDocument();
    expect(screen.getByText(/Childhood Montage/i)).toBeInTheDocument();
    expect(screen.getByText(/Arcade Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Street Fighter II Turbo/i)).toBeInTheDocument();
  });

  it('renders Community Festival archetype tools including City Permits and Volunteer Roster', () => {
    const communityEvent = INITIAL_EVENTS.find(e => e.type === 'community') || INITIAL_EVENTS[2];
    render(<ArchetypeToolkit event={communityEvent} onNavigateTab={mockNavigate} />);

    expect(screen.getByText(/Community Festival Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Operations & Municipal Compliance/i)).toBeInTheDocument();
    expect(screen.getByText(/City Permits/i)).toBeInTheDocument();
    expect(screen.getByText(/Park Sound Variance/i)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer Roster/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Waste/i)).toBeInTheDocument();
  });

  it('triggers navigation when clicking the primary action link', () => {
    const weddingEvent = INITIAL_EVENTS.find(e => e.type === 'wedding') || INITIAL_EVENTS[0];
    render(<ArchetypeToolkit event={weddingEvent} onNavigateTab={mockNavigate} />);

    const openBtn = screen.getByRole('button', { name: /Open Full Module/i });
    fireEvent.click(openBtn);
    expect(mockNavigate).toHaveBeenCalledWith('guests');
  });
});
