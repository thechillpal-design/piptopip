import { Twitter, Instagram, Send, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const { error: dbError } = await supabase.from('newsletter_leads').insert({
                email: email
            });

            if (dbError) throw dbError;

            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to subscribe.');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <footer className="bg-void border-t border-white/5 pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-pippin rounded flex items-center justify-center">
                                <span className="text-black font-black">P</span>
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter">Pip<span className="text-pippin">to</span>Pip</span>
                        </div>
                        <p className="text-sm text-white/70 max-w-sm mb-8 font-medium">
                            Revolutionizing retail trading through institutional-grade automation and elite capital recovery. Secure your edge with the PipForge Ecosystem.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Send].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-pippin hover:text-black hover:border-pippin transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-8">Services</h5>
                        <ul className="space-y-4">
                            {['Elite Copytrading', 'Capital Shield', 'Automation Systems', 'PipForge Academy'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-pippin transition-colors flex items-center justify-between group">
                                        {link} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-8">Newsletter</h5>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 mb-4">Get VIP alpha trade signals.</p>

                        {status === 'success' ? (
                            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg animate-in fade-in zoom-in">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Subscribed Successfully</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        placeholder="EMAIL"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-[10px] font-black focus:outline-none focus:border-pippin transition-colors ${status === 'error' ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white'}`}
                                    />
                                    {status === 'error' && (
                                        <div className="absolute -bottom-5 left-0 text-[8px] text-red-400 font-bold uppercase tracking-widest">{errorMessage}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="px-6 py-3 bg-pippin text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center shrink-0 min-w-[80px]"
                                >
                                    {status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Join'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        &copy; 2026 PIPTOPIP ECOSYSTEM. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors">Risk Disclaimer</a>
                        <a href="#" className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors">Privacy Policy</a>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-white/[0.05] border border-white/10 rounded-2xl">
                    <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest leading-loose text-center">
                        Trading Forex and CFDs carries significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose. All EAs and automation tools provided are for educational and assisting purposes only. Performance models and probability scores are based on historical data and do not guarantee future results.
                    </p>
                </div>
            </div>
        </footer>
    );
}
