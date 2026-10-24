import React, { useState, useMemo } from 'react';
import { Users, Heart, Utensils, Music, Check, Clock, XCircle, Plus, Search, Filter, Share2, Sparkles, UserCheck, Camera } from 'lucide-react';
import { PlannerEvent, Guest } from '../types/event';
import { GuestRSVPModal } from './GuestRSVPModal';
import { CameraGuestScannerModal } from './CameraGuestScannerModal';

interface GuestSectionProps {
  event: PlannerEvent;
  onUpdateEvent: (updated: PlannerEvent) => void;
}

export const GuestSection: React.FC<GuestSectionProps> = React.memo(({ event, onUpdateEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New guest form
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gGroup, setGGroup] = useState<Guest['group']>('Friends');
  const [gStatus, setGStatus] = useState<Guest['rsvpStatus']>('pending');
  const [gDietary, setGDietary] = useState('None');
  const [gPlusOnes, setGPlusOnes] = useState(0);
  const [gTable, setGTable] = useState('');

  // Stats memoized for performance
  const { attendingGuests, declinedGuests, pendingGuests, totalAttendingHeadcount, dietaryTallies } = useMemo(() => {
    const attending = event.guests.filter(g => g.rsvpStatus === 'attending');
    const declined = event.guests.filter(g => g.rsvpStatus === 'declined');
    const pending = event.guests.filter(g => g.rsvpStatus === 'pending');
    const headcount = attending.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
    const tallies = attending.reduce((acc, g) => {
      const key = g.dietary && g.dietary !== 'None' ? g.dietary : 'Standard Menu';
      acc[key] = (acc[key] || 0) + 1 + (g.plusOnes || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      attendingGuests: attending,
      declinedGuests: declined,
      pendingGuests: pending,
      totalAttendingHeadcount: headcount,
      dietaryTallies: tallies
    };
  }, [event.guests]);

  const filteredGuests = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return event.guests.filter(g => {
      const matchesSearch = !query ||
        g.name.toLowerCase().includes(query) ||
        (g.email && g.email.toLowerCase().includes(query)) ||
        (g.notes && g.notes.toLowerCase().includes(query));
      const matchesGroup = selectedGroup === 'all' || g.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [event.guests, searchTerm, selectedGroup]);

  const toggleCheckIn = (guestId: string) => {
    const updated = event.guests.map(g => {
      if (g.id === guestId) return { ...g, checkedIn: !g.checkedIn };
      return g;
    });

    onUpdateEvent({
      ...event,
      guests: updated,
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Coordinator',
          role: 'Lead Planner',
          action: `Checked in guest "${event.guests.find(g => g.id === guestId)?.name}"`,
          type: 'guest'
        },
        ...event.activityFeed
      ]
    });
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName) return;

    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      name: gName,
      email: gEmail,
      group: gGroup,
      rsvpStatus: gStatus,
      dietary: gDietary,
      plusOnes: Number(gPlusOnes),
      tableNumber: gTable || undefined,
      checkedIn: false
    };

    onUpdateEvent({
      ...event,
      guests: [...event.guests, newGuest],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Added guest "${gName}" to ${gGroup} list`,
          type: 'guest'
        },
        ...event.activityFeed
      ]
    });

    setGName('');
    setGEmail('');
    setGTable('');
    setIsAddingGuest(false);
  };

  const handleRSVPSubmitted = (newOrUpdatedGuest: Guest) => {
    const existingIdx = event.guests.findIndex(g => g.id === newOrUpdatedGuest.id || g.name === newOrUpdatedGuest.name);
    let updatedGuests;
    if (existingIdx >= 0) {
      updatedGuests = [...event.guests];
      updatedGuests[existingIdx] = newOrUpdatedGuest;
    } else {
      updatedGuests = [...event.guests, newOrUpdatedGuest];
    }
    onUpdateEvent({
      ...event,
      guests: updatedGuests
    });
  };

  const handleGuestsImportedFromCamera = (newGuests: Guest[]) => {
    onUpdateEvent({
      ...event,
      guests: [...event.guests, ...newGuests],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'AI Camera OCR',
          role: 'AI Assistant',
          action: `Captured and automatically parsed ${newGuests.length} guests from photo / contact sheet.`,
          type: 'ai'
        },
        ...event.activityFeed
      ]
    });
  };

  const copyGuestPortalLink = () => {
    const url = `${window.location.origin}/#guest-portal-${event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF007A]/20 via-[#FF5E3A]/20 to-[#FFD200]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-pink-300 text-xs font-semibold backdrop-blur-md">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>Guest Experience & RSVP Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Guest List & <span className="rainbow-text">Seating Matrix</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track live RSVPs, tally dietary preferences for catering, coordinate seating, or scan paper guest lists directly using the AI camera scanner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCameraScanner(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider rainbow-bar-bg hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>📸 Scan Guest List with Camera</span>
            </button>
            <button
              onClick={() => setShowRsvpModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>RSVP Portal Preview</span>
            </button>
            <button
              onClick={copyGuestPortalLink}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Portal Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Confirmed Attending
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-300 flex items-baseline gap-1.5">
            <span>{totalAttendingHeadcount}</span>
            <span className="text-xs text-slate-400 font-medium">({attendingGuests.length} parties)</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Target capacity: {event.targetGuestCount}
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Responses
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-300">
            {pendingGuests.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Awaiting digital RSVP
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Declined with Love
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-400">
            {declinedGuests.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Unable to attend
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Day-Of Check-In
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-cyan-300">
            {event.guests.filter(g => g.checkedIn).length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Guests arrived on site
          </span>
        </div>
      </div>

      {/* Catering Dietary Breakdown Ribbon */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-4 h-4 text-amber-300" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Catering Headcount & Dietary Requirements (Confirmed Guests)
          </h4>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(dietaryTallies).map(([diet, count]) => (
            <div
              key={diet}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-slate-200"
            >
              <span className="font-semibold text-white">{diet}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                {count} {count === 1 ? 'meal' : 'meals'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search, Filter & Add Form */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search guests by name or notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs font-semibold"
            >
              <option value="all" className="bg-slate-900 text-white">All Groups</option>
              <option value="VIP" className="bg-slate-900 text-white">VIP</option>
              <option value="Family" className="bg-slate-900 text-white">Family</option>
              <option value="Friends" className="bg-slate-900 text-white">Friends</option>
              <option value="Colleagues" className="bg-slate-900 text-white">Colleagues</option>
              <option value="Committee" className="bg-slate-900 text-white">Committee</option>
              <option value="Community" className="bg-slate-900 text-white">Community</option>
            </select>

            <button
              onClick={() => setShowCameraScanner(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold rounded-xl border border-white/15 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera Scan</span>
            </button>

            <button
              onClick={() => setIsAddingGuest(!isAddingGuest)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Add Guest Form */}
        {isAddingGuest && (
          <form onSubmit={handleAddGuest} className="glass-panel p-5 rounded-2xl border border-pink-400/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Add Guest to Register</h4>
              <button type="button" onClick={() => setIsAddingGuest(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={gName}
                  onChange={e => setGName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={gEmail}
                  onChange={e => setGEmail(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <select
                  value={gGroup}
                  onChange={e => setGGroup(e.target.value as Guest['group'])}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                >
                  <option value="Family" className="bg-slate-900 text-white">Family</option>
                  <option value="Friends" className="bg-slate-900 text-white">Friends</option>
                  <option value="VIP" className="bg-slate-900 text-white">VIP</option>
                  <option value="Colleagues" className="bg-slate-900 text-white">Colleagues</option>
                  <option value="Committee" className="bg-slate-900 text-white">Committee</option>
                  <option value="Community" className="bg-slate-900 text-white">Community</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <select
                  value={gStatus}
                  onChange={e => setGStatus(e.target.value as Guest['rsvpStatus'])}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                >
                  <option value="pending" className="bg-slate-900 text-white">Pending</option>
                  <option value="attending" className="bg-slate-900 text-white">Attending</option>
                  <option value="declined" className="bg-slate-900 text-white">Declined</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  placeholder="Plus ones"
                  value={gPlusOnes}
                  onChange={e => setGPlusOnes(Number(e.target.value))}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Table number (e.g. Table 3)"
                  value={gTable}
                  onChange={e => setGTable(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="w-full sm:w-auto px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md">
                  Save Guest
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Guest List Table */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-200">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">RSVP Status</th>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Circle / Group</th>
                  <th className="py-3.5 px-4">Plus-Ones</th>
                  <th className="py-3.5 px-4">Dietary Preference</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-5 text-right">Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        guest.rsvpStatus === 'attending' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        guest.rsvpStatus === 'declined' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {guest.rsvpStatus === 'attending' && <Check className="w-3 h-3" />}
                        {guest.rsvpStatus === 'declined' && <XCircle className="w-3 h-3" />}
                        {guest.rsvpStatus === 'pending' && <Clock className="w-3 h-3" />}
                        <span className="capitalize">{guest.rsvpStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {guest.name}
                      {guest.songRequest && (
                        <div className="flex items-center gap-1 text-[11px] font-normal text-cyan-300 mt-0.5">
                          <Music className="w-3 h-3" />
                          <span>{guest.songRequest}</span>
                        </div>
                      )}
                      {guest.notes && (
                        <div className="text-[11px] text-slate-400 font-normal">
                          {guest.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 border border-white/10 font-medium">
                        {guest.group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes}` : 'Solo'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {guest.dietary || 'Standard'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {guest.tableNumber || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => toggleCheckIn(guest.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          guest.checkedIn
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs'
                            : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {guest.checkedIn ? '✓ Arrived' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No guests match the current search or group filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guest RSVP Modal */}
      <GuestRSVPModal
        isOpen={showRsvpModal}
        onClose={() => setShowRsvpModal(false)}
        event={event}
        onRSVPSubmitted={handleRSVPSubmitted}
      />

      {/* AI Camera & Document OCR Scanner Modal */}
      <CameraGuestScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        event={event}
        onGuestsImported={handleGuestsImportedFromCamera}
      />
    </div>
  );
});

GuestSection.displayName = 'GuestSection';
