import { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabase';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, LogOut, CheckCircle2, ShieldAlert, Clock, LayoutDashboard, Copy, Shield, Download, AlertTriangle, Send, Loader2, Code2, ChevronRight, Calendar } from 'lucide-react';
import CopytradingForm from '../components/CopytradingForm';
import AutomationRequest from '../components/AutomationRequest';
import ConsultationModal from '../components/ConsultationModal';

interface CopytradingAccount {
    id: string;
    broker_name: string;
    account_number: string;
    platform: string;
    status: string;
    subscription_tier: string;
}

interface RecoveryRequest {
    id: string;
    broker_name: string;
    account_number: string;
    platform: string;
    drawdown_percentage: number;
    balance: number;
    status: string;
}

interface UserPurchase {
    id: string;
    product_name: string;
    product_type: string;
    download_url: string;
    created_at: string;
}

interface CustomBuildRequest {
    id: string;
    build_type: string;
    title: string;
    description: string;
    status: string;
    delivery_file_path: string | null;
    created_at: string;
}

interface Consultation {
    id: string;
    date: string;
    time_slot: string;
    contact_method: string;
    notes: string;
    status: string;
}

export default function Dashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // States
    const [accounts, setAccounts] = useState<CopytradingAccount[]>([]);
    const [recoveries, setRecoveries] = useState<RecoveryRequest[]>([]);
    const [purchases, setPurchases] = useState<UserPurchase[]>([]);
    const [customBuilds, setCustomBuilds] = useState<CustomBuildRequest[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'recovery' | 'downloads' | 'custombuilds' | 'consultations'>(
        (searchParams.get('tab') as any) || 'overview'
    );
    const [showConnectForm, setShowConnectForm] = useState(searchParams.get('action') === 'connect');
    const [showCustomBuildForm, setShowCustomBuildForm] = useState(false);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

    // Recovery Form States
    const [recoveryForm, setRecoveryForm] = useState({
        broker_name: '',
        account_number: '',
        platform: 'MT4',
        password: '',
        balance: '',
        drawdown_percentage: ''
    });
    const [submittingRecovery, setSubmittingRecovery] = useState(false);
    const [recoveryError, setRecoveryError] = useState<string | null>(null);
    const [recoverySuccess, setRecoverySuccess] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            const [accRes, recRes, purRes, buildsRes, consRes] = await Promise.all([
                supabase.from('copytrading_accounts').select('*').eq('user_id', user.id),
                supabase.from('recovery_requests').select('*').eq('user_id', user.id),
                supabase.from('user_purchases').select('*').eq('user_id', user.id),
                supabase.from('custom_build_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('consultations').select('*').eq('user_id', user.id).order('date', { ascending: true })
            ]);

            if (!accRes.error && accRes.data) setAccounts(accRes.data);
            if (!recRes.error && recRes.data) setRecoveries(recRes.data);
            if (!purRes.error && purRes.data) setPurchases(purRes.data);
            if (!buildsRes.error && buildsRes.data) setCustomBuilds(buildsRes.data);
            if (!consRes.error && consRes.data) setConsultations(consRes.data);

            setLoading(false);
        };

        fetchDashboardData();

        // Setup real-time listeners
        const recoverySub = supabase.channel('recovery_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recovery_requests' }, _payload => {
                fetchDashboardData();
            }).subscribe();

        const copySub = supabase.channel('copytrading_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'copytrading_accounts' }, _payload => {
                fetchDashboardData();
            }).subscribe();

        return () => {
            supabase.removeChannel(recoverySub);
            supabase.removeChannel(copySub);
        };
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const submitRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const numDrawdown = parseFloat(recoveryForm.drawdown_percentage);
        const numBalance = parseFloat(recoveryForm.balance);

        if (isNaN(numDrawdown) || numDrawdown <= 0 || numDrawdown > 100) {
            setRecoveryError("Please enter a valid drawdown percentage.");
            return;
        }
        if (isNaN(numBalance) || numBalance <= 0) {
            setRecoveryError("Please enter a valid numeric account balance.");
            return;
        }

        setSubmittingRecovery(true);
        setRecoveryError(null);
        setRecoverySuccess(false);

        try {
            const { error: sbError } = await supabase.from('recovery_requests').insert({
                user_id: user.id,
                broker_name: recoveryForm.broker_name,
                account_number: recoveryForm.account_number,
                platform: recoveryForm.platform,
                account_password: recoveryForm.password,
                balance: numBalance,
                drawdown_percentage: numDrawdown
            });

            if (sbError) throw sbError;

            setRecoverySuccess(true);
            setRecoveryForm({
                broker_name: '',
                account_number: '',
                platform: 'MT4',
                password: '',
                balance: '',
                drawdown_percentage: ''
            });

            // Refresh table
            const { data } = await supabase.from('recovery_requests').select('*').eq('user_id', user.id);
            if (data) setRecoveries(data);

        } catch (err: any) {
            setRecoveryError(err.message || 'Failed to submit recovery request.');
        } finally {
            setSubmittingRecovery(false);
        }
    }

    const handleAccountSuccess = async () => {
        if (!user) return;
        const { data } = await supabase.from('copytrading_accounts').select('*').eq('user_id', user.id);
        if (data) setAccounts(data);
        setShowConnectForm(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] w-full flex items-center justify-center flex-col">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Securing Link...</span>
            </div>
        );
    }

    if (!user) return null;

    const downloadablePurchases = purchases.filter(p => p.product_type !== 'Copytrading');

    // Figure out Copytrading Account Limits based on user purchases
    const copytradingPurchases = purchases.filter(p => p.product_type === 'Copytrading');
    const purchasedPlans = copytradingPurchases.map(p => p.product_name.toLowerCase());

    let accountLimit = 0;
    let highestTier = 'Basic';
    if (purchasedPlans.some(p => p.includes('institutional'))) {
        accountLimit = Infinity;
        highestTier = 'Institutional';
    } else if (purchasedPlans.some(p => p.includes('pro'))) {
        accountLimit = 5;
        highestTier = 'Pro';
    } else if (purchasedPlans.some(p => p.includes('basic'))) {
        accountLimit = 1;
        highestTier = 'Basic';
    }

    const isLimitReached = accounts.length >= accountLimit;

    return (
        <div className="min-h-screen bg-[#0A0A0A] w-full flex flex-col md:flex-row font-sans text-white">

            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-64 bg-[#111111] md:border-r border-b md:border-b-0 border-white/5 flex flex-col z-10 shrink-0 sticky top-0 md:relative">
                <div className="hidden md:flex h-20 items-center px-6 border-b border-white/5 shrink-0">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-pippin/10 rounded-lg flex items-center justify-center border border-pippin/20 group-hover:bg-pippin/20 transition-all">
                            <span className="text-pippin font-black text-xl">P</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic text-white/90">
                            Pip<span className="text-pippin">to</span>Pip
                        </span>
                    </Link>
                </div>

                <div className="flex flex-row md:flex-col p-2 md:p-4 gap-2 overflow-x-auto md:overflow-visible shrink-0 md:flex-1 w-full hide-scrollbar no-scrollbar">
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/30 px-4 mb-2 mt-4">Menu</span>

                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-4 h-4 hidden md:block" /> Accounts
                    </button>

                    <button
                        onClick={() => setActiveTab('recovery')}
                        className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'recovery' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Shield className="w-4 h-4 hidden md:block" /> Recovery
                    </button>

                    <button
                        onClick={() => setActiveTab('downloads')}
                        className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'downloads' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Download className="w-4 h-4 hidden md:block" /> Downloads
                    </button>

                    <button
                        onClick={() => setActiveTab('custombuilds')}
                        className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'custombuilds' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Code2 className="w-4 h-4 hidden md:block" /> Custom EA
                    </button>

                    <button
                        onClick={() => setActiveTab('consultations')}
                        className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'consultations' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar className="w-4 h-4 hidden md:block" /> Advisory
                    </button>
                </div>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex flex-col truncate pr-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Logged in</span>
                            <span className="text-xs font-bold text-white/80 truncate">{user.email}</span>
                        </div>
                        <button onClick={handleSignOut} className="p-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-md transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
                    <h1 className="text-xl font-black uppercase tracking-widest">
                        {activeTab === 'overview' ? 'Your Accounts' : activeTab === 'recovery' ? 'Capital Recovery' : activeTab === 'downloads' ? 'My Downloads' : activeTab === 'custombuilds' ? 'Custom EA Requests' : 'Upcoming Consultations'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <ChevronLeft className="w-4 h-4" /> Return to Site
                        </Link>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyber/10 text-cyber rounded-xl flex items-center justify-center border border-cyber/20">
                                        <Copy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Connected Accounts</h2>
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Manage the trading accounts you've submitted</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {accountLimit > 0 && (
                                        <div className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-white/30 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                                            Limit: {accounts.length} / {accountLimit === Infinity ? 'Unlimited' : accountLimit}
                                        </div>
                                    )}
                                    {!showConnectForm && accountLimit > 0 && !isLimitReached && (
                                        <button
                                            onClick={() => setShowConnectForm(true)}
                                            className="hidden sm:block bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all border border-white/20 hover:border-white">
                                            + Connect New
                                        </button>
                                    )}
                                    {!showConnectForm && accountLimit > 0 && isLimitReached && (
                                        <div className="hidden sm:block bg-white/5 text-white/30 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl border border-white/5 cursor-not-allowed">
                                            Limit Reached
                                        </div>
                                    )}
                                    {showConnectForm && (
                                        <button
                                            onClick={() => setShowConnectForm(false)}
                                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all border border-red-500/20 hover:border-red-500">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showConnectForm && accountLimit > 0 && !isLimitReached ? (
                                <CopytradingForm userTier={highestTier} onSuccess={handleAccountSuccess} />
                            ) : loading ? (
                                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching Network Data
                                    </span>
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-pippin/5 blur-3xl rounded-full pointer-events-none" />
                                    <AlertTriangle className="w-10 h-10 text-white/20 mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Active Connections</h3>
                                    {accountLimit === 0 ? (
                                        <>
                                            <p className="text-sm text-white/50 max-w-md mb-8">You need an active Copytrading plan to securely connect a broker.</p>
                                            <a href="/#copytrading" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all">
                                                View Plans
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-white/50 max-w-md mb-8">You haven't requested to connect any MT4 or MT5 accounts yet.</p>
                                            <button onClick={() => setShowConnectForm(true)} className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all">
                                                Connect an Account
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Broker Name</span>
                                                    <strong className="text-lg uppercase tracking-tighter font-black text-white">{acc.broker_name}</strong>
                                                </div>

                                                {acc.status.toLowerCase() === 'active' || acc.status.toLowerCase() === 'connected' ? (
                                                    <div className="px-3 py-1.5 flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Active
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1.5 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" /> {acc.status}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-black/50 rounded-xl p-4 border border-white/5 mb-6">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account ID</span>
                                                    <span className="text-sm font-bold text-white/90 font-mono">{acc.account_number}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trading Platform</span>
                                                    <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-white tracking-widest uppercase">{acc.platform}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Subscription Plan</span>
                                                <span className="text-[10px] font-black text-cyber uppercase tracking-widest py-1 px-2 bg-cyber/10 rounded border border-cyber/20">{acc.subscription_tier}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* RECOVERY TAB */}
                    {activeTab === 'recovery' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Capital Recovery</h2>
                                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Submit accounts that need to recover out of severe drawdown</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-5 gap-8">
                                {/* Form Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full pointer-events-none" />
                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">New Recovery Request</h3>

                                        <form onSubmit={submitRecovery} className="space-y-5 relative z-10">

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Broker Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={recoveryForm.broker_name}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, broker_name: e.target.value })}
                                                        placeholder="e.g. IC Markets"
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Platform</label>
                                                    <select
                                                        value={recoveryForm.platform}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, platform: e.target.value })}
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors text-white"
                                                    >
                                                        <option value="MT4">METATRADER 4 (MT4)</option>
                                                        <option value="MT5">METATRADER 5 (MT5)</option>
                                                        <option value="cTrader">CTRADER</option>
                                                        <option value="Match-Trade">MATCH-TRADE</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Account Number</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={recoveryForm.account_number}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, account_number: e.target.value })}
                                                        placeholder="Enter account ID"
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Master Password</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={recoveryForm.password}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, password: e.target.value })}
                                                        placeholder="Trading password"
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Balance ($)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={recoveryForm.balance}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, balance: e.target.value })}
                                                        placeholder="e.g. 5000"
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Drawdown %</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={recoveryForm.drawdown_percentage}
                                                        onChange={(e) => setRecoveryForm({ ...recoveryForm, drawdown_percentage: e.target.value })}
                                                        placeholder="e.g. 45"
                                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            {recoveryError && (
                                                <div className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                                                    {recoveryError}
                                                </div>
                                            )}

                                            {recoverySuccess && (
                                                <div className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                    Recovery request submitted successfully. We will review it shortly.
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={submittingRecovery}
                                                className="w-full mt-2 py-4 bg-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-red-500/30"
                                            >
                                                {submittingRecovery ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                    <>Submit Request <Send className="w-4 h-4" /></>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="lg:col-span-3">
                                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 md:p-8 min-h-full">
                                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Active Recovery Requests</h3>

                                        {loading ? (
                                            <div className="h-32 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                                            </div>
                                        ) : recoveries.length === 0 ? (
                                            <div className="h-48 flex flex-col items-center justify-center text-center">
                                                <Shield className="w-8 h-8 text-white/10 mb-3" />
                                                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">No recovery requests currently active</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recoveries.map(rec => (
                                                    <div key={rec.id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                                <span className="text-red-500 font-black text-xs">{rec.drawdown_percentage}%</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black uppercase tracking-widest text-white">{rec.broker_name}</div>
                                                                <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">Acct: {rec.account_number} • Bal: ${rec.balance}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Platform</span>
                                                                <span className="text-xs font-bold text-white/80 uppercase mt-0.5">{rec.platform}</span>
                                                            </div>
                                                            <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${rec.status.toLowerCase() === 'recovered' || rec.status.toLowerCase() === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                                rec.status.toLowerCase() === 'in-progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                                    'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                                                }`}>
                                                                {rec.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'downloads' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/20">
                                    <Download className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">My Files</h2>
                                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Download your purchased algorithms and courses</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching Purchases
                                    </span>
                                </div>
                            ) : downloadablePurchases.length === 0 ? (
                                <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
                                    <ShieldAlert className="w-10 h-10 text-white/20 mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Active Purchases</h3>
                                    <p className="text-sm text-white/50 max-w-md mb-8">You haven't purchased any algorithms or courses yet.</p>
                                    <a href="/#services" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all">
                                        View Products
                                    </a>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {downloadablePurchases.map(purchase => (
                                        <div key={purchase.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full pointer-events-none" />
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">{purchase.product_type}</span>
                                                    <strong className="text-lg uppercase tracking-tighter font-black text-white leading-tight">{purchase.product_name}</strong>
                                                </div>
                                            </div>
                                            <a
                                                href={purchase.download_url || '#'}
                                                target={purchase.download_url ? "_blank" : "_self"}
                                                rel="noopener noreferrer"
                                                className={`mt-auto pt-6 border-t border-white/5 flex items-center justify-between transition-colors ${purchase.download_url ? 'group-hover:text-white text-white/50' : 'text-white/20 cursor-not-allowed'}`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {purchase.download_url ? 'Download Access' : 'Processing Payment...'}
                                                </span>
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CUSTOM BUILDS TAB */}
                    {activeTab === 'custombuilds' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pippin/10 text-pippin rounded-xl flex items-center justify-center border border-pippin/20">
                                        <Code2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Custom EA Requests</h2>
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Status of your personal automation projects</p>
                                    </div>
                                </div>
                                {!showCustomBuildForm ? (
                                    <button onClick={() => setShowCustomBuildForm(true)} className="hidden sm:block bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all border border-white/20 hover:border-white">
                                        + New Request
                                    </button>
                                ) : (
                                    <button onClick={() => setShowCustomBuildForm(false)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all border border-red-500/20 hover:border-red-500">
                                        Cancel Request
                                    </button>
                                )}
                            </div>

                            {showCustomBuildForm ? (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <AutomationRequest isDashboard={true} />
                                </div>
                            ) : loading ? (
                                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching Projects
                                    </span>
                                </div>
                            ) : customBuilds.length === 0 ? (
                                <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-pippin/5 blur-3xl rounded-full pointer-events-none" />
                                    <Code2 className="w-10 h-10 text-white/20 mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Active Custom Builds</h3>
                                    <p className="text-sm text-white/50 max-w-md mb-8">You haven't requested any custom trading logic or indicators yet.</p>
                                    <button onClick={() => setShowCustomBuildForm(true)} className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all">
                                        Build A Robot
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {customBuilds.map(build => (
                                        <div key={build.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[9px] font-black bg-white/10 text-white px-2 py-1 rounded uppercase tracking-widest">{build.build_type}</span>
                                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{new Date(build.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-1">{build.title}</h3>
                                                <p className="text-xs text-white/50 font-medium max-w-2xl line-clamp-2">{build.description}</p>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0 gap-3">
                                                <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border 
                                                    ${build.status === 'pending_payment' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                        build.status === 'paid_reviewing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                            build.status === 'building' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                                build.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                                    'bg-white/5 border-white/10 text-white/50'
                                                    }`}
                                                >
                                                    {build.status.replace('_', ' ')}
                                                </div>

                                                {build.status === 'completed' && build.delivery_file_path && (
                                                    <button
                                                        onClick={async () => {
                                                            const { data } = await supabase.storage.from('custom_builds').createSignedUrl(build.delivery_file_path!, 3600);
                                                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                                        }}
                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-pippin hover:text-white transition-colors bg-pippin/10 px-4 py-2 rounded border border-pippin/20"
                                                    >
                                                        Download Delivery <Download className="w-3 h-3" />
                                                    </button>
                                                )}

                                                {build.status === 'pending_payment' && (
                                                    <Link
                                                        to={`/checkout?plan=${encodeURIComponent(`Custom Build: ${build.title}`)}&price=${encodeURIComponent('$9.99')}&type=Algorithm&requestId=${build.id}`}
                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                                                    >
                                                        Complete Checkout <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONSULTATIONS TAB */}
                    {activeTab === 'consultations' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-pippin/10 text-pippin rounded-xl flex items-center justify-center border border-pippin/20">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">My Consultations</h2>
                                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Scheduled calls with PiptoPip experts</p>
                                </div>
                                <button onClick={() => setIsConsultationModalOpen(true)} className="bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all border border-white/20 hover:border-white">
                                    + Book New Call
                                </button>
                            </div>

                            {loading ? (
                                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching Calls
                                    </span>
                                </div>
                            ) : consultations.length === 0 ? (
                                <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                                    <Calendar className="w-10 h-10 text-white/20 mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Scheduled Calls</h3>
                                    <p className="text-sm text-white/50 max-w-md mb-8">You haven't booked any expert consultation sessions yet.</p>
                                    <button onClick={() => setIsConsultationModalOpen(true)} className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pippin transition-all">
                                        Book Consultation
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {consultations.map(consultation => (
                                        <div key={consultation.id} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-full border border-pippin/20 bg-pippin/10 flex items-center justify-center text-pippin text-xs font-black shrink-0">
                                                    {new Date(consultation.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black uppercase tracking-tighter">{consultation.time_slot}</h3>
                                                    <p className="text-xs text-white/50 uppercase tracking-widest">Via {consultation.contact_method}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 justify-between md:justify-end border-t border-white/10 md:border-none pt-4 md:pt-0">
                                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${consultation.status === 'completed' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                                                    consultation.status === 'canceled' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                                                        'border-yellow-500/20 text-yellow-500 bg-yellow-500/10'
                                                    }`}>
                                                    {consultation.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <ConsultationModal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} />
        </div>
    );
}
