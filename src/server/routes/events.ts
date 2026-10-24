import { Router, Request, Response } from 'express';
import { INITIAL_EVENTS } from '../../data/mockEvents';
import { PlannerEvent, ActivityLog } from '../../types/event';

export const eventsRouter = Router();

// In-memory persistent data store seeded with initial demo events
export let eventsStore: PlannerEvent[] = [...INITIAL_EVENTS];

// Real-time SSE subscribers by eventId
const sseClientsByEvent = new Map<string, Set<Response>>();

/**
 * Broadcast an event update to all connected SSE clients for a specific eventId.
 * Automatically evicts stale or closed sockets to ensure zero memory leaks.
 */
export function broadcastToEvent(eventId: string, data: unknown): void {
  const clients = sseClientsByEvent.get(eventId);
  if (!clients || clients.size === 0) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }

  if (clients.size === 0) {
    sseClientsByEvent.delete(eventId);
  }
}

// ----------------------------------------------------
// Event CRUD & Coordination Endpoints
// ----------------------------------------------------

// List all events with summary metrics
eventsRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    events: eventsStore.map(evt => ({
      id: evt.id,
      title: evt.title,
      type: evt.type,
      tagline: evt.tagline,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      venueName: evt.venueName,
      targetGuestCount: evt.targetGuestCount,
      totalBudget: evt.totalBudget,
      currency: evt.currency,
      coverImage: evt.coverImage,
      guestCount: evt.guests.length,
      attendingCount: evt.guests.filter(g => g.rsvpStatus === 'attending').length,
      totalSpent: evt.budgetItems.reduce((acc, item) => acc + (item.actualCost || item.estimatedCost), 0),
      milestoneTotal: evt.milestones.length,
      milestonesCompleted: evt.milestones.filter(m => m.completed).length,
      updatedAt: evt.updatedAt
    }))
  });
});

// Get single event
eventsRouter.get('/:id', (req: Request, res: Response) => {
  const event = eventsStore.find(e => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }
  res.json({ success: true, event });
});

// Create new event
eventsRouter.post('/', (req: Request, res: Response) => {
  const newEvent: PlannerEvent = {
    ...req.body,
    id: req.body.id || `evt-${Date.now()}`,
    updatedAt: new Date().toISOString()
  };
  eventsStore.unshift(newEvent);
  res.status(201).json({ success: true, event: newEvent });
});

// Update event & broadcast to collaborators
eventsRouter.put('/:id', (req: Request, res: Response) => {
  const idx = eventsStore.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }
  const updatedEvent: PlannerEvent = {
    ...eventsStore[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  eventsStore[idx] = updatedEvent;

  broadcastToEvent(req.params.id, {
    type: 'EVENT_UPDATED',
    event: updatedEvent,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, event: updatedEvent });
});

// Delete event
eventsRouter.delete('/:id', (req: Request, res: Response) => {
  const idx = eventsStore.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }
  eventsStore.splice(idx, 1);
  res.json({ success: true });
});

// Guest RSVP submission (collaborative guest coordination)
eventsRouter.post('/:id/rsvps', (req: Request, res: Response) => {
  const event = eventsStore.find(e => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }

  const { name, email, rsvpStatus, plusOnes, dietary, songRequest, notes } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Name is required' });
    return;
  }

  const existingGuestIdx = event.guests.findIndex(
    g => (email && g.email && g.email.toLowerCase() === email.toLowerCase()) || g.name.toLowerCase() === name.toLowerCase()
  );

  let guestItem;
  if (existingGuestIdx >= 0) {
    guestItem = {
      ...event.guests[existingGuestIdx],
      rsvpStatus: rsvpStatus || event.guests[existingGuestIdx].rsvpStatus,
      plusOnes: plusOnes !== undefined ? Number(plusOnes) : event.guests[existingGuestIdx].plusOnes,
      dietary: dietary || event.guests[existingGuestIdx].dietary,
      songRequest: songRequest || event.guests[existingGuestIdx].songRequest,
      notes: notes || event.guests[existingGuestIdx].notes
    };
    event.guests[existingGuestIdx] = guestItem;
  } else {
    guestItem = {
      id: `g-${Date.now()}`,
      name,
      email: email || '',
      group: 'Friends' as const,
      rsvpStatus: rsvpStatus || 'attending',
      plusOnes: Number(plusOnes) || 0,
      dietary: dietary || 'None',
      songRequest: songRequest || '',
      checkedIn: false,
      notes: notes || ''
    };
    event.guests.push(guestItem);
  }

  const activityLog: ActivityLog = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    author: name,
    role: 'Guest',
    action: `RSVP ${rsvpStatus === 'attending' ? 'Confirmed (Attending)' : rsvpStatus === 'declined' ? 'Declined' : 'Pending'}${dietary ? ` - Meal: ${dietary}` : ''}`,
    type: 'guest'
  };

  event.activityFeed.unshift(activityLog);
  if (event.activityFeed.length > 50) event.activityFeed.pop();
  event.updatedAt = new Date().toISOString();

  broadcastToEvent(req.params.id, {
    type: 'GUEST_RSVP_RECEIVED',
    guest: guestItem,
    activity: activityLog,
    event
  });

  res.json({ success: true, guest: guestItem, event });
});

// Real-time vendor update submission
eventsRouter.post('/:id/vendor-updates', (req: Request, res: Response) => {
  const event = eventsStore.find(e => e.id === req.params.id);
  if (!event) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }

  const { vendorId, status, quotedPrice, finalPrice, updateNote, checklistItemId, checkState } = req.body;
  const vendor = event.vendors.find(v => v.id === vendorId);
  if (!vendor) {
    res.status(404).json({ success: false, error: 'Vendor not found' });
    return;
  }

  if (status) vendor.status = status;
  if (quotedPrice !== undefined) vendor.quotedPrice = Number(quotedPrice);
  if (finalPrice !== undefined) vendor.finalPrice = Number(finalPrice);
  if (updateNote) {
    vendor.lastUpdate = `Just now - ${updateNote}`;
  }

  if (checklistItemId && checkState !== undefined) {
    const item = vendor.checklist.find(c => c.id === checklistItemId);
    if (item) item.done = checkState;
  }

  const activityLog: ActivityLog = {
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
    author: vendor.name,
    role: 'Vendor',
    action: updateNote || `Updated status to ${vendor.status.replace('_', ' ')}`,
    type: 'vendor'
  };

  event.activityFeed.unshift(activityLog);
  if (event.activityFeed.length > 50) event.activityFeed.pop();
  event.updatedAt = new Date().toISOString();

  broadcastToEvent(req.params.id, {
    type: 'VENDOR_UPDATED',
    vendor,
    activity: activityLog,
    event
  });

  res.json({ success: true, vendor, event });
});

// Real-time SSE stream with automatic resource cleanup
eventsRouter.get('/:id/stream', (req: Request, res: Response) => {
  const eventId = req.params.id;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', eventId })}\n\n`);

  if (!sseClientsByEvent.has(eventId)) {
    sseClientsByEvent.set(eventId, new Set());
  }
  const clients = sseClientsByEvent.get(eventId)!;
  clients.add(res);

  const keepAliveTimer = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(keepAliveTimer);
      clients.delete(res);
      if (clients.size === 0) {
        sseClientsByEvent.delete(eventId);
      }
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    clients.delete(res);
    // Memory leak protection: clean up empty sets
    if (clients.size === 0) {
      sseClientsByEvent.delete(eventId);
    }
  });
});
