import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Basic',
        desc: 'For retail traders starting out.',
        price: '$45',
        features: ['Standard Execution (50ms)', '1 Live Account Binding', 'Basic Lot Multipliers']
    },
    {
        name: 'Pro',
        desc: 'The most popular choice for consistent growth.',
        price: '$99',
        features: ['Low Latency VPS (10ms)', 'Up to 5 Sub Accounts', 'Proportional Equity Scaling', 'Priority Support']
    },
    {
        name: 'Institutional',
        desc: 'For high net worth individuals and prop firms.',
        price: '$199',
        features: ['Zero Slippage Direct Routing', 'Unlimited Bound Accounts', 'Custom Hedging Parameters', 'API Hook Access']
    }
];

export default function PricingCopytrading() {
    return (
        <section id="copytrading" className="py-24 px-6 bg-void relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-black text-cyber uppercase tracking-[0.5em] mb-4">Elite Copytrading</h2>
                    <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                        Select Your <span className="text-white/20 italic">Edge</span>
                    </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.name} className="glass-card p-10 flex flex-col group">
                            <h4 className="text-2xl text-white font-black uppercase tracking-tighter mb-2 drop-shadow-md">{plan.name}</h4>
                            <p className="text-[13px] text-white/80 font-medium mb-6 h-8">{plan.desc}</p>
                            <div className="text-5xl text-white font-black mb-8 flex items-baseline gap-2 drop-shadow-lg">
                                {plan.price}
                                <span className="text-xs text-white/50 uppercase tracking-widest">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex gap-3 text-sm font-bold text-white/80">
                                        <Check className="w-5 h-5 text-cyber shrink-0 filter drop-shadow-md" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to={`/checkout?plan=${encodeURIComponent(plan.name + ' Plan')}&price=${encodeURIComponent(plan.price)}&type=Copytrading`} className="w-full py-4 text-xs font-black uppercase tracking-widest border border-white/10 text-white/80 flex items-center justify-center hover:bg-cyber hover:text-black hover:border-cyber transition-all rounded-lg group-hover:bg-white/5">
                                Purchase & Connect Broker
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
