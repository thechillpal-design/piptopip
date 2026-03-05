import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">About Piptopip</h1>
                <div className="prose prose-invert prose-sm max-w-none text-white/70 space-y-6 text-sm leading-relaxed">
                    <p>
                        Welcome to Piptopip, a premier trading ecosystem designed for traders, by traders. Our mission is to provide an institutional-grade experience for retail traders, providing the tools, education, and automated systems necessary to conquer the financial markets.
                    </p>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Our Vision</h2>
                    <p>
                        We believe in transparency and absolute performance. Piptopip bridges the gap between manual trading struggles and algorithmic precision. Our network serves hundreds of ambitious individuals, granting them access to advanced Expert Advisors (EAs), custom indicator builds, and automated copytrading that actively targets high yields with monitored drawdowns.
                    </p>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Capital Protection & Recovery</h2>
                    <p>
                        One of our core pillars is capital preservation. We understand that drawdowns happen. That's why our specialized Recovery Team exists—to help traders mitigate losses, restructure their risk frameworks, and steadily climb back to profitability. Over the years, we have successfully managed and recovered millions in collective capital.
                    </p>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Join The Network</h2>
                    <p>
                        Piptopip isn't just a service; it is a community of driven market participants. Through our educational material (PipForge Academy), direct mentorship via 1-on-1 consultations, and our suite of passive income systems, we empower our users to secure their financial independence.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
