import { PlannerEvent } from '../types/event';
import { formatCurrency, formatDate } from './formatters';

/**
 * Generates and downloads a clean, printable PDF report containing:
 * 1. Event Executive Overview (Date, Venue, Target Guest Count, Key Theme)
 * 2. Budget Summary (Total, Actual Spent, Remaining, Category & Itemized breakdowns)
 * 3. Complete Event Timeline (Strategic Milestones & Day-of Schedule)
 * 4. Vendor Partner Directory (Contacts, Statuses, Financials)
 */
export async function exportEventSummaryPDF(event: PlannerEvent): Promise<void> {
  const { jsPDF } = await import('jspdf');

  // Initialize A4 PDF in points (595.28 x 841.89 pt)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 50;

  let y = margin;

  // Helper to ensure page bounds
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > bottomLimit) {
      doc.addPage();
      y = margin + 15;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text(`${event.title} • Event Summary Report`, margin, 28);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), pageWidth - margin, 28, { align: 'right' });
    doc.setDrawColor(225, 230, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
  };

  // --- 1. COVER / HEADER BANNER ---
  // Top decorative color bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, y, contentWidth, 5, 'F');
  y += 18;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27); // Dark slate
  const titleLines = doc.splitTextToSize(event.title, contentWidth - 120);
  doc.text(titleLines, margin, y);

  // Status pill / Date badge on right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('OFFICIAL SUMMARY', pageWidth - margin, y - 4, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, pageWidth - margin, y + 8, { align: 'right' });

  y += (titleLines.length * 24);

  // Subtitle / Tagline
  if (event.tagline || event.theme) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(82, 82, 91);
    const subLines = doc.splitTextToSize(event.tagline || event.theme, contentWidth);
    doc.text(subLines, margin, y);
    y += (subLines.length * 14) + 6;
  }

  // Event Meta Grid Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 48, 4, 4, 'FD');

  const colW = contentWidth / 4;
  const metaY = y + 16;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE & TIME', margin + 12, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatDate(event.date)}${event.time ? ` @ ${event.time}` : ''}`, margin + 12, metaY + 14);

  // Venue & Location
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VENUE / LOCATION', margin + colW + 8, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const venueText = doc.splitTextToSize(`${event.venueName || event.location || 'TBD'}`, colW - 12);
  doc.text(venueText[0] || 'TBD', margin + colW + 8, metaY + 14);

  // Guest Attendance
  const attendingGuests = event.guests.filter(g => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GUEST HEADCOUNT', margin + colW * 2 + 8, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${attendingHeadcount} Confirmed / ${event.targetGuestCount} Target`, margin + colW * 2 + 8, metaY + 14);

  // Overall Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EVENT TYPE', margin + colW * 3 + 8, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text(event.type.toUpperCase(), margin + colW * 3 + 8, metaY + 14);

  y += 62;

  // Helper to draw section title
  const drawSectionHeading = (title: string, subtitle?: string) => {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(title, margin, y);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, margin + doc.getTextWidth(title) + 12, y);
    }

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 14;
  };

  // --- 2. BUDGET SUMMARY SECTION ---
  drawSectionHeading('1. Financial & Budget Overview', 'Allocations, committed expenses, and runway');

  const totalActual = event.budgetItems.reduce((sum, b) => sum + (b.actualCost || 0), 0);
  const remaining = event.totalBudget - totalActual;
  const budgetPct = Math.round((totalActual / (event.totalBudget || 1)) * 100);

  // 3 Metric summary cards
  const cardW = (contentWidth - 24) / 3;
  checkPageBreak(55);

  const drawMetricCard = (x: number, label: string, val: string, sub: string, highlightColor?: number[]) => {
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardW, 46, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 10, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    if (highlightColor) {
      doc.setTextColor(highlightColor[0], highlightColor[1], highlightColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(val, x + 10, y + 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(sub, x + 10, y + 40);
  };

  drawMetricCard(margin, 'TOTAL BUDGET', formatCurrency(event.totalBudget, event.currency), 'Initial allocated cap');
  drawMetricCard(margin + cardW + 12, 'ACTUAL COMMITTED', formatCurrency(totalActual, event.currency), `${budgetPct}% of target limit`, [79, 70, 229]);
  drawMetricCard(margin + (cardW + 12) * 2, 'REMAINING RUNWAY', formatCurrency(remaining, event.currency), remaining >= 0 ? 'Under budget allowance' : 'Variance deficit', remaining >= 0 ? [16, 185, 129] : [225, 29, 72]);

  y += 56;

  // Category breakdown table
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Category Allocations & Variance', margin, y);
  y += 8;

  // Table header
  const renderTableHeader = (cols: { title: string; width: number; align?: 'left' | 'right' | 'center' }[]) => {
    checkPageBreak(24);
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    let curX = margin + 8;
    for (const c of cols) {
      if (c.align === 'right') {
        doc.text(c.title, curX + c.width - 16, y + 12, { align: 'right' });
      } else if (c.align === 'center') {
        doc.text(c.title, curX + c.width / 2, y + 12, { align: 'center' });
      } else {
        doc.text(c.title, curX, y + 12);
      }
      curX += c.width;
    }
    y += 18;
  };

  const budgetCols = [
    { title: 'CATEGORY', width: contentWidth * 0.35, align: 'left' as const },
    { title: 'ALLOCATED', width: contentWidth * 0.22, align: 'right' as const },
    { title: 'ACTUAL SPENT', width: contentWidth * 0.23, align: 'right' as const },
    { title: 'UTILIZATION', width: contentWidth * 0.20, align: 'right' as const }
  ];

  renderTableHeader(budgetCols);

  event.budgetCategories.forEach((cat, idx) => {
    checkPageBreak(18);
    const catActual = cat.actual || 0;
    const catAllocated = cat.allocated || 1;
    const catPct = Math.round((catActual / catAllocated) * 100);

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 17, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    let curX = margin + 8;
    // Category name
    doc.setFont('helvetica', 'bold');
    doc.text(cat.name, curX, y + 11);
    curX += budgetCols[0].width;

    // Allocated
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(cat.allocated, event.currency), curX + budgetCols[1].width - 16, y + 11, { align: 'right' });
    curX += budgetCols[1].width;

    // Actual
    doc.text(formatCurrency(catActual, event.currency), curX + budgetCols[2].width - 16, y + 11, { align: 'right' });
    curX += budgetCols[2].width;

    // Pct
    if (catPct > 100) {
      doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(`${catPct}%`, curX + budgetCols[3].width - 16, y + 11, { align: 'right' });

    y += 17;
  });

  y += 16;

  // --- 3. EVENT TIMELINE: STRATEGIC MILESTONES ---
  drawSectionHeading('2. Strategic Milestones & Roadmap', `${event.milestones.length} major deliverables`);

  const milestoneCols = [
    { title: 'PHASE & DEADLINE', width: contentWidth * 0.30, align: 'left' as const },
    { title: 'MILESTONE TITLE', width: contentWidth * 0.40, align: 'left' as const },
    { title: 'ASSIGNEE', width: contentWidth * 0.16, align: 'left' as const },
    { title: 'STATUS', width: contentWidth * 0.14, align: 'center' as const }
  ];

  renderTableHeader(milestoneCols);

  event.milestones.forEach((m, idx) => {
    checkPageBreak(20);
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 19, 'F');
    }

    let curX = margin + 8;

    // Phase & Due Date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(m.timePhase, curX, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Due: ${formatDate(m.dueDate)}`, curX, y + 18);
    curX += milestoneCols[0].width;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const titleSnippet = doc.splitTextToSize(m.title, milestoneCols[1].width - 16);
    doc.text(titleSnippet[0] || m.title, curX, y + 12);
    curX += milestoneCols[1].width;

    // Assignee
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(m.assignee || 'Unassigned', curX, y + 12);
    curX += milestoneCols[2].width;

    // Status
    if (m.completed) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLETED', curX + milestoneCols[3].width / 2, y + 12, { align: 'center' });
    } else {
      doc.setTextColor(234, 88, 12);
      doc.setFont('helvetica', 'bold');
      doc.text('PENDING', curX + milestoneCols[3].width / 2, y + 12, { align: 'center' });
    }

    y += 21;
  });

  y += 16;

  // --- 4. DAY-OF RUN-OF-SHOW SCHEDULE ---
  drawSectionHeading('3. Day-Of Run-Of-Show Schedule', `${event.dayOfSchedule.length} scheduled program cues`);

  const scheduleCols = [
    { title: 'TIME', width: contentWidth * 0.16, align: 'left' as const },
    { title: 'ACTIVITY & DESCRIPTION', width: contentWidth * 0.44, align: 'left' as const },
    { title: 'LOCATION', width: contentWidth * 0.22, align: 'left' as const },
    { title: 'LEAD', width: contentWidth * 0.18, align: 'left' as const }
  ];

  renderTableHeader(scheduleCols);

  event.dayOfSchedule.forEach((item, idx) => {
    checkPageBreak(24);
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 23, 'F');
    }

    let curX = margin + 8;

    // Time & Duration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(item.time, curX, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${item.durationMin} mins`, curX, y + 18);
    curX += scheduleCols[0].width;

    // Activity Title & Notes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, curX, y + 10);
    if (item.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const noteLine = doc.splitTextToSize(item.notes, scheduleCols[1].width - 16);
      doc.text(noteLine[0] || '', curX, y + 18);
    }
    curX += scheduleCols[1].width;

    // Location
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(item.location || 'Main Venue', curX, y + 13);
    curX += scheduleCols[2].width;

    // Responsible Lead
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.responsible || 'Coordinator', curX, y + 13);

    y += 24;
  });

  y += 16;

  // --- 5. VENDOR DIRECTORY ---
  drawSectionHeading('4. Vendor Partner Directory & Contracts', `${event.vendors.length} vendors managed`);

  const vendorCols = [
    { title: 'VENDOR / CATEGORY', width: contentWidth * 0.32, align: 'left' as const },
    { title: 'CONTACT DETAILS', width: contentWidth * 0.30, align: 'left' as const },
    { title: 'STATUS', width: contentWidth * 0.20, align: 'left' as const },
    { title: 'AMOUNT', width: contentWidth * 0.18, align: 'right' as const }
  ];

  renderTableHeader(vendorCols);

  event.vendors.forEach((v, idx) => {
    checkPageBreak(25);
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 24, 'F');
    }

    let curX = margin + 8;

    // Vendor Name & Category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(v.name, curX, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(v.category, curX, y + 18);
    curX += vendorCols[0].width;

    // Contact
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const contactLine1 = v.contactPerson || 'Contact Pending';
    const contactLine2 = v.email || v.phone || 'No direct phone/email';
    doc.text(contactLine1, curX, y + 10);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(contactLine2, curX, y + 18);
    curX += vendorCols[1].width;

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const formattedStatus = v.status.replace('_', ' ').toUpperCase();
    if (v.status === 'confirmed' || v.status === 'contract_signed') {
      doc.setTextColor(16, 185, 129); // emerald
    } else if (v.status === 'proposal_received' || v.status === 'contacted') {
      doc.setTextColor(217, 119, 6); // amber
    } else {
      doc.setTextColor(100, 116, 139); // slate
    }
    doc.text(formattedStatus, curX, y + 13);
    curX += vendorCols[2].width;

    // Price
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const cost = v.finalPrice || v.quotedPrice || 0;
    doc.text(formatCurrency(cost, event.currency), curX + vendorCols[3].width - 16, y + 13, { align: 'right' });

    y += 25;
  });

  // --- RUNNING FOOTERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

    doc.text(`EventFlow AI Planner • Confidential Event Brief`, margin, pageHeight - 16);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 16, { align: 'right' });
  }

  // Sanitize filename and save directly
  const safeTitle = (event.title || 'Event')
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  
  doc.save(`${safeTitle}_Summary.pdf`);
}
