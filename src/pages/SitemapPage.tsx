import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function SitemapPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">Sitemap</h1>
                <div className="grid md:grid-cols-2 gap-8 text-white/70 text-sm leading-relaxed">

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Main Pages</h2>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-pippin transition-colors">Home / Landing Page</Link></li>
                            <li><Link to="/dashboard" className="hover:text-pippin transition-colors">Client Dashboard</Link></li>
                            <li><Link to="/#services" className="hover:text-pippin transition-colors">Services Overview</Link></li>
                            <li><Link to="/#pricing" className="hover:text-pippin transition-colors">Copytrading Pricing</Link></li>
                            <li><Link to="/#recovery" className="hover:text-pippin transition-colors">Capital Recovery</Link></li>
                            <li><Link to="/#education" className="hover:text-pippin transition-colors">PipForge Academy</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Company & Legal</h2>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-pippin transition-colors">About Us</Link></li>
                            <li><Link to="/faq" className="hover:text-pippin transition-colors">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-pippin transition-colors">Contact Support</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-pippin transition-colors">14-Day Refund Policy</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-pippin transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/disclaimer" className="hover:text-pippin transition-colors">Risk Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
