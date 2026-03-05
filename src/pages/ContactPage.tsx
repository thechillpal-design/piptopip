import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">Contact Support</h1>
                <p className="text-white/60 mb-12 text-sm leading-relaxed">
                    Our engineering and support teams are available 24/5 to assist you with trading setups, custom EA requests, and account recovery queries.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-pippin">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest">Email Support</h3>
                                <p className="text-sm text-white/50">support@piptopip.com</p>
                                <p className="text-xs text-white/40 mt-1">SLA: 12 Hours</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-pippin">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest">Live Telegram / Discord</h3>
                                <p className="text-sm text-white/50">@PiptopipOfficial</p>
                                <p className="text-xs text-white/40 mt-1">For urgent active-trade issues.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-pippin">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest">Headquarters</h3>
                                <p className="text-sm text-white/50">Global Remote Operation</p>
                                <p className="text-xs text-white/40 mt-1">Servers hosted in LD4 (London) & NY4 (New York)</p>
                            </div>
                        </div>
                    </div>

                    <form className="glass-card p-6 border-white/10 space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Name</label>
                            <input type="text" className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Email</label>
                            <input type="email" className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Message</label>
                            <textarea rows={4} className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50 resize-none" placeholder="How can we assist you today?"></textarea>
                        </div>
                        <button className="w-full py-3 bg-pippin text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
