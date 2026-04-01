import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: March 1, 2026</p>

          <div className="bg-card rounded-2xl border p-8 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
              <p className="text-sm text-muted-foreground">We collect personal information you provide (name, email, phone), usage data (browsing patterns, session history), and device information (IP address, browser type). For mentors, we also collect identity verification documents.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-sm text-muted-foreground">We use your information to provide and improve our services, process payments, verify mentor identities, send notifications and updates, and ensure platform safety.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">3. Data Security</h2>
              <p className="text-sm text-muted-foreground">We implement AES-256 encryption for sensitive data, PCI-compliant payment processing, regular security audits, and access controls. Despite these measures, no internet transmission is 100% secure.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">4. Data Sharing</h2>
              <p className="text-sm text-muted-foreground">We do not sell your personal data. We may share limited information with payment processors (Razorpay), video service providers (Zoom), identity verification services, and law enforcement when legally required.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">5. Cookies</h2>
              <p className="text-sm text-muted-foreground">We use essential cookies for platform functionality and analytics cookies to improve user experience. You can manage cookie preferences through your browser settings.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
              <p className="text-sm text-muted-foreground">You have the right to access, correct, or delete your personal data, opt out of marketing communications, request data portability, and withdraw consent for data processing.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">7. Data Retention</h2>
              <p className="text-sm text-muted-foreground">We retain your data for as long as your account is active. After account deletion, we retain certain data for up to 90 days for legal and audit purposes.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
              <p className="text-sm text-muted-foreground">For privacy-related concerns, contact our Data Protection Officer at privacy@windowslearning.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
