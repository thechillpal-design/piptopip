import { useState } from 'react';
import { Send, Server, Landmark, Hash, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

interface CopytradingFormProps {
    userTier: string;
    onSuccess: () => void;
}

export default function CopytradingForm({ userTier, onSuccess }: CopytradingFormProps) {
    const { user } = useAuth();

    const [platform, setPlatform] = useState('MT4');
    const [broker, setBroker] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountPassword, setAccountPassword] = useState('');
    const [accountSize, setAccountSize] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Auth Validation
        if (!user) {
            setError('You must sign in before connecting a broker.');
            return;
        }

        // 2. Input Sanitization (Trim and truncate to reasonable lengths to prevent buffer overloads)
        const sanitizedBroker = broker.trim().substring(0, 100);
        const sanitizedAccount = accountNumber.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50); // Alphanumeric only

        if (!sanitizedBroker || !sanitizedAccount || !accountSize || !accountPassword) {
            setError('Please fill in all details correctly.');
            return;
        }

        // 3. Simple Client-Side Rate Limiting (1 request per 60 seconds)
        const lastSubmit = localStorage.getItem('last_copytrading_submit');
        if (lastSubmit) {
            const timeDiff = Date.now() - parseInt(lastSubmit);
            if (timeDiff < 60000) { // 60 seconds
                setError(`Please wait ${Math.ceil((60000 - timeDiff) / 1000)}s before submitting another request.`);
                return;
            }
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 4. Supabase DB Insert
            const { error: sbError } = await supabase
                .from('copytrading_accounts')
                .insert({
                    user_id: user.id,
                    broker_name: sanitizedBroker,
                    account_number: sanitizedAccount,
                    account_password: accountPassword,
                    platform: platform,
                    account_size_range: accountSize,
                    subscription_tier: userTier || 'Basic'
                });

            if (sbError) throw sbError;

            // Success handling
            localStorage.setItem('last_copytrading_submit', Date.now().toString());
            setSuccess(true);
            setBroker('');
            setAccountNumber('');
            setAccountPassword('');
            setAccountSize('');

            // Trigger refresh on the parent dashboard
            onSuccess();

        } catch (err: any) {
            setError(err.message || 'Failed to submit broker details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="onboarding" className="w-full relative">
            <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyber/5 blur-3xl rounded-full pointer-events-none" />

                <div className="text-center mb-10">
                    <h2 className="text-[10px] font-black text-cyber uppercase tracking-[0.5em] mb-4">Onboarding</h2>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">
                        Connect Your <span className="text-white/20 italic">Broker</span>
                    </h3>
                    <p className="text-sm text-white/50 mt-4">To initiate mirroring, please provide your trading account details securely below.</p>
                </div>

                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Landmark className="w-3 h-3" /> Broker Name
                            </label>
                            <input
                                type="text"
                                required
                                value={broker}
                                onChange={(e) => setBroker(e.target.value)}
                                placeholder="e.g. IC Markets, Exness"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-cyber/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Account Number
                            </label>
                            <input
                                type="text"
                                required
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Trading Account ID"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-cyber/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Server className="w-3 h-3" /> Trading Platform
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {['MT4', 'MT5', 'cTrader'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPlatform(p)}
                                    className={`py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${platform === p
                                        ? 'border-cyber bg-cyber/10 text-cyber'
                                        : 'border-white/10 text-white/50 hover:border-white/30 hover:bg-white/5'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                Initial Account Size (USD)
                            </label>
                            <select
                                required
                                value={accountSize}
                                onChange={(e) => setAccountSize(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold appearance-none focus:outline-none focus:border-cyber/50 transition-colors text-white"
                            >
                                <option value="" disabled>Select approximate balance</option>
                                <option value="1k-5k">$1,000 - $5,000</option>
                                <option value="5k-20k">$5,000 - $20,000</option>
                                <option value="20k-100k">$20,000 - $100,000</option>
                                <option value="100k+">$100,000+</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                Master Password
                            </label>
                            <input
                                type="password"
                                required
                                value={accountPassword}
                                onChange={(e) => setAccountPassword(e.target.value)}
                                placeholder="Trading Password"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-cyber/50 transition-colors text-white"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-xs font-bold text-cyber bg-cyber/10 border border-cyber/20 rounded-lg p-3 text-center">
                            Broker link requested securely! Awaiting institutional verification.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-cyber text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>Submit Connection Request <Send className="w-4 h-4" /></>
                        )}
                    </button>

                    <p className="text-[9px] font-bold text-white/30 text-center uppercase tracking-widest mt-4">
                        We require your master trading password to securely connect and mirror the trades to your account directly.
                    </p>
                </form>
            </div>
        </div>
    );
}
