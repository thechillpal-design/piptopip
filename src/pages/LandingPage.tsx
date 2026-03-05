import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HeroBackground from '../components/HeroBackground';
import Services from '../components/Services';
import RecoverySection from '../components/RecoverySection';
import TheVault from '../components/TheVault';
import Footer from '../components/Footer';
import PricingCopytrading from '../components/PricingCopytrading';
import PricingRecovery from '../components/PricingRecovery';
import AutomationRequest from '../components/AutomationRequest';
import PipForgeAcademy from '../components/PipForgeAcademy';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../lib/useAuth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const { user } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <div className="relative w-full min-h-screen">
            {/* 3D Kinetic Background stays behind everything */}
            <HeroBackground />

            <div className="relative z-10">
                <Navbar />
                <Hero />

                <main>
                    <Services />

                    {/* Section Divider - Abstract Line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Copytrading Pricing */}
                    <PricingCopytrading />

                    {/* Recovery is the centerpiece */}
                    <RecoverySection />

                    {/* Recovery Pricing */}
                    <PricingRecovery />

                    {/* EA Store (De-emphasized) */}
                    <TheVault />

                    {/* Custom Automation Builder Form */}
                    <AutomationRequest />

                    {/* Downloadable Materials */}
                    <PipForgeAcademy />

                    {/* Call to Action Section */}
                    <section className="py-32 px-6 flex items-center justify-center">
                        <div className="max-w-4xl w-full glass-panel p-16 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-full bg-pippin/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 italic">
                                    Ready to <span className="text-pippin">Forge</span> Your Edge?
                                </h2>
                                <p className="text-white/40 mb-12 font-medium uppercase tracking-[0.2em] text-[10px]">
                                    Join the Piptopip ecosystem today and start trading with confidence.
                                </p>
                                {user ? (
                                    <Link to="/dashboard">
                                        <button className="btn-primary scale-110">
                                            Open Dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <button onClick={() => setIsAuthOpen(true)} className="btn-primary scale-110">
                                        Join the Network
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            {/* Global Mouse Glow Effect */}
            <div className="fixed inset-0 pointer-events-none z-[999] opacity-20 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),#F97316_0%,transparent_50%)]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                }}
            />
        </div>
    );
}
