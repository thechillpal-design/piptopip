import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabase';
import { Loader2, ShieldCheck, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const plan = searchParams.get('plan') || 'Standard Plan';
    const price = searchParams.get('price') || '$99';
    const type = searchParams.get('type') || 'Subscription';
    const requestId = searchParams.get('requestId') || null;

    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const handlePesapalCheckout = async () => {
        if (!user) return;
        setIsSimulating(true);
        setError(null);

        try {
            if (price.toUpperCase() === 'FREE') {
                // Instantly grant purchase for free items
                const { error: dbError } = await supabase.from('user_purchases').insert({
                    user_id: user.id,
                    product_name: plan,
                    product_type: 'Course',
                    download_url: null
                });

                if (dbError) throw new Error("Failed to activate free plan.");
                setIsSimulating(false);
                navigate('/dashboard?tab=downloads&status=success', { replace: true });
                return;
            }

            // Normal logic starts here
            const response = await fetch('http://localhost:3001/api/pesapal-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    price,
                    type,
                    email: user.email,
                    userId: user.id,
                    requestId,
                    origin: window.location.origin
                })
            });
            const data = await response.json();

            if (response.ok && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                setError(data.error || 'Failed to initiate PesaPal checkout.');
                setIsSimulating(false);
            }
        } catch (err: any) {
            setError(err.message || 'Network error occurred. Try again.');
            setIsSimulating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] w-full text-white flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pippin/5 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber/5 blur-3xl rounded-full pointer-events-none" />

                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white relative z-10">Authentication Required</h2>
                <p className="text-white/50 text-sm mb-8 max-w-md relative z-10 uppercase tracking-widest font-bold leading-relaxed">Please create an account or sign in to complete your checkout for the <span className="text-pippin">{plan}</span>.</p>
                <div className="flex items-center gap-4 relative z-10">
                    <button onClick={() => navigate(-1)} className="px-8 py-4 bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all rounded-xl">
                        Go Back
                    </button>
                    <button onClick={() => setIsAuthOpen(true)} className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-pippin transition-all">
                        Sign In & Continue
                    </button>
                </div>

                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] w-full text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pippin/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber/5 blur-3xl rounded-full pointer-events-none" />

            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10 glass-panel p-2 rounded-3xl">

                {/* Order Summary Side */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                    <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 mb-8">
                        <ArrowLeft className="w-3 h-3" /> Go Back
                    </button>

                    <h2 className="text-sm font-black text-pippin uppercase tracking-[0.3em] mb-2">Order Summary</h2>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">{plan}</h3>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{type}</span>
                            <span className="text-lg font-black text-white">{price}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Taxes</span>
                            <span className="text-lg font-black text-white">$0.00</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-12">
                        <span className="text-sm font-black text-white/40 uppercase tracking-widest">Total Due</span>
                        <span className="text-5xl font-black text-white drop-shadow-md">{price}</span>
                    </div>
                </div>

                {/* PesaPal Checkout Side */}
                <div className="p-8 flex flex-col justify-center">
                    <div className="mb-8">
                        <h3 className="text-xl font-black uppercase tracking-widest mb-2 flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-cyber" /> Secure Checkout
                        </h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Powered by PesaPal. You will be securely redirected to complete your payment.</p>
                    </div>

                    {type === 'Copytrading' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-400 mb-2">Important Notice</h4>
                            <p className="text-xs text-white/70 font-medium leading-relaxed">
                                PesaPal currently supports <strong className="text-white">Visa</strong> and <strong className="text-white">Mastercard</strong> for recurring payments.
                                Please ensure you use one of these card types to smoothly activate your subscription.
                            </p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {error && (
                            <div className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePesapalCheckout}
                            disabled={isSimulating}
                            className="w-full mt-6 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyber transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSimulating ? (
                                <>Connecting to PesaPal <Loader2 className="w-4 h-4 animate-spin text-black" /></>
                            ) : (
                                <>Proceed to Payment <Lock className="w-3 h-3 text-black/50" /></>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" /> Secure 256-Bit SSL Encryption via PesaPal
                    </div>
                </div>

            </div>
        </div>
    );
}
