import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RefundPolicyPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">14-Day Refund Policy</h1>
                <div className="prose prose-invert prose-sm max-w-none text-white/70 space-y-6 text-sm leading-relaxed">
                    <p>
                        At Piptopip, we stand by the quality of our automated systems, educational courses, and custom development services. However, we understand that specific circumstances may arise.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Digital Products & Courses</h2>
                    <p>
                        We offer a 14-day money-back guarantee for all digital courses and introductory EAs, provided you have not downloaded more than 20% of the material or activated the software license on a live server. If you are unsatisfied, please contact support within 14 days of purchase.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Copytrading & Recovery Services</h2>
                    <p>
                        Performance-based services such as Copytrading and Capital Recovery are strictly non-refundable once the connection matrix has been established and trades have been executed. Financial markets carry inherent risks, and past performance does not guarantee future results. By subscribing to these ongoing services, you acknowledge and accept these terms.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Custom EA Development</h2>
                    <p>
                        Refunds for custom algorithm development are assessed on a case-by-case basis. If the project is canceled before the initial code compilation, a full refund will be issued. If the project is in the testing or final delivery phase, partial or no refunds will be provided based on the developer hours already committed.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">How to Request a Refund</h2>
                    <p>
                        Please reach out to our support team at <strong className="text-white">support@piptopip.com</strong> with your order ID and the reason for your request. Our team will review your application and respond within 24-48 business hours.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
