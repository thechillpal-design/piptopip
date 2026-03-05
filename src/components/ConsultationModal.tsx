import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { X, Calendar, Clock, Video, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function ConsultationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [contactMethod, setContactMethod] = useState('Google Meet Link');
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setIsAuthOpen(true);
            return;
        }

        if (!date) {
            setError("Please select a preferred date.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Check if user has past purchases
            const { count, error: countError } = await supabase
                .from('user_purchases')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) throw countError;

            const hasPurchases = count && count > 0;
            const finalStatus = hasPurchases ? 'scheduled' : 'pending_payment';

            const { data: insertedData, error: dbError } = await supabase.from('consultations').insert({
                user_id: user.id,
                date: date,
                time_slot: timeSlot,
                contact_method: contactMethod,
                notes: notes,
                status: finalStatus
            }).select();

            if (dbError) throw dbError;

            if (hasPurchases) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 3000);
            } else {
                // Redirect to checkout for $9.99
                const reqId = insertedData[0].id;
                onClose();
                navigate(`/checkout?plan=Expert%20Consultation&price=9.99&type=CONSULTATION&requestId=${reqId}`);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to schedule consultation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg glass-panel p-8 md:p-10 border border-white/10 animate-in zoom-in-95 duration-200 h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pippin/10 border border-pippin/20 mb-4 text-pippin">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expert Consultation</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                        Schedule A Call
                    </h2>
                    <p className="text-xs text-white/50 font-medium uppercase tracking-widest leading-relaxed">
                        Book a secure 1-on-1 strategy and recovery session with our senior engineers.
                    </p>
                </div>

                {!user && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Authentication Required</h4>
                        <p className="text-xs text-white/50 mb-4">You must be signed in to book a consultation slot.</p>
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all"
                        >
                            Log In / Register
                        </button>
                    </div>
                )}

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-2">Request Confirmed</h3>
                        <p className="text-xs text-white/60 font-medium">Your expert consultation has been scheduled. Check your dashboard for tracking status and links.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={`space-y-6 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
                                <Calendar className="w-3 h-3" /> Preferred Date
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50 transition-colors calendar-picker-dark"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
                                <Clock className="w-3 h-3" /> Preferred Time Slot
                            </label>
                            <input
                                type="time"
                                required
                                value={timeSlot}
                                onChange={(e) => setTimeSlot(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50 calendar-picker-dark"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
                                <Video className="w-3 h-3" /> Contact Method
                            </label>
                            <select
                                value={contactMethod}
                                onChange={(e) => setContactMethod(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50 appearance-none"
                            >
                                <option>Google Meet Link</option>
                                <option>Zoom Conference</option>
                                <option>WhatsApp Call</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
                                <MessageSquare className="w-3 h-3" /> Brief Situation Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g., I have a $50k account currently in 35% drawdown on GBPJPY shorts..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-pippin/50 transition-colors resize-none"
                            />
                        </div>

                        {error && (
                            <div className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !user}
                            className="w-full py-4 bg-pippin text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                        </button>
                    </form>
                )}
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
}
