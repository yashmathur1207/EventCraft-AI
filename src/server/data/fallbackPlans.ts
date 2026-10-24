import { BudgetCategory, BudgetItem, Milestone, DayOfScheduleItem, Vendor, CreativePlan } from '../../types/event';

/**
 * Strips markdown fences (```json ... ```) and safely parses JSON responses.
 */
export function cleanAndParseJSON(rawText: string | undefined): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export interface FallbackPlanParams {
  eventType?: string;
  title?: string;
  targetGuestCount?: number;
  totalBudget?: number;
  date?: string;
  location?: string;
  themeOrVibe?: string;
  keyPriorities?: string | string[];
  specialRequirements?: string;
}

/**
 * Generates an exhaustive, production-grade fallback event plan
 * when Gemini API quotas or connectivity limits occur.
 */
export function generateFallbackPlan(params: FallbackPlanParams) {
  const type = params.eventType || 'celebration';
  const guests = params.targetGuestCount || 80;
  const budget = params.totalBudget || 15000;
  const dateStr = params.date || '2026-10-15';
  const locationStr = params.location || 'Scenic City Center';
  const themeStr = params.themeOrVibe || 'Modern, vibrant & unforgettable celebration';
  const prioritiesStr = Array.isArray(params.keyPriorities)
    ? params.keyPriorities.join(', ')
    : (params.keyPriorities || 'Exceptional hospitality, vibrant aesthetic & seamless flow');

  // Realistic budget allocation
  const venueCost = Math.round(budget * 0.32);
  const cateringCost = Math.round(budget * 0.30);
  const photoCost = Math.round(budget * 0.14);
  const decorCost = Math.round(budget * 0.12);
  const musicCost = Math.round(budget * 0.07);
  const contingencyCost = budget - (venueCost + cateringCost + photoCost + decorCost + musicCost);

  const budgetCategories: BudgetCategory[] = [
    { id: 'cat-1', name: 'Venue & Production', allocated: venueCost, actual: 0, color: '#0d9488', iconName: 'Building' },
    { id: 'cat-2', name: 'Catering & Beverages', allocated: cateringCost, actual: 0, color: '#f59e0b', iconName: 'Utensils' },
    { id: 'cat-3', name: 'Photography & Media', allocated: photoCost, actual: 0, color: '#6366f1', iconName: 'Camera' },
    { id: 'cat-4', name: 'Floral, Decor & Ambience', allocated: decorCost, actual: 0, color: '#ec4899', iconName: 'Sparkles' },
    { id: 'cat-5', name: 'Music & Entertainment', allocated: musicCost, actual: 0, color: '#8b5cf6', iconName: 'Music' },
    { id: 'cat-6', name: 'Stationery & Contingency', allocated: contingencyCost, actual: 0, color: '#10b981', iconName: 'Mail' }
  ];

  const budgetItems: BudgetItem[] = [
    { id: 'b-1', categoryId: 'cat-1', title: `Primary Venue Rental & Setup (${locationStr})`, estimatedCost: Math.round(venueCost * 0.85), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Includes load-in access and standard fixtures' },
    { id: 'b-2', categoryId: 'cat-1', title: 'Lighting & Stage Infrastructure', estimatedCost: venueCost - Math.round(venueCost * 0.85), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Warm ambient uplighting and accent wash' },
    { id: 'b-3', categoryId: 'cat-2', title: `Curated Dinner & Passed Hors d'oeuvres (${guests} guests)`, estimatedCost: Math.round(cateringCost * 0.75), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Includes dietary options and service staff' },
    { id: 'b-4', categoryId: 'cat-2', title: 'Signature Craft Cocktail & Wine Bar', estimatedCost: cateringCost - Math.round(cateringCost * 0.75), actualCost: 0, isPaid: false, dueDate: dateStr, notes: '2 custom signature drinks plus premium mixers' },
    { id: 'b-5', categoryId: 'cat-3', title: 'Full Event Photography Coverage & Retouching', estimatedCost: Math.round(photoCost * 0.75), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Coverage of highlights, candid moments, and portraits' },
    { id: 'b-6', categoryId: 'cat-3', title: 'Highlight Reel & Social Media Edit', estimatedCost: photoCost - Math.round(photoCost * 0.75), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Delivered within 7 days of event' },
    { id: 'b-7', categoryId: 'cat-4', title: 'Custom Floral Installations & Table Runners', estimatedCost: Math.round(decorCost * 0.70), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Seasonal blooms aligned with theme palette' },
    { id: 'b-8', categoryId: 'cat-4', title: 'Ambient Candle Clusters & Signage Accents', estimatedCost: decorCost - Math.round(decorCost * 0.70), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Reflective glass hurricanes and custom welcome board' },
    { id: 'b-9', categoryId: 'cat-5', title: 'Live DJ & Custom Sound System', estimatedCost: musicCost, actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Includes background audio and dance party' },
    { id: 'b-10', categoryId: 'cat-6', title: 'Printed Menus, Place Cards & Digital Invites', estimatedCost: Math.round(contingencyCost * 0.45), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Matching visual aesthetic' },
    { id: 'b-11', categoryId: 'cat-6', title: 'Emergency Reserve Buffer', estimatedCost: contingencyCost - Math.round(contingencyCost * 0.45), actualCost: 0, isPaid: false, dueDate: dateStr, notes: 'Recommended 5-10% contingency for day-of extras' }
  ];

  const milestones: Milestone[] = [
    { id: 'm-1', timePhase: '6 Months Before', title: 'Confirm Venue Contract & Event Blueprint', dueDate: dateStr, completed: true, priority: 'high', category: 'Venue', assignee: 'Lead Organizer' },
    { id: 'm-2', timePhase: '4 Months Before', title: 'Lock Catering Menu & Send Digital Save-the-Dates', dueDate: dateStr, completed: true, priority: 'high', category: 'Catering', assignee: 'Lead Organizer' },
    { id: 'm-3', timePhase: '2 Months Before', title: 'Finalize Photographer Shot-List & Musical Playlist', dueDate: dateStr, completed: false, priority: 'medium', category: 'Entertainment', assignee: 'Media Lead' },
    { id: 'm-4', timePhase: '1 Month Before', title: 'Consolidate RSVPs & Dietary Specifications', dueDate: dateStr, completed: false, priority: 'high', category: 'Guests', assignee: 'RSVP Coordinator' },
    { id: 'm-5', timePhase: 'Event Week', title: 'Final Walkthrough & Day-Of Vendor Briefing', dueDate: dateStr, completed: false, priority: 'high', category: 'Operations', assignee: 'Lead Organizer' }
  ];

  const dayOfSchedule: DayOfScheduleItem[] = [
    { id: 'sch-1', time: '01:00 PM', title: 'Venue Access & Production Load-In', durationMin: 120, location: locationStr, responsible: 'Production Team', notes: 'Stage, audio check, and lighting installation', completed: false },
    { id: 'sch-2', time: '03:00 PM', title: 'Floral Delivery & Table Setting Finalization', durationMin: 90, location: 'Main Event Space', responsible: 'Decor Specialist', notes: 'Place cards, candles, and menus placed on all tables', completed: false },
    { id: 'sch-3', time: '04:30 PM', title: 'VIP / Host Arrival & Pre-Event Photos', durationMin: 45, location: 'Lobby & Scenic Backdrop', responsible: 'Photographer', notes: 'Golden hour lighting portraits before guests arrive', completed: false },
    { id: 'sch-4', time: '05:30 PM', title: 'Guest Arrival & Welcome Cocktail Hour', durationMin: 60, location: 'Terrace / Lounge', responsible: 'Hospitality Staff', notes: 'Signature cocktails and passed appetizers served', completed: false },
    { id: 'sch-5', time: '06:30 PM', title: 'Main Program & Dinner Service', durationMin: 90, location: 'Main Dining Hall', responsible: 'Catering Lead', notes: 'Welcome toast at 06:45 PM, main courses served at 07:10 PM', completed: false },
    { id: 'sch-6', time: '08:00 PM', title: 'Toasts, Celebration Cake & Speeches', durationMin: 40, location: 'Center Stage', responsible: 'Master of Ceremonies', notes: 'Brief speeches and ceremonial toast', completed: false },
    { id: 'sch-7', time: '08:45 PM', title: 'Live Music, Dancing & Dessert Lounge', durationMin: 150, location: 'Dance Floor & Bar', responsible: 'DJ & Sound Tech', notes: 'High energy playlist transition', completed: false }
  ];

  const vendors: Vendor[] = [
    {
      id: 'v-1',
      name: `${locationStr.split(',')[0]} Hospitality Group`,
      category: 'Catering',
      status: 'confirmed',
      contactPerson: 'Executive Chef Elena Vance',
      email: 'events@epicurean-hospitality.com',
      phone: '(555) 234-5678',
      quotedPrice: cateringCost,
      checklist: [
        { id: 'c-1', text: 'Confirm final headcount 10 days in advance', done: false },
        { id: 'c-2', text: 'Review allergy and vegetarian meal allocations', done: false },
        { id: 'c-3', text: 'Approve bar glassware and signature cocktail garnishes', done: false }
      ],
      notes: 'Exceptional reviews for farm-to-table seasonal menus and flawless service cadence.'
    },
    {
      id: 'v-2',
      name: 'Lumina Creative Studio',
      category: 'Photography',
      status: 'researching',
      contactPerson: 'David Chen',
      email: 'hello@luminacreative.io',
      phone: '(555) 345-6789',
      quotedPrice: photoCost,
      checklist: [
        { id: 'c-4', text: 'Draft VIP family and key milestone shot-list', done: false },
        { id: 'c-5', text: 'Confirm venue lighting equipment permissions', done: false }
      ],
      notes: 'Specializes in cinematic documentary style with organic warm tones.'
    },
    {
      id: 'v-3',
      name: 'Aura Floral & Event Design',
      category: 'Floral & Decor',
      status: 'contacted',
      contactPerson: 'Sophia Morales',
      email: 'sophia@auraflowers.design',
      phone: '(555) 456-7890',
      quotedPrice: decorCost,
      checklist: [
        { id: 'c-6', text: 'Review sample centerpiece mockups and color swatch', done: false },
        { id: 'c-7', text: 'Schedule strike and teardown immediately post-event', done: false }
      ],
      notes: 'Eco-conscious floral installations with sustainable foam-free mechanics.'
    },
    {
      id: 'v-4',
      name: 'Prism Sound & Entertainment',
      category: 'DJ & Sound',
      status: 'researching',
      contactPerson: 'Marcus Ray',
      email: 'booking@prismsound.live',
      phone: '(555) 567-8901',
      quotedPrice: musicCost,
      checklist: [
        { id: 'c-8', text: 'Submit "Must-Play" and "Do-Not-Play" music lists', done: false },
        { id: 'c-9', text: 'Soundcheck wireless mics for toasts 2 hours before start', done: false }
      ],
      notes: 'Provides full QSC sound system and tasteful dance lighting.'
    }
  ];

  const creative: CreativePlan = {
    themeTitle: themeStr,
    vibeDescription: `A masterfully balanced celebration centered on ${themeStr}, highlighting ${prioritiesStr}.`,
    palette: [
      { name: 'Prismatic Aurora Pink', hex: '#FF007A' },
      { name: 'Warm Amber Gold', hex: '#FFD200' },
      { name: 'Electric Emerald', hex: '#00F5D4' },
      { name: 'Cosmic Indigo', hex: '#7B2CBF' }
    ],
    decorConcepts: [
      'Layered iridescent glass candle hurricanes on dining tables with warm candlelight',
      'Suspended floral cloud canopy with micro-fairy lights over the main entrance',
      'Refractive acrylic signage with hand-lettered gold foil typography'
    ],
    signatureItems: [
      {
        name: 'The Golden Spark Spritz',
        type: 'cocktail',
        description: 'Vibrant blood orange liqueur, botanical gin, and chilled prosecco crowned with edible gold flakes',
        ingredientsOrHighlights: 'Prosecco, Blood Orange, Botanical Gin, Gold Glint'
      },
      {
        name: 'Velvet Midnight Truffle Tart',
        type: 'dessert',
        description: 'Decadent Valrhona dark chocolate ganache on a hazelnut shortbread crust with sea salt caramel',
        ingredientsOrHighlights: 'Valrhona Chocolate, Salted Caramel, Gold Leaf'
      }
    ],
    invitations: [
      {
        id: 'inv-1',
        style: 'Modern Minimal',
        headline: `You're Invited to Celebrate ${params.title || 'Our Special Day'}`,
        body: `Join us for an unforgettable gathering celebrating warmth, friendship, and joy at ${locationStr}. An evening of exceptional food, craft drinks, and dancing awaits.`,
        rsvpCallout: `Kindly RSVP by ${dateStr}`
      }
    ],
    speeches: [
      {
        id: 'sp-1',
        speakerRole: 'Host / Organizer',
        title: 'Opening Welcome & Heartfelt Toast',
        estimatedDuration: '3 minutes',
        content: `Good evening everyone, and welcome! Looking around this room at all your smiling faces means the world to us. Tonight isn't just about celebrating this milestone—it's about honoring the deep bonds of community, family, and shared memories that bring us together. Thank you for traveling from near and far to make this evening truly magical. Please raise your glasses with me: to friendship, to love, and to an unforgettable night ahead!`
      }
    ],
    favorsOrActivities: [
      'Interactive Polaroid memory wall with custom rainbow iridescent washi tape and guest inscriptions',
      'Custom bottled artisanal olive oil infused with rosemary & sea salt in embossed glass vials'
    ]
  };

  return {
    tagline: `An extraordinary ${type} celebrating ${themeStr}`,
    theme: themeStr,
    priorityFocus: prioritiesStr,
    budgetCategories,
    budgetItems,
    milestones,
    dayOfSchedule,
    vendors,
    creative
  };
}
