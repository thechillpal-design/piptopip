import { Cpu, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const eas = [
    {
        name: 'Pipsqueak AI',
        tag: 'SCALPER',
        accuracy: '89%',
        price: '$199',
        vibe: 'High-frequency scalping bot optimized for Gold and EUR/USD.'
    },
    {
        name: 'Titan Grid',
        tag: 'GRID/HEDGE',
        accuracy: '74%',
        price: '$299',
        vibe: 'Low-drawdown grid system for long-term equity growth.'
    },
    {
        name: 'Oracle FX',
        tag: 'PREDICTIVE',
        accuracy: '92%',
        price: '$499',
        vibe: 'Proprietary machine learning model for trend reversal detection.'
    }
];

export default function TheVault() {
    return (
        <section id="automation" className="py-24 px-6 bg-void/30 border-y border-white/5">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-[10px] font-black text-pippin uppercase tracking-[0.5em] mb-4">The Vault</h2>
                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                        Download <span className="text-white/20">Algorithms</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {eas.map((ea, idx) => (
                        <motion.div
                            key={ea.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true, margin: "-10%" }}
                            className="glass-card p-8 group relative"
                        >
                            <div className="flex justify-between items-start mb-8 text-left">
                                <div>
                                    <div className="text-[10px] font-black text-pippin uppercase tracking-widest mb-2 px-2 py-0.5 bg-pippin/10 border border-pippin/20 rounded inline-block">
                                        {ea.tag}
                                    </div>
                                    <h4 className="text-xl text-white font-black uppercase tracking-tighter drop-shadow-md">{ea.name}</h4>
                                </div>
                                <Cpu className="w-8 h-8 text-white/10 group-hover:text-pippin transition-colors" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">
                                    <span>Probability Score</span>
                                    <span className="text-green-500">{ea.accuracy}</span>
                                </div>
                                <p className="text-xs text-white/80 font-medium leading-relaxed italic text-left drop-shadow-sm">
                                    "{ea.vibe}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl text-white font-black drop-shadow-lg">{ea.price}</span>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">USD</span>
                                </div>
                            </div>

                            <Link to={`/checkout?plan=${encodeURIComponent(ea.name)}&price=${encodeURIComponent(ea.price)}&type=Algorithm`} className="w-full py-4 border border-white/10 text-white/90 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95 group-hover:bg-pippin/10 group-hover:text-pippin group-hover:border-pippin/30">
                                <ShoppingCart className="w-4 h-4" />
                                Purchase & Download EA
                            </Link>

                            {/* Decorative Corner Glow */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-pippin/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
