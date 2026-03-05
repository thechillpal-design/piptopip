import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FaqPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">Frequently Asked Questions</h1>
                <div className="space-y-8 text-white/70 text-sm leading-relaxed">

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">How does the Copytrading system work?</h3>
                        <p>Our copytrading system securely mirrors the trades executed by our master accounts directly to your personal brokerage account. You retain full control over your funds, while our algorithms and professional traders manage the entries and exits.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Do I need to give you my trading password?</h3>
                        <p>We require the master password for our secure VPS systems to place trades directly on your MT4/MT5/cTrader platforms. However, your broker login credentials for deposits and withdrawals remain entirely private.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">What is the Capital Recovery Program?</h3>
                        <p>If you are currently facing a massive drawdown or have lost significant capital, our engineering team will intervene. We analyze your floating positions and deploy specialized EAs designed specifically to hedge and recover negative balances safely.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Are the EAs customizable?</h3>
                        <p>Yes. If you choose our Custom Automation service, our developers will build an Expert Advisor tailored exactly to your unique trading strategy, complete with specific risk management parameters.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">How quickly are Custom EAs delivered?</h3>
                        <p>EA development times vary significantly based on project complexity. Standard algorithms check in at 7 days or less, while highly advanced, custom-scoped projects can require ongoing development spanning 6 to 12 months or more.</p>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
