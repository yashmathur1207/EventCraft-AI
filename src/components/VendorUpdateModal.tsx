import React, { useState } from 'react';
import { Send, CheckCircle2, DollarSign, MessageSquare, X } from 'lucide-react';
import { PlannerEvent, Vendor } from '../types/event';

interface VendorUpdateModalProps {
  isOpen?: boolean;
  onClose: () => void;
  event: PlannerEvent;
  vendor: Vendor;
  onVendorUpdated?: (updatedVendor: Vendor) => void;
  onUpdateSubmitted?: (updatedVendor: Vendor) => void;
}

export const VendorUpdateModal: React.FC<VendorUpdateModalProps> = ({
  isOpen = true,
  onClose,
  event,
  vendor,
  onVendorUpdated,
  onUpdateSubmitted
}) => {
  const [status, setStatus] = useState<Vendor['status']>(vendor.status);
  const [finalPrice, setFinalPrice] = useState<number | ''>(vendor.finalPrice || vendor.quotedPrice || '');
  const [updateNote, setUpdateNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isOpen === false) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/vendor-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          status,
          finalPrice: finalPrice === '' ? undefined : Number(finalPrice),
          updateNote: updateNote || `Updated status to ${status.replace('_', ' ')}`
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (data && data.success && data.vendor) {
        if (onVendorUpdated) onVendorUpdated(data.vendor);
        if (onUpdateSubmitted) onUpdateSubmitted(data.vendor);
        onClose();
      } else {
        // Optimistic local update fallback
        const updatedLocalVendor: Vendor = {
          ...vendor,
          status,
          finalPrice: finalPrice === '' ? vendor.finalPrice : Number(finalPrice)
        };
        if (onVendorUpdated) onVendorUpdated(updatedLocalVendor);
        if (onUpdateSubmitted) onUpdateSubmitted(updatedLocalVendor);
        onClose();
      }
    } catch {
      // Optimistic local update fallback
      const updatedLocalVendor: Vendor = {
        ...vendor,
        status,
        finalPrice: finalPrice === '' ? vendor.finalPrice : Number(finalPrice)
      };
      if (onVendorUpdated) onVendorUpdated(updatedLocalVendor);
      if (onUpdateSubmitted) onUpdateSubmitted(updatedLocalVendor);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg my-8 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 12, 28, 0.94)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: '1px solid rgba(255, 255, 255, 0.28)'
        }}
      >
        {/* Header */}
        <div className="rainbow-bar-bg px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">Simulate Real-Time Vendor Update</h3>
            <p className="text-xs text-white/90">
              Submit updates as <strong>{vendor.name}</strong> ({vendor.category})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Contract & Agreement Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Vendor['status'])}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            >
              <option value="researching" className="bg-slate-900 text-white">Researching</option>
              <option value="contacted" className="bg-slate-900 text-white">Inquiry Sent (Contacted)</option>
              <option value="proposal_received" className="bg-slate-900 text-white">Proposal Received</option>
              <option value="contract_signed" className="bg-slate-900 text-white">Contract Signed</option>
              <option value="confirmed" className="bg-slate-900 text-white">Day-Of Locked / Confirmed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Final / Quoted Amount ($)
            </label>
            <input
              type="number"
              value={finalPrice}
              onChange={e => setFinalPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 3200"
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Status Broadcast Message (Feed Notification)
            </label>
            <textarea
              rows={3}
              value={updateNote}
              onChange={e => setUpdateNote(e.target.value)}
              placeholder="e.g. Signed contract and confirmed crew of 3 for 8 hours on event day with raw audio feed."
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Transmitting...' : 'Broadcast Live Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
