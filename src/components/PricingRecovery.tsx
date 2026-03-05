import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import ConsultationModal from './ConsultationModal';

const severities = [
    { level: 'Moderate Drawdown', drawdown: '20% - 40%', fee: '$49 Base + 15% Performance' },
    { level: 'Severe Drawdown', drawdown: '41% - 70%', fee: '$99 Base + 20% Performance' },
    { level: 'Critical Condition', drawdown: '71%+', fee: '$199 Base + 30% Performance' },
]

export default function PricingRecovery() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section className="py-24 px-6 bg-void/50 border-y border-white/5">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-black text-pippin uppercase tracking-[0.5em] mb-4">Capital Shield Pricing</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-md">
                        Recovery <span className="text-white/40">Protocols</span>
                    </h3>
                    <p className="text-white/80 mt-4 max-w-lg mx-auto text-sm font-medium">Service fees are scaled based on the severity of the drawdown and the risk required to aggressively hedge and recover your capital.</p>
                </div>

                <div className="space-y-4 flex flex-col items-center">
                    {severities.map((tier) => (
                        <div key={tier.level} className="w-full max-w-2xl glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-pippin/30">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-pippin/10 rounded-lg text-pippin filter drop-shadow-md">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg text-white font-black uppercase tracking-tighter drop-shadow-md">{tier.level}</h4>
                                    <div className="text-xs text-pippin font-bold uppercase tracking-widest mt-1">Drawdown: {tier.drawdown}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl text-white font-black drop-shadow-md">{tier.fee}</span>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 px-12 py-4 bg-pippin text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center gap-2"
                    >
                        <ShieldAlert className="w-4 h-4" /> Consult an Expert
                    </button>
                </div>
            </div>

            <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
}
