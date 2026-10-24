import { describe, it, expect, vi } from 'vitest';
import { exportEventSummaryPDF } from './pdfExport';
import { PlannerEvent } from '../types/event';

// Mock jsPDF class constructor
vi.mock('jspdf', () => {
  class MockJsPDF {
    internal = {
      pageSize: {
        getWidth: () => 595.28,
        getHeight: () => 841.89,
      },
    };
    addPage = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    setTextColor = vi.fn();
    setFillColor = vi.fn();
    setDrawColor = vi.fn();
    setLineWidth = vi.fn();
    text = vi.fn();
    rect = vi.fn();
    roundedRect = vi.fn();
    line = vi.fn();
    splitTextToSize = vi.fn((text: string) => [text]);
    getTextWidth = vi.fn(() => 50);
    getNumberOfPages = vi.fn(() => 2);
    setPage = vi.fn();
    save = vi.fn();
  }

  return {
    jsPDF: MockJsPDF,
  };
});

describe('PDF Export Utility', () => {
  it('generates event summary PDF without throwing errors', () => {
    const mockEvent: PlannerEvent = {
      id: 'test-event-pdf',
      title: 'Golden Sunset Anniversary',
      type: 'custom',
      tagline: '50 years of love',
      date: '2026-10-15',
      time: '18:00',
      location: 'Grand Ballroom',
      venueName: 'The Plaza',
      targetGuestCount: 80,
      totalBudget: 25000,
      currency: '$',
      theme: 'Gold & Ivory',
      priorityFocus: 'Family toasts and slideshow',
      budgetCategories: [
        { id: 'c1', name: 'Venue', allocated: 10000, actual: 9800, color: '#f59e0b', iconName: 'Building' }
      ],
      budgetItems: [
        { id: 'b1', categoryId: 'c1', title: 'Ballroom Fee', estimatedCost: 10000, actualCost: 9800, isPaid: true }
      ],
      milestones: [
        { id: 'm1', timePhase: '1 Month Before', title: 'Confirm Guest Count', dueDate: '2026-09-15', completed: true, priority: 'high', category: 'Guests', assignee: 'Host' }
      ],
      dayOfSchedule: [
        { id: 's1', time: '18:00', title: 'Guest Arrival', durationMin: 30, location: 'Foyer', responsible: 'Coordinator', notes: 'Welcome drinks', completed: false }
      ],
      vendors: [
        { id: 'v1', name: 'Plaza Catering', category: 'Catering', status: 'confirmed', quotedPrice: 12000, finalPrice: 11500, checklist: [] }
      ],
      guests: [],
      creative: {
        themeTitle: 'Gold & Ivory',
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

    expect(() => exportEventSummaryPDF(mockEvent)).not.toThrow();
  });
});
