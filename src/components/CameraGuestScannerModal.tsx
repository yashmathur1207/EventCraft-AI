import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Users, 
  Utensils, 
  Trash2, 
  FileText,
  RefreshCw,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlannerEvent, Guest } from '../types/event';

interface CameraGuestScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlannerEvent;
  onGuestsImported: (newGuests: Guest[]) => void;
}

interface ParsedGuestCandidate {
  id: string;
  name: string;
  email: string;
  group: Guest['group'];
  rsvpStatus: Guest['rsvpStatus'];
  plusOnes: number;
  dietary: string;
  tableNumber: string;
  notes: string;
  selected: boolean;
}

export const CameraGuestScannerModal: React.FC<CameraGuestScannerModalProps> = ({
  isOpen,
  onClose,
  event,
  onGuestsImported
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [confidenceNote, setConfidenceNote] = useState<string>('');
  const [parsedCandidates, setParsedCandidates] = useState<ParsedGuestCandidate[]>([]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream when camera mode is active
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Camera access error:', e);
      setCameraError('Unable to open device camera (permission denied or no camera found). You can upload a photo or try our sample contact sheet instead.');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCamera();
    processImageWithAI(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        processImageWithAI(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const processImageWithAI = async (imageDataUrl: string) => {
    setIsProcessing(true);
    setOcrError(null);
    try {
      const res = await fetch('/api/gemini/parse-guest-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg'
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || 'Failed to parse image with Gemini');
      }

      const result = data.result;
      setDetectedTitle(result.detectedSheetTitle || '');
      setConfidenceNote(result.confidenceNotes || '');

      const candidates: ParsedGuestCandidate[] = (result.guests || []).map((g: any, idx: number) => ({
        id: `scan-${Date.now()}-${idx}`,
        name: g.name || 'Unknown Guest',
        email: g.email || '',
        group: (['Family', 'Friends', 'VIP', 'Colleagues', 'Committee', 'Community'].includes(g.group) ? g.group : 'Friends') as Guest['group'],
        rsvpStatus: (['attending', 'declined', 'pending'].includes(g.rsvpStatus) ? g.rsvpStatus : 'attending') as Guest['rsvpStatus'],
        plusOnes: Number(g.plusOnes) || 0,
        dietary: g.dietary || 'None',
        tableNumber: g.tableNumber || '',
        notes: g.notes || '',
        selected: true
      }));

      setParsedCandidates(candidates);
      if (candidates.length === 0) {
        setOcrError('No names were distinctly identified on this page. Please try with better lighting or a clearer angle.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Guest scanner error:', e?.message);
      const errorMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Could not connect to document analysis service. Please try again or test with the sample sheet.'
        : e.message;
      setOcrError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample handwritten canvas generator for instant testing
  const loadSampleHandwrittenSheet = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lined yellow notebook paper background
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Margin line
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.lineTo(120, canvas.height);
    ctx.stroke();

    // Blue horizontal notebook lines
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    for (let y = 80; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Handwritten-style text
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`${event.title} - Guest List & RSVP Sheet`, 140, 60);

    ctx.font = '22px cursive, sans-serif';
    ctx.fillStyle = '#0f172a';
    const lines = [
      '1. Claire & Daniel Vance (VIP Table 1) - Attending - 1x Vegetarian',
      '2. Uncle Arthur Miller (+1) - Attending - Gluten Free (Celiac)',
      '3. Dr. Evelyn Reed - arthur.v@hospital.org - Attending - Standard',
      '4. Samira Patel - samira.p@gmail.com - Attending - Vegan',
      '5. Marcus Sterling (+1 guest) - Best Man - Attending',
      '6. Professor Lawrence K. - Cannot make it (Declined)',
      '7. Jordan Vance - Table 3 - Nut Allergy',
      '8. Nadia Chen & guest - Pending flight booking'
    ];

    lines.forEach((line, index) => {
      ctx.fillText(line, 140, 115 + (index * 45));
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    processImageWithAI(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setParsedCandidates([]);
    setOcrError(null);
    setDetectedTitle('');
    setConfidenceNote('');
    if (mode === 'camera') {
      startCamera();
    }
  };

  const toggleSelectCandidate = (id: string) => {
    setParsedCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const removeCandidate = (id: string) => {
    setParsedCandidates(prev => prev.filter(c => c.id !== id));
  };

  const updateCandidateField = (id: string, field: keyof ParsedGuestCandidate, value: any) => {
    setParsedCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleImportApproved = () => {
    const selected = parsedCandidates.filter(c => c.selected);
    if (selected.length === 0) return;

    const newGuests: Guest[] = selected.map(c => ({
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: c.name,
      email: c.email || undefined,
      group: c.group,
      rsvpStatus: c.rsvpStatus,
      plusOnes: c.plusOnes,
      dietary: c.dietary !== 'None' ? c.dietary : undefined,
      tableNumber: c.tableNumber || undefined,
      checkedIn: false,
      notes: c.notes ? `${c.notes} (Scanned from photo)` : 'Imported via AI Camera OCR'
    }));

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    onGuestsImported(newGuests);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 12, 28, 0.94)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: '1px solid rgba(255, 255, 255, 0.28)'
        }}
      >
        {/* Header */}
        <div className="rainbow-bar-bg px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/30 rounded-2xl backdrop-blur-md">
              <Camera className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold flex items-center gap-2 text-white">
                <span>AI Camera & Document OCR Scanner</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-900 shadow-sm">
                  Multimodal
                </span>
              </h3>
              <p className="text-xs text-white/90">
                Capture handwritten sign-in sheets, printed seating lists, or notes to automatically extract guests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* View mode switcher */}
          {!capturedImage && (
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => { setMode('camera'); setCameraError(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'camera'
                      ? 'rainbow-bar-bg text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('upload'); stopCamera(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'upload'
                      ? 'rainbow-bar-bg text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {/* Sample tester button */}
              <button
                type="button"
                onClick={loadSampleHandwrittenSheet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/30 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Try Sample Handwritten Sheet</span>
              </button>
            </div>
          )}

          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {ocrError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{ocrError}</span>
            </div>
          )}

          {/* Camera Viewfinder View */}
          {!capturedImage && mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video max-h-[380px] w-full bg-slate-950 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Guideline Box */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-teal-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 bg-teal-500/5">
                  <div className="flex justify-between text-[11px] font-bold text-teal-300 drop-shadow-md">
                    <span>ALIGN GUEST LIST HERE</span>
                    <span>AI AUTO-OCR</span>
                  </div>
                  <div className="text-center text-xs text-white/90 drop-shadow-md font-medium">
                    Hold document steady with adequate lighting
                  </div>
                </div>

                {/* Camera Flip Button */}
                <button
                  type="button"
                  onClick={flipCamera}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md transition-colors"
                  title="Flip Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Shutter capture bar */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-sm font-bold rounded-2xl shadow-xl shadow-teal-500/25 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-teal-200" />
                  <span>Capture & Parse with AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Photo File Upload View */}
          {!capturedImage && mode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-10 text-center cursor-pointer transition-all bg-slate-50 hover:bg-teal-50/30 group"
              >
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:scale-110 transition-all mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Click or drag photo of guest list or handwritten sheet
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JPG, PNG, WEBP, or smartphone snapshots up to 25MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={loadSampleHandwrittenSheet}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  Or click here to test with an instant sample handwritten sheet
                </button>
              </div>
            </div>
          )}

          {/* Captured Preview & Processing Status */}
          {capturedImage && (
            <div className="space-y-6">
              {/* Top thumbnail & Retake button */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={capturedImage}
                    alt="Captured Guest List"
                    className="w-16 h-12 object-cover rounded-xl border border-slate-300 shadow-xs"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Captured Document
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {detectedTitle || 'Handwritten / Printed Guest Sheet'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake / Scan Another</span>
                </button>
              </div>

              {/* Processing Loader */}
              {isProcessing && (
                <div className="py-12 text-center space-y-3 bg-teal-50/50 rounded-3xl border border-teal-100">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      Gemini Multimodal OCR is reading your document...
                    </h4>
                    <p className="text-xs text-slate-500">
                      Extracting names, contact information, dietary restrictions, and plus-ones
                    </p>
                  </div>
                </div>
              )}

              {/* Parsed Candidates Table for Review */}
              {!isProcessing && parsedCandidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Recognized Guests ({parsedCandidates.length} found)</span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          Ready for Review
                        </span>
                      </h4>
                      {confidenceNote && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{confidenceNote}</p>
                      )}
                    </div>

                    <div className="text-xs text-slate-500">
                      {parsedCandidates.filter(c => c.selected).length} of {parsedCandidates.length} selected
                    </div>
                  </div>

                  {/* Candidates Review List */}
                  <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 divide-y divide-white/10 bg-white/[0.04]">
                    {parsedCandidates.map(candidate => (
                      <div
                        key={candidate.id}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          candidate.selected ? 'bg-white/[0.06]' : 'bg-transparent opacity-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={candidate.selected}
                            onChange={() => toggleSelectCandidate(candidate.id)}
                            className="mt-1 w-4 h-4 text-cyan-400 rounded border-white/20 focus:ring-cyan-400 cursor-pointer"
                          />

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <input
                                type="text"
                                value={candidate.name}
                                onChange={e => updateCandidateField(candidate.id, 'name', e.target.value)}
                                className="w-full px-2.5 py-1 text-xs font-bold text-white rounded-lg border border-transparent hover:border-white/20 focus:border-cyan-400 focus:outline-none bg-white/[0.05]"
                              />
                              {candidate.email && (
                                <span className="text-[10px] text-slate-400 block px-2.5">
                                  {candidate.email}
                                </span>
                              )}
                            </div>

                            <div>
                              <select
                                value={candidate.group}
                                onChange={e => updateCandidateField(candidate.id, 'group', e.target.value)}
                                className="w-full px-2 py-1 text-xs text-slate-200 rounded-lg border border-white/15 focus:border-cyan-400 bg-slate-900"
                              >
                                <option value="VIP">VIP</option>
                                <option value="Family">Family</option>
                                <option value="Friends">Friends</option>
                                <option value="Colleagues">Colleagues</option>
                                <option value="Committee">Committee</option>
                                <option value="Community">Community</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={candidate.dietary}
                                onChange={e => updateCandidateField(candidate.id, 'dietary', e.target.value)}
                                className="w-full px-2 py-1 text-xs text-slate-200 rounded-lg border border-white/15 focus:border-cyan-400 bg-slate-900 truncate"
                              >
                                <option value="None">No Dietary</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                                <option value="Gluten-Free">Gluten-Free</option>
                                <option value="Nut Allergy">Nut Allergy</option>
                                <option value="Pescatarian">Pescatarian</option>
                              </select>

                              {candidate.plusOnes > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-bold whitespace-nowrap border border-white/10">
                                  +{candidate.plusOnes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCandidate(candidate.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors self-end sm:self-auto cursor-pointer"
                          title="Remove guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Import summary and actions */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Target guest count: <strong className="text-white">{event.targetGuestCount}</strong> • Currently tracked: <strong className="text-white">{event.guests.length}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleImportApproved}
                        className="flex items-center gap-1.5 px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Import {parsedCandidates.filter(c => c.selected).length} Guests to Event</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
