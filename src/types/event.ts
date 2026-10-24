export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  color: string;
  iconName: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  title: string;
  estimatedCost: number;
  actualCost: number;
  isPaid: boolean;
  dueDate?: string;
  notes?: string;
  vendorId?: string;
}

export interface Milestone {
  id: string;
  timePhase: string; // e.g. "6 Months Before", "1 Month Before", "Event Week"
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  assignee: string;
}

export interface DayOfScheduleItem {
  id: string;
  time: string; // e.g. "14:00" or "2:00 PM"
  title: string;
  durationMin: number;
  location: string;
  responsible: string;
  notes: string;
  completed: boolean;
  vendorAlert?: string;
}

export interface VendorChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string; // e.g. "Catering", "Photography", "Venue", "Entertainment", "Floral & Decor"
  status: 'researching' | 'contacted' | 'proposal_received' | 'contract_signed' | 'confirmed';
  contactPerson?: string;
  email?: string;
  phone?: string;
  quotedPrice?: number;
  finalPrice?: number;
  checklist: VendorChecklistItem[];
  notes?: string;
  lastUpdate?: string;
  rfpDraft?: string;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  group: 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Committee' | 'Community' | 'Other';
  rsvpStatus: 'attending' | 'declined' | 'pending';
  plusOnes: number;
  dietary?: string;
  tableNumber?: string;
  songRequest?: string;
  checkedIn: boolean;
  notes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface SignatureItem {
  name: string;
  type: 'cocktail' | 'mocktail' | 'appetizer' | 'entree' | 'dessert';
  description: string;
  ingredientsOrHighlights: string;
}

export interface InvitationDraft {
  id: string;
  style: 'Formal & Elegant' | 'Playful & Whimsical' | 'Modern Minimal' | 'Warm & Welcoming';
  headline: string;
  body: string;
  rsvpCallout: string;
}

export interface SpeechDraft {
  id: string;
  speakerRole: string; // e.g. "Best Man", "Maid of Honor", "Birthday Host", "Community Organizer"
  title: string;
  estimatedDuration: string;
  content: string;
}

export interface CreativePlan {
  themeTitle: string;
  vibeDescription: string;
  palette: ColorSwatch[];
  decorConcepts: string[];
  signatureItems: SignatureItem[];
  invitations: InvitationDraft[];
  speeches: SpeechDraft[];
  favorsOrActivities: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  author: string;
  role: 'Lead Planner' | 'Host' | 'Vendor' | 'Guest' | 'AI Assistant';
  action: string;
  type: 'guest' | 'vendor' | 'budget' | 'timeline' | 'creative' | 'ai';
}

export interface PlannerEvent {
  id: string;
  title: string;
  type: EventType;
  tagline: string;
  date: string;
  time: string;
  location: string;
  venueName: string;
  targetGuestCount: number;
  totalBudget: number;
  currency: string;
  coverImage?: string;
  theme: string;
  priorityFocus: string; // e.g. "Memorable culinary experience & great music"
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  milestones: Milestone[];
  dayOfSchedule: DayOfScheduleItem[];
  vendors: Vendor[];
  guests: Guest[];
  creative: CreativePlan;
  activityFeed: ActivityLog[];
  updatedAt: string;
}

export interface AIEventPlanRequest {
  eventType: EventType;
  title: string;
  targetGuestCount: number;
  totalBudget: number;
  date: string;
  location: string;
  themeOrVibe: string;
  keyPriorities: string[];
  specialRequirements?: string;
}
