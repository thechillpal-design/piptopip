import { useState } from 'react';
import { Bot, Code2, Cpu, ChevronRight, UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

export default function AutomationRequest({ isDashboard = false }: { isDashboard?: boolean }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('EA (Expert Advisor)');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async () => {
        if (!user) {
            setIsAuthOpen(true);
            return;
        }

        if (title.length < 3 || description.length < 10) {
            setError("Please provide a valid title and detailed logic description.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let uniqueFilePath = null;

            // 1. Upload File (if provided)
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('custom_builds')
                    .upload(`requests/${fileName}`, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    throw new Error("Failed to upload reference file.");
                }
                uniqueFilePath = uploadData.path;
            }

            // 2. Insert DB Record
            const { data: dbData, error: dbError } = await supabase.from('custom_build_requests').insert({
                user_id: user.id,
                build_type: type,
                title: title,
                description: description,
                reference_file_path: uniqueFilePath,
                status: 'pending_payment'
            }).select('id').single();

            if (dbError) {
                console.error("DB Insert error:", dbError);
                throw new Error("Failed to log request in database.");
            }

            // 3. Navigate to Checkout with requestId
            const checkoutUrl = `/checkout?plan=${encodeURIComponent(`Custom Build: ${title}`)}&price=${encodeURIComponent('$9.99')}&type=Algorithm&requestId=${dbData.id}`;
            navigate(checkoutUrl);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during submission.');
            setIsSubmitting(false);
        }
    };

    return (
        <section id={isDashboard ? undefined : "custom-builds"} className={isDashboard ? "relative" : "py-24 px-6 bg-[#0A0A0A] relative overflow-hidden"}>
            {!isDashboard && <div className="absolute top-0 right-0 w-96 h-96 bg-pippin/5 blur-3xl rounded-full pointer-events-none" />}

            <div className={`mx-auto grid ${isDashboard ? 'lg:grid-cols-1 w-full max-w-2xl' : 'lg:grid-cols-2 gap-20 max-w-7xl'} items-center relative z-10`}>

                {/* Information Side */}
                {!isDashboard && (
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pippin/10 border border-pippin/20 mb-8 text-pippin">
                            <Code2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Custom Development</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
                            Build Your <span className="text-white/20">Own</span><br />
                            Trading <span className="text-pippin inline-block italic glow-text">Robot</span>.
                        </h2>

                        <p className="text-lg text-white/50 mb-10 font-medium max-w-lg leading-relaxed">
                            Have a specific trading strategy you want to automate? Our engineering team builds custom Expert Advisors and Indicators tailored precisely to your rules.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 glass-card border-white/5">
                                <Bot className="w-6 h-6 text-pippin mb-4" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Expert Advisors (EA)</h4>
                                <p className="text-xs text-white/50 font-medium">Fully automated trading systems for MT4/MT5.</p>
                            </div>
                            <div className="p-6 glass-card border-white/5">
                                <Cpu className="w-6 h-6 text-cyber mb-4" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Custom Indicators</h4>
                                <p className="text-xs text-white/50 font-medium">Visual chart tools to spot your exact setups instantly.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Secure Form Side */}
                <div className="glass-panel p-8 md:p-10 relative">
                    <div className="mb-8">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">Project Request</h3>
                        <p className="text-xs font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                            Describe your logic below. A $9.99 Base Architecture Fee is required to review and architect your system prior to full project quoting.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Build Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pippin/50 appearance-none"
                            >
                                <option className="bg-[#111]">EA (Expert Advisor)</option>
                                <option className="bg-[#111]">Custom Indicator</option>
                                <option className="bg-[#111]">Trading Script</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Project Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Moving Average Breakout Bot"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-pippin/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Logic Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your entry rules, exit rules, risk management, and indicators used..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-pippin/50 transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Reference Files (Optional)</label>
                            <label className="w-full flex items-center justify-between bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-4 cursor-pointer hover:bg-white/10 hover:border-pippin/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-pippin/10 flex items-center justify-center text-pippin group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                                        {file ? file.name : 'Upload indicator or PDF...'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        {error && (
                            <div className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10">
                            {title.length > 3 ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-pippin text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...</>
                                    ) : (
                                        <>Pay Architect Fee ($9.99) <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            ) : (
                                <button type="button" disabled className="w-full py-4 bg-white/5 text-white/30 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed border border-white/10">
                                    Enter Project Details First
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber/5 blur-3xl rounded-full pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </section>
    );
}
