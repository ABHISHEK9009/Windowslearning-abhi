import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-3xl mx-auto prose prose-sm">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: March 1, 2026</p>

          <div className="bg-card rounded-2xl border p-8 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground">By accessing or using Windows Learning ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
              <p className="text-sm text-muted-foreground">Windows Learning provides an online marketplace connecting learners with verified mentors for live, interactive mentorship sessions. We facilitate the connection but are not a party to the mentoring agreement between mentors and learners.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">3. User Accounts</h2>
              <p className="text-sm text-muted-foreground">You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">4. Mentor Verification</h2>
              <p className="text-sm text-muted-foreground">All mentors undergo identity verification (Aadhaar/Government ID). While we verify identities, we do not guarantee the quality of mentoring services. Ratings and reviews from learners serve as quality indicators.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">5. Payments & Refunds</h2>
              <p className="text-sm text-muted-foreground">Payments are processed through Razorpay. Session fees are set by individual mentors. The platform retains a 20% commission. Refunds are available for cancelled sessions as per our refund policy.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">6. Session Conduct</h2>
              <p className="text-sm text-muted-foreground">Users must conduct themselves professionally during sessions. Any form of harassment, discrimination, or inappropriate behavior will result in immediate account suspension.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">7. Intellectual Property</h2>
              <p className="text-sm text-muted-foreground">All content on the Platform, including text, graphics, logos, and software, is the property of Windows Learning or its content suppliers. Users retain ownership of content they create during sessions.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">8. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground">Windows Learning shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Platform. Our total liability shall not exceed the amount paid by you in the last 12 months.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
              <p className="text-sm text-muted-foreground">For questions about these Terms, contact us at legal@windowslearning.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
