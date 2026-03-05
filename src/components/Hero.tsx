import { ArrowRight, Play, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
            <div className="relative z-10 max-w-7xl mx-auto text-center">


                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8 relative z-20"
                >
                    Master the <span className="text-pippin italic">Market</span>,<br />
                    Shield your <span className="text-glow">Capital</span>
                    <span className="relative inline-block">
                        .
                        {/* Hanging Emergency Banner */}
                        <motion.div
                            initial={{ rotate: -5 }}
                            animate={{ rotate: 5 }}
                            transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.5, ease: "easeInOut" }}
                            style={{ transformOrigin: "top center" }}
                            className="hidden md:flex absolute top-full left-1/2 -translate-x-1/2 mt-2 flex-col gap-3 p-5 glass-card border-pippin/30 z-50 w-56 text-left before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-2 before:bg-white/20"
                        >
                            <div className="flex items-center gap-2 text-pippin">
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Recovery Team</span>
                            </div>
                            <p className="text-[9px] font-bold text-white/50 leading-relaxed normal-case tracking-normal font-sans">
                                Having a big losing streak? We can help you build it back.
                            </p>
                            <a href="#recovery" className="w-full">
                                <button className="w-full py-2 bg-pippin/10 border border-pippin/20 text-pippin text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-pippin hover:text-black transition-all font-sans">
                                    Initiate Rescue
                                </button>
                            </a>
                        </motion.div>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 font-medium"
                >
                    PiptoPip combines automated trading tools with premium mentorship and strict copytrading. Whether you are a beginner or looking to recover losses—we protect your account.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <a href="#services">
                        <button className="btn-primary flex items-center gap-3">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </button>
                    </a>
                    <button className="group flex items-center gap-4 px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pippin transition-colors">
                            <Play className="w-4 h-4 text-white group-hover:text-black fill-current" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/70">Watch Vision</span>
                    </button>
                </motion.div>


            </div>

            {/* Background Orbs */}
            <div className="glow-orb top-[20%] right-[10%] w-[400px] h-[400px] bg-pippin/10" />
            <div className="glow-orb bottom-[10%] left-[5%] w-[500px] h-[500px] bg-cyber/10" />
        </section>
    );
}
