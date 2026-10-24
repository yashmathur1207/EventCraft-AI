import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  CheckSquare, 
  Square, 
  Plus, 
  Building, 
  User, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Radio,
  Utensils,
  Camera,
  Music,
  Search,
  Filter,
  X,
  Layers,
  Tag
} from 'lucide-react';
import { PlannerEvent, Vendor } from '../types/event';
import { formatCurrency } from '../utils/formatters';
import { AIVendorRFPModal } from './AIVendorRFPModal';
import { VendorUpdateModal } from './VendorUpdateModal';

interface VendorSectionProps {
  event: PlannerEvent;
  onUpdateEvent: (updated: PlannerEvent) => void;
}

const STATUS_CONFIG: Record<Vendor['status'], { label: string; bg: string; text: string; border: string }> = {
  researching: { label: 'Researching', bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-400/30' },
  contacted: { label: 'Inquiry Sent', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/30' },
  proposal_received: { label: 'Proposal Received', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/30' },
  contract_signed: { label: 'Contract Signed', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400/30' },
  confirmed: { label: 'Day-Of Locked', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-400/30' }
};

// Helper for Category Icons
const getCategoryIcon = (catName: string) => {
  const normalized = catName.toLowerCase();
  if (normalized.includes('cater') || normalized.includes('food') || normalized.includes('bar')) return Utensils;
  if (normalized.includes('photo') || normalized.includes('video') || normalized.includes('cinema')) return Camera;
  if (normalized.includes('venue') || normalized.includes('estate') || normalized.includes('location')) return Building;
  if (normalized.includes('music') || normalized.includes('dj') || normalized.includes('band') || normalized.includes('entertain')) return Music;
  if (normalized.includes('floral') || normalized.includes('decor') || normalized.includes('design')) return Sparkles;
  if (normalized.includes('sound') || normalized.includes('light') || normalized.includes('audio')) return Radio;
  return Tag;
};

export const VendorSection: React.FC<VendorSectionProps> = React.memo(({ event, onUpdateEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rfpVendor, setRfpVendor] = useState<Vendor | null>(null);
  const [updateVendor, setUpdateVendor] = useState<Vendor | null>(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  // New vendor form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Catering');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Extract all unique categories present in the event
  const presentCategories = useMemo(() => {
    return Array.from(new Set(event.vendors.map(v => v.category)));
  }, [event.vendors]);

  const standardCategories = ['Catering', 'Photography', 'Venue', 'Floral & Decor', 'Entertainment', 'Sound & Lighting', 'Stationery & Favors'];
  const allCategories = useMemo(() => {
    return Array.from(new Set([...presentCategories, ...standardCategories]));
  }, [presentCategories]);

  // Filter vendors based on Category, Status, and Search Query
  const filteredVendors = useMemo(() => {
    return event.vendors.filter(vendor => {
      const matchesCategory = selectedCategory === 'all' || vendor.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(query)) ||
        (vendor.notes && vendor.notes.toLowerCase().includes(query));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [event.vendors, selectedCategory, selectedStatus, searchQuery]);

  const categoryTotalSpend = useMemo(() => {
    return filteredVendors.reduce((sum, v) => sum + (v.finalPrice || v.quotedPrice || 0), 0);
  }, [filteredVendors]);

  const toggleChecklistItem = (vendorId: string, itemId: string) => {
    const updatedVendors = event.vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          checklist: v.checklist.map(c => {
            if (c.id === itemId) return { ...c, done: !c.done };
            return c;
          })
        };
      }
      return v;
    });

    onUpdateEvent({
      ...event,
      vendors: updatedVendors
    });
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name,
      category,
      status: 'researching',
      contactPerson,
      email,
      phone,
      quotedPrice: Number(quotedPrice) || 0,
      notes,
      checklist: [
        { id: `vc-${Date.now()}-1`, text: 'Review portfolio & client references', done: false },
        { id: `vc-${Date.now()}-2`, text: 'Inquire about availability for event date', done: false },
        { id: `vc-${Date.now()}-3`, text: 'Review contract liability & cancellation policy', done: false }
      ]
    };

    onUpdateEvent({
      ...event,
      vendors: [...event.vendors, newVendor],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Added vendor "${name}" under ${category}`,
          type: 'vendor'
        },
        ...event.activityFeed
      ]
    });

    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setQuotedPrice('');
    setNotes('');
    setIsAddingVendor(false);
  };

  const handleSaveRfpToVendor = (vendorId: string, rfpDraft: string) => {
    const updated = event.vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          rfpDraft,
          notes: `${v.notes ? `${v.notes}\n\n` : ''}[AI RFP Generated on ${new Date().toLocaleDateString()}]`
        };
      }
      return v;
    });
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleVendorUpdatedFromModal = (updatedVendor: Vendor) => {
    const updated = event.vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v);
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#00F5D4]/20 via-[#00B8FF]/20 to-[#7B2CBF]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Partner Ecosystem</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Vendor Directory & <span className="rainbow-text">RFP Hub</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Filter by department, manage contracts & milestone deliverables, draft AI inquiries with Gemini, and track live status broadcasts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRfpVendor({ 
                id: '', 
                name: 'New Vendor Inquiry', 
                category: selectedCategory !== 'all' ? selectedCategory : 'Catering', 
                status: 'researching', 
                checklist: [] 
              })}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider rainbow-bar-bg hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Draft AI RFP Inquiry</span>
            </button>
            <button
              onClick={() => {
                if (selectedCategory !== 'all') {
                  setCategory(selectedCategory);
                }
                setIsAddingVendor(!isAddingVendor);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Filtering System Container */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl text-cyan-300 border border-white/15">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Filter Vendors by Category & Service</h3>
              <p className="text-xs text-slate-400">
                Browse specific departments: Catering, Photography, Venue, Florals & more
              </p>
            </div>
          </div>

          {/* Search bar & Status Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search vendor name or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-9 pr-8 py-2 rounded-xl text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs font-semibold"
            >
              <option value="all" className="bg-slate-900 text-white">All Contract Statuses</option>
              <option value="researching" className="bg-slate-900 text-white">Researching</option>
              <option value="contacted" className="bg-slate-900 text-white">Inquiry Sent</option>
              <option value="proposal_received" className="bg-slate-900 text-white">Proposal Received</option>
              <option value="contract_signed" className="bg-slate-900 text-white">Contract Signed</option>
              <option value="confirmed" className="bg-slate-900 text-white">Day-Of Locked</option>
            </select>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Department Category
            </span>
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* "All Categories" Button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'rainbow-bar-bg text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Categories</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                {event.vendors.length}
              </span>
            </button>

            {/* Individual Category Buttons */}
            {presentCategories.map(cat => {
              const Icon = getCategoryIcon(cat);
              const count = event.vendors.filter(v => v.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'rainbow-bar-bg text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Summary Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing:</span>
            <strong className="text-white">
              {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
            </strong>
            {selectedCategory !== 'all' && (
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-lg font-semibold flex items-center gap-1">
                Category: {selectedCategory}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-white ml-0.5" 
                  onClick={() => setSelectedCategory('all')} 
                />
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg font-semibold flex items-center gap-1">
                Status: {STATUS_CONFIG[selectedStatus as Vendor['status']]?.label || selectedStatus}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-white ml-0.5" 
                  onClick={() => setSelectedStatus('all')} 
                />
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-lg font-semibold flex items-center gap-1">
                Keyword: "{searchQuery}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-white ml-0.5" 
                  onClick={() => setSearchQuery('')} 
                />
              </span>
            )}
          </div>

          <div className="text-slate-300">
            Total Allocated / Quoted:{' '}
            <strong className="text-white">{formatCurrency(categoryTotalSpend, event.currency)}</strong>
          </div>
        </div>
      </div>

      {/* Add Vendor Form */}
      {isAddingVendor && (
        <form onSubmit={handleAddVendor} className="glass-panel p-6 rounded-3xl border border-cyan-400/40 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              Add New Partner / Vendor {selectedCategory !== 'all' ? `to ${selectedCategory}` : ''}
            </h4>
            <button type="button" onClick={() => setIsAddingVendor(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                required
                placeholder="Company / Vendor Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>
            <div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                placeholder="Estimated / Quoted ($)"
                value={quotedPrice}
                onChange={e => setQuotedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                placeholder="Contact Person Name"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Contact Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
          <div>
            <textarea
              rows={2}
              placeholder="Notes, deliverables, or initial meeting notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsAddingVendor(false)} 
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
              Save Vendor
            </button>
          </div>
        </form>
      )}

      {/* Filtered Vendor Cards Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map(vendor => {
            const statusMeta = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.researching;
            const completedTasks = vendor.checklist.filter(c => c.done).length;
            const CategoryIcon = getCategoryIcon(vendor.category);

            return (
              <div
                key={vendor.id}
                className="glass-card-interactive p-6 rounded-3xl space-y-5"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-cyan-300 text-[11px] font-semibold border border-white/15">
                        <CategoryIcon className="w-3 h-3 text-cyan-300" />
                        <span>{vendor.category}</span>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{vendor.name}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-white">
                      {formatCurrency(vendor.finalPrice || vendor.quotedPrice || 0, event.currency)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {vendor.finalPrice ? 'Contracted' : 'Quoted'}
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                {(vendor.contactPerson || vendor.email || vendor.phone) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                    {vendor.contactPerson && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.contactPerson}</span>
                      </span>
                    )}
                    {vendor.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.email}</span>
                      </span>
                    )}
                    {vendor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-400">
                      Vendor Checklist & Deliverables
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {completedTasks} / {vendor.checklist.length} done
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {vendor.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(vendor.id, item.id)}
                        className="flex items-center gap-2 text-xs text-slate-200 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={item.done ? 'line-through text-slate-500' : ''}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live update alert / notes */}
                {vendor.lastUpdate && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-500/15 border border-blue-400/30 rounded-xl text-xs text-blue-200">
                    <Clock className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span><strong>Live Status:</strong> {vendor.lastUpdate}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setRfpVendor(vendor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Draft RFP Email</span>
                  </button>

                  <button
                    onClick={() => setUpdateVendor(vendor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Simulate Live Update</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <p className="text-slate-300 text-sm">
            No vendors match the current filter selection ({selectedCategory !== 'all' ? selectedCategory : 'all categories'}, status: {selectedStatus}).
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white rainbow-bar-bg hover:brightness-110 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* AI RFP Generator Modal */}
      {rfpVendor && (
        <AIVendorRFPModal
          event={event}
          vendor={rfpVendor}
          onClose={() => setRfpVendor(null)}
          onSaveToVendor={draft => {
            if (rfpVendor.id) {
              handleSaveRfpToVendor(rfpVendor.id, draft);
            }
          }}
        />
      )}

      {/* Vendor Live Update Simulation Modal */}
      {updateVendor && (
        <VendorUpdateModal
          event={event}
          vendor={updateVendor}
          onClose={() => setUpdateVendor(null)}
          onVendorUpdated={handleVendorUpdatedFromModal}
        />
      )}
    </div>
  );
});

VendorSection.displayName = 'VendorSection';
