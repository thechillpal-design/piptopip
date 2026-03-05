import { useState } from 'react';
import { ShieldAlert, Activity, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecoverySection() {
    const [drawdown, setDrawdown] = useState(25);
    const getDetails = () => {
        if (drawdown <= 20) return { label: 'STABLE', color: 'text-green-500', bg: 'bg-green-500/10', fee: 'N/A', message: 'Your account is fine. You can easily bounce back.' };
        if (drawdown <= 40) return { label: 'MODERATE', color: 'text-amber-500', bg: 'bg-amber-500/10', fee: '$49 Base + 15% Perf.', message: 'Moderate loss. We suggest safe risk-reduction strategies.' };
        if (drawdown <= 70) return { label: 'SEVERE', color: 'text-orange-500', bg: 'bg-orange-500/10', fee: '$99 Base + 20% Perf.', message: 'Severe loss. We need to be aggressive to safely build it back.' };
        return { label: 'CRITICAL', color: 'text-red-600', bg: 'bg-red-600/10', fee: '$199 Base + 30% Perf.', message: 'Urgent help needed. High danger of losing everything. Starting Capital Recovery.' };
    };

    const currentStatus = getDetails();

    return (
        <section id="recovery" className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 mb-8 text-red-600">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Emergency Protocol</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                        Capital <span className="text-white/20">Recovery</span>:<br />
                        The Rescue <span className="text-pippin">Unit</span>.
                    </h2>
                    <p className="text-lg text-white/50 mb-10 font-medium max-w-lg">
                        Having a big losing streak? Don't let fear make you lose it all. Our simple account recovery system helps freeze your losses and safely build your account block by block.
                    </p>

                    <div className="space-y-6">
                        {[
                            'Safe Account Protection',
                            'Simple Loss Management',
                            'Mental Trading Support',
                            'MT4/MT5 Trading Assistance'
                        ].map(item => (
                            <div key={item} className="flex items-center gap-4 group">
                                <div className="w-2 h-2 rounded-full bg-pippin group-hover:scale-150 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest text-white/70">{item}</span>
                            </div>
                        ))}
                    </div>

                    <a href="#recovery" className="mt-12 w-fit">
                        <button className="btn-primary flex items-center gap-3">
                            Initiate Rescue <ChevronRight className="w-5 h-5" />
                        </button>
                    </a>
                </div>

                {/* Diagnostic Tool Visual */}
                <div className="order-1 lg:order-2 glass-panel p-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-2">Account Analysis</h4>
                            <p className="text-xl font-bold uppercase tracking-widest">Risk Assessment</p>
                        </div>
                        <Activity className="w-6 h-6 text-pippin animate-pulse" />
                    </div>

                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic text-left">Current Drawdown</span>
                            <span className={`text-4xl font-black ${currentStatus.color}`}>{drawdown}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="95"
                            value={drawdown}
                            onChange={(e) => setDrawdown(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-pippin"
                        />
                    </div>

                    <div className={`p-8 rounded-2xl ${currentStatus.bg} border border-white/5 transition-all duration-500`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${currentStatus.color}`}>SYSTEM STATUS: {currentStatus.label}</span>
                            <Zap className={`w-4 h-4 ${currentStatus.color}`} />
                        </div>
                        <p className="text-xs font-bold leading-relaxed text-white/60 mb-6 uppercase tracking-widest text-left">
                            {currentStatus.message}
                        </p>

                        {drawdown > 20 ? (
                            <Link to={`/checkout?plan=${encodeURIComponent('Capital Recovery Program')}&price=${encodeURIComponent(currentStatus.fee)}&type=Algorithm`}>
                                <button className="w-full py-4 bg-pippin text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all">
                                    Initiate Rescue
                                </button>
                            </Link>
                        ) : (
                            <button className="w-full py-4 bg-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed">
                                Rescue Not Required
                            </button>
                        )}
                    </div>

                    {/* Decorative Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-red-600/10 to-transparent pointer-events-none opacity-50" />
                </div>
            </div>
        </section>
    );
}
