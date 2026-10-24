export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0
  })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getDaysRemaining(dateStr: string): { days: number; isPast: boolean; text: string } {
  if (!dateStr) return { days: 0, isPast: false, text: 'Date TBD' };
  try {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { days: Math.abs(days), isPast: true, text: `${Math.abs(days)} days ago` };
    }
    if (days === 0) {
      return { days: 0, isPast: false, text: 'Today!' };
    }
    return { days, isPast: false, text: `${days} days to go` };
  } catch {
    return { days: 0, isPast: false, text: 'Date TBD' };
  }
}

export function calculateReadinessScore(event: {
  milestones: { completed: boolean }[];
  budgetItems: { actualCost: number }[];
  vendors: { status: string }[];
  guests: { rsvpStatus: string }[];
}): number {
  if (!event) return 0;
  
  // Milestone progress: 35%
  const totalM = event.milestones.length || 1;
  const compM = event.milestones.filter(m => m.completed).length;
  const milestoneScore = (compM / totalM) * 35;

  // Vendors confirmed/signed: 30%
  const totalV = event.vendors.length || 1;
  const confirmedV = event.vendors.filter(v => v.status === 'confirmed' || v.status === 'contract_signed').length;
  const vendorScore = (confirmedV / totalV) * 30;

  // RSVP response rate: 20%
  const totalG = event.guests.length || 1;
  const answeredG = event.guests.filter(g => g.rsvpStatus !== 'pending').length;
  const rsvpScore = (answeredG / totalG) * 20;

  // Budget items tracked: 15%
  const totalB = event.budgetItems.length || 1;
  const trackedB = event.budgetItems.filter(b => b.actualCost > 0).length;
  const budgetScore = (trackedB / totalB) * 15;

  return Math.min(100, Math.round(milestoneScore + vendorScore + rsvpScore + budgetScore));
}
