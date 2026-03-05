import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DisclaimerPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">Risk Disclaimer</h1>
                <div className="prose prose-invert prose-sm max-w-none text-white/70 space-y-6 text-sm leading-relaxed">
                    <p>
                        Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to invest in foreign exchange you should carefully consider your investment objectives, level of experience, and risk appetite.
                    </p>
                    <p>
                        The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with foreign exchange trading and seek advice from an independent financial advisor if you have any doubts.
                    </p>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4">No Financial Advice</h2>
                    <p>
                        Any opinions, news, research, analyses, prices, or other information contained on this website or provided by Piptopip and its affiliates are provided as general market commentary and do not constitute investment advice. Piptopip will not accept liability for any loss or damage, including without limitation to, any loss of profit, which may arise directly or indirectly from use of or reliance on such information.
                    </p>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Automated Systems</h2>
                    <p>
                        Past performance of any trading system or methodology is not necessarily indicative of future results. Hypothetical or simulated performance results have certain inherent limitations. Unlike an actual performance record, simulated results do not represent actual trading. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
