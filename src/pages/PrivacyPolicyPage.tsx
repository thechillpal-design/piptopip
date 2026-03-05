import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#0A0A0A] text-white font-sans">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-pippin">Privacy Policy</h1>
                <div className="prose prose-invert prose-sm max-w-none text-white/70 space-y-6 text-sm leading-relaxed">
                    <p>
                        At Piptopip, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Information We Collect</h2>
                    <p>
                        We may collect personal information such as your name, email address, and payment details when you register for an account, subscribe to our newsletter, or purchase our services. We also collect non-personal information such as your IP address, browser type, and operating system.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, communicate with you, process your transactions, and personalize your experience on our platform. We may also use your information to send you promotional materials and updates about our products and services.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Information Sharing</h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to comply with a legal process. We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Data Security</h2>
                    <p>
                        We implement strict security measures through our Supabase backend and hosting providers to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
