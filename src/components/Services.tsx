import { Users, GraduationCap, Cpu, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const pillars = [
    {
        title: 'Elite Copytrading',
        desc: 'Mirror high-performance accounts with exact precision. $50 minimum deposit required to bind your account.',
        icon: Users,
        color: 'cyber',
        href: '#copytrading'
    },
    {
        title: 'Capital Recovery',
        desc: 'Professional account rescue for losing streaks. Safe trading strategies to build your account back up.',
        icon: ShieldCheck,
        color: 'cyber',
        href: '#recovery'
    },
    {
        title: 'Trading Robots',
        desc: 'Custom automated trading systems. We build robots that follow your exact rules smoothly inside MT4/MT5.',
        icon: Cpu,
        color: 'pippin',
        href: '#automation'
    },
    {
        title: 'PipForge Academy',
        desc: 'From beginner basics to advanced trading. Learn exactly when to buy, sell, and manage your money safely.',
        icon: GraduationCap,
        color: 'pippin',
        href: '#education'
    }
];

export default function Services() {
    return (
        <section id="services" className="py-24 px-6 bg-void relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-xs font-black text-pippin uppercase tracking-[0.4em] mb-6">Omni-Channel Advantage</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            The Four Pillars of <span className="text-white/20 italic">Piptopip</span>
                        </h3>
                    </div>
                    <p className="max-w-xs text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                        A comprehensive ecosystem designed to protect, educate, and automate your wealth creation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar, i) => (
                        <motion.div
                            key={pillar.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-card p-10 flex flex-col items-start gap-8 group"
                        >
                            <div className={`p-4 rounded-2xl bg-${pillar.color}/10 border border-${pillar.color}/20 text-${pillar.color} group-hover:scale-110 transition-transform duration-500`}>
                                <pillar.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-2xl text-white font-black mb-3 uppercase tracking-tighter drop-shadow-md">{pillar.title}</h4>
                                <p className="text-[15px] text-white/80 leading-relaxed font-medium">{pillar.desc}</p>
                            </div>
                            <a href={pillar.href} className={`mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-${pillar.color} hover:gap-4 transition-all duration-300`}>
                                Explore System <div className={`w-1 h-1 rounded-full bg-${pillar.color}`} />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
