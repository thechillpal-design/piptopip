import { Menu, X, Shield, Cpu, GraduationCap, Users, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from '../lib/useAuth';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Elite Copytrading', icon: Users, href: '#copytrading' },
        { name: 'Capital Recovery', icon: Shield, href: '#recovery' },
        { name: 'Automation Systems', icon: Cpu, href: '#automation' },
        { name: 'PipForge Academy', icon: GraduationCap, href: '#education' },
    ];

    const { user, signOut } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-4 border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pippin rounded-lg flex items-center justify-center">
                        <span className="text-black font-black text-xl">P</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic">
                        Pip<span className="text-pippin">to</span>Pip
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-pippin transition-colors"
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </a>
                    ))}

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-white/80">{user.email}</span>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/dashboard"
                                    className="p-2 bg-white/5 text-white/90 rounded-lg hover:text-black hover:bg-pippin transition-all font-bold tracking-widest text-[10px] uppercase flex items-center gap-2 border border-white/5"
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <button
                                    onClick={signOut}
                                    className="p-2 text-white/30 rounded-lg hover:text-pippin transition-all font-bold tracking-widest text-[10px] uppercase border border-transparent"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-pippin transition-all"
                        >
                            Join Now
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-28 left-6 right-6 glass-panel p-8 md:hidden animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="flex items-center gap-4 text-lg font-bold uppercase tracking-widest"
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon className="w-6 h-6 text-pippin" />
                                {link.name}
                            </a>
                        ))}
                        {user ? (
                            <>
                                <Link onClick={() => setIsOpen(false)} to="/dashboard" className="w-full py-4 text-black bg-pippin font-black uppercase tracking-widest rounded-xl hover:bg-white flex justify-center items-center gap-2 transition-colors">
                                    <LayoutDashboard className="w-5 h-5" /> Open Dashboard
                                </Link>
                                <button onClick={() => { signOut(); setIsOpen(false); }} className="w-full py-4 text-white font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/5 flex justify-center items-center gap-2 transition-colors">
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </>
                        ) : (
                            <button onClick={() => { setIsAuthOpen(true); setIsOpen(false); }} className="w-full py-4 bg-pippin text-black font-black uppercase tracking-widest rounded-xl">
                                Join Now
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </nav>
    );
}
