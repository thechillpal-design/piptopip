import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { Lock, FileUp, Loader2, CheckCircle2, Shield, Code2, Copy, Mail, Activity, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PurchaseFulfillment {
    id: string;
    user_id: string;
    product_name: string;
    product_type: string;
    created_at: string;
}

interface CustomBuildFulfillment {
    id: string;
    user_id: string;
    title: string;
    build_type: string;
    status: string;
    created_at: string;
}

interface CopytradingAccount {
    id: string;
    user_id: string;
    broker_name: string;
    account_number: string;
    platform: string;
    status: string;
    created_at: string;
}

interface RecoveryRequest {
    id: string;
    user_id: string;
    broker_name: string;
    account_number: string;
    platform: string;
    balance: number;
    drawdown_percentage: number;
    status: string;
    created_at: string;
}

interface NewsletterLead {
    id: string;
    email: string;
    created_at: string;
}

export default function AdminHub() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Security
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);

    // Data
    const [purchases, setPurchases] = useState<PurchaseFulfillment[]>([]);
    const [customBuilds, setCustomBuilds] = useState<CustomBuildFulfillment[]>([]);
    const [copyAccounts, setCopyAccounts] = useState<CopytradingAccount[]>([]);
    const [recoveries, setRecoveries] = useState<RecoveryRequest[]>([]);
    const [leads, setLeads] = useState<NewsletterLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'fulfillments' | 'copytrading' | 'recovery' | 'leads'>('fulfillments');

    // File Upload State mapping { id: File }
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch unfulfilled standard algorithms
            const { data: purData } = await supabase
                .from('user_purchases')
                .select('*')
                .neq('product_type', 'Copytrading')
                .or('download_url.eq.https://example.com/secure-download,download_url.is.null');

            if (purData) setPurchases(purData);

            // Fetch pending custom requests
            const { data: cbData } = await supabase
                .from('custom_build_requests')
                .select('*')
                .neq('status', 'completed');

            if (cbData) setCustomBuilds(cbData);

            // Fetch copytrading accounts
            const { data: cpData } = await supabase
                .from('copytrading_accounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (cpData) setCopyAccounts(cpData);

            // Fetch recovery requests
            const { data: recData } = await supabase
                .from('recovery_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (recData) setRecoveries(recData);

            // Fetch leads
            const { data: leadsData } = await supabase
                .from('newsletter_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (leadsData) setLeads(leadsData);

            setLoading(false);
        };

        fetchData();
    }, [isAuthenticated]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Super secret hardcoded PIN for the demonstration
        if (pin === '8888') {
            setIsAuthenticated(true);
        } else {
            setPinError(true);
            setTimeout(() => setPinError(false), 2000);
            setPin('');
        }
    };

    const handleFileSelect = (id: string, file: File | null) => {
        if (!file) return;
        setSelectedFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleFulfillPurchase = async (id: string, userId: string) => {
        const file = selectedFiles[id];
        if (!file) return;

        setUploadingId(id);
        try {
            // Upload to storage
            const fileExt = file.name.split('.').pop();
            const filePath = `algorithms/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('custom_builds')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL since Dashboard user_purchases expects a direct URL
            const { data: publicUrlData } = supabase.storage
                .from('custom_builds')
                .getPublicUrl(filePath);

            // Update Database
            const { error: dbError } = await supabase
                .from('user_purchases')
                .update({ download_url: publicUrlData.publicUrl })
                .eq('id', id);

            if (dbError) throw dbError;

            // Remove from list
            setPurchases(prev => prev.filter(p => p.id !== id));
            // Remove from selected files
            setSelectedFiles(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });

        } catch (err) {
            console.error('Fulfillment error:', err);
            alert('Failed to fulfill order. Check console.');
        } finally {
            setUploadingId(null);
        }
    };

    const handleFulfillCustom = async (id: string, userId: string) => {
        const file = selectedFiles[id];
        if (!file) return;

        setUploadingId(id);
        try {
            // Upload to storage
            const fileExt = file.name.split('.').pop();
            const filePath = `custom_deliveries/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('custom_builds')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Update Database with path (Dashboard handles signed URLs for custom bounds)
            const { error: dbError } = await supabase
                .from('custom_build_requests')
                .update({
                    status: 'completed',
                    delivery_file_path: filePath
                })
                .eq('id', id);

            if (dbError) throw dbError;

            // Remove from list
            setCustomBuilds(prev => prev.filter(cb => cb.id !== id));
            setSelectedFiles(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });

        } catch (err) {
            console.error('Fulfillment error:', err);
            alert('Failed to fulfill custom bot. Check console.');
        } finally {
            setUploadingId(null);
        }
    };

    const updateCopytradingStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('copytrading_accounts')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setCopyAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update status.');
        }
    };

    const updateRecoveryStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('recovery_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRecoveries(prev => prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update recovery status.');
        }
    };

    if (authLoading) return <div className="min-h-screen bg-[#0A0A0A]" />;

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Access Denied</h2>
                    <p className="text-white/50 text-sm mb-6">You must be logged in as an administrator to view this page.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-colors font-bold text-sm">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pippin/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-full max-w-sm glass-panel p-8 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-pippin/10 border border-pippin/20 flex flex-col items-center justify-center text-pippin mx-auto mb-6">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-center text-white uppercase tracking-tighter mb-2">Admin Portal</h2>
                    <p className="text-xs text-center text-white/50 mb-8 font-medium">Enter your secure PIN to access master fulfillment controls.</p>

                    <form onSubmit={handlePinSubmit}>
                        <div className="flex justify-center gap-2 mb-8">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`w-12 h-14 rounded-xl border flex items-center justify-center text-xl font-black transition-colors ${pin.length > i ? 'bg-pippin text-black border-pippin' : 'bg-white/5 border-white/10 text-transparent'} ${pinError ? 'border-red-500 bg-red-500/10' : ''}`}>
                                    {pin.length > i ? '*' : ''}
                                </div>
                            ))}
                        </div>
                        {/* Hidden input to capture typed PIN easily */}
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-text"
                            autoFocus
                        />
                        <button type="submit" className="w-full py-3 bg-white/10 text-white hover:bg-white hover:text-black font-black uppercase tracking-widest rounded-xl transition-all text-xs border border-white/10">
                            Authenticate
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <span className="text-[9px] text-white/30 uppercase tracking-widest">Master PIN required</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-white/10 pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pippin/10 border border-pippin/20 mb-4 text-pippin">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Master Control</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Portal</h1>
                        <p className="text-sm text-white/50 mt-1">Manage network fulfillments, operations, and leads.</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        Exit Admin
                    </button>
                </header>

                <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('fulfillments')}
                        className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'fulfillments' ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <FileUp className="w-4 h-4" /> Fulfillments
                    </button>
                    <button
                        onClick={() => setActiveTab('copytrading')}
                        className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'copytrading' ? 'bg-pippin text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Copy className="w-4 h-4" /> Copytrading
                    </button>
                    <button
                        onClick={() => setActiveTab('recovery')}
                        className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'recovery' ? 'bg-[#9900FF] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <ShieldAlert className="w-4 h-4" /> Capital Recovery
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'bg-cyber text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Mail className="w-4 h-4" /> Newsletter Leads
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-pippin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'fulfillments' && (
                            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">

                                {/* STANDARD PURCHASES (ALGORITHMS) */}
                                <div className="glass-card p-6 border-white/5">
                                    <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        <FileUp className="w-5 h-5 text-cyber" /> Pending Algorithm Orders
                                        <span className="text-xs bg-cyber/20 text-cyber px-2 py-1 rounded-full">{purchases.length}</span>
                                    </h2>

                                    {purchases.length === 0 ? (
                                        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                            <p className="text-xs text-white/40 uppercase tracking-widest font-black">All Orders Fulfilled</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {purchases.map(p => (
                                                <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-sm font-black uppercase text-white">{p.product_name}</h3>
                                                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-1">Order: {p.id.split('-')[0]}</p>
                                                        </div>
                                                        <span className="text-[9px] font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">
                                                            Action Required
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="file"
                                                            accept=".ex4,.ex5,.zip"
                                                            onChange={(e) => handleFileSelect(p.id, e.target.files?.[0] || null)}
                                                            className="flex-1 text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-colors file:cursor-pointer bg-[#111111] rounded-lg p-1"
                                                        />
                                                        <button
                                                            onClick={() => handleFulfillPurchase(p.id, p.user_id)}
                                                            disabled={!selectedFiles[p.id] || uploadingId === p.id}
                                                            className="shrink-0 px-6 py-2 bg-cyber text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                                        >
                                                            {uploadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deliver'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CUSTOM EA REQUESTS */}
                                <div className="glass-card p-6 border-white/5">
                                    <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        <Code2 className="w-5 h-5 text-pippin" /> Pending Custom Builds
                                        <span className="text-xs bg-pippin/20 text-pippin px-2 py-1 rounded-full">{customBuilds.length}</span>
                                    </h2>

                                    {customBuilds.length === 0 ? (
                                        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                            <p className="text-xs text-white/40 uppercase tracking-widest font-black">All Builds Delivered</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {customBuilds.map(cb => (
                                                <div key={cb.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-sm font-black uppercase text-white">{cb.title}</h3>
                                                                {cb.status === 'paid_reviewing' && (
                                                                    <span className="text-[8px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Priority</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">{cb.build_type}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${cb.status === 'paid_reviewing' ? 'bg-pippin/20 text-pippin border-pippin/20' :
                                                            'bg-blue-500/20 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {cb.status.replace('_', ' ')}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="file"
                                                            accept=".ex4,.ex5,.zip"
                                                            onChange={(e) => handleFileSelect(cb.id, e.target.files?.[0] || null)}
                                                            className="flex-1 text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-colors file:cursor-pointer bg-[#111111] rounded-lg p-1"
                                                        />
                                                        <button
                                                            onClick={() => handleFulfillCustom(cb.id, cb.user_id)}
                                                            disabled={!selectedFiles[cb.id] || uploadingId === cb.id}
                                                            className="shrink-0 px-6 py-2 bg-pippin text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                                        >
                                                            {uploadingId === cb.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deliver'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'copytrading' && (
                            <div className="glass-card p-6 border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Copy className="w-5 h-5 text-pippin" /> Copytrading Accounts
                                </h2>

                                {copyAccounts.length === 0 ? (
                                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                        <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-black">No Accounts Connected</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {copyAccounts.map(cp => (
                                            <div key={cp.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-white tracking-widest">{cp.broker_name} - {cp.account_number}</h3>
                                                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Platform: {cp.platform} | User: {cp.user_id.substring(0, 8)}...</p>
                                                </div>

                                                <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-lg border border-white/5">
                                                    <button
                                                        onClick={() => updateCopytradingStatus(cp.id, 'pending')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${cp.status === 'pending' ? 'bg-yellow-500 text-black' : 'text-white/40 hover:text-yellow-500'}`}
                                                    >
                                                        Pending
                                                    </button>
                                                    <button
                                                        onClick={() => updateCopytradingStatus(cp.id, 'active')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${cp.status === 'active' ? 'bg-green-500 text-black' : 'text-white/40 hover:text-green-500'}`}
                                                    >
                                                        Active
                                                    </button>
                                                    <button
                                                        onClick={() => updateCopytradingStatus(cp.id, 'disabled')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${cp.status === 'disabled' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-red-500'}`}
                                                    >
                                                        Disabled
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'recovery' && (
                            <div className="glass-card p-6 border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5 text-[#9900FF]" /> Capital Recovery Requests
                                </h2>

                                {recoveries.length === 0 ? (
                                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                        <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-black">No Recovery Requests</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {recoveries.map(rec => (
                                            <div key={rec.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-black uppercase text-white tracking-widest">{rec.broker_name} - {rec.account_number}</h3>
                                                        <span className="text-[10px] bg-[#9900FF]/20 text-[#9900FF] px-2 py-0.5 rounded font-bold">{rec.drawdown_percentage}% DD</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Platform: {rec.platform} | Balance: ${rec.balance.toLocaleString()} | User: {rec.user_id.substring(0, 8)}...</p>
                                                </div>

                                                <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-lg border border-white/5">
                                                    <button
                                                        onClick={() => updateRecoveryStatus(rec.id, 'pending')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${rec.status === 'pending' || !rec.status ? 'bg-yellow-500 text-black' : 'text-white/40 hover:text-yellow-500'}`}
                                                    >
                                                        Pending
                                                    </button>
                                                    <button
                                                        onClick={() => updateRecoveryStatus(rec.id, 'active')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${rec.status === 'active' ? 'bg-green-500 text-black' : 'text-white/40 hover:text-green-500'}`}
                                                    >
                                                        Active
                                                    </button>
                                                    <button
                                                        onClick={() => updateRecoveryStatus(rec.id, 'disabled')}
                                                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors ${rec.status === 'disabled' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-red-500'}`}
                                                    >
                                                        Disabled
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'leads' && (
                            <div className="glass-card p-6 border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-cyber" /> Newsletter Subscribers
                                    <span className="text-xs bg-cyber/20 text-cyber px-2 py-1 rounded-full">{leads.length}</span>
                                </h2>

                                {leads.length === 0 ? (
                                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                        <Mail className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-black">No Subscribers Yet</p>
                                    </div>
                                ) : (
                                    <div className="bg-[#111111] border border-white/10 rounded-xl overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Email Address</th>
                                                    <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Subscribed Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leads.map(lead => (
                                                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="p-4 text-sm font-bold text-white border-r border-white/5">{lead.email}</td>
                                                        <td className="p-4 text-[10px] tracking-widest uppercase text-white/60">
                                                            {new Date(lead.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
