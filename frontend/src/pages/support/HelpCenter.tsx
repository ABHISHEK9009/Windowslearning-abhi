import { Search, BookOpen, CreditCard, Calendar, Users, AlertTriangle, Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const categories = [
  { icon: BookOpen, label: 'Getting Started', count: 12 },
  { icon: CreditCard, label: 'Account & Billing', count: 8 },
  { icon: Calendar, label: 'Sessions & Booking', count: 15 },
  { icon: Users, label: 'Mentors', count: 10 },
  { icon: AlertTriangle, label: 'Technical Issues', count: 6 },
];

const popularArticles = [
  { id: '1', title: 'How to book your first session', category: 'Getting Started' },
  { id: '2', title: 'Understanding session pricing', category: 'Account & Billing' },
  { id: '3', title: 'How to reschedule or cancel a session', category: 'Sessions & Booking' },
  { id: '4', title: 'Becoming a verified mentor', category: 'Mentors' },
  { id: '5', title: 'Troubleshooting video call issues', category: 'Technical Issues' },
  { id: '6', title: 'Managing your wallet and payments', category: 'Account & Billing' },
];

const HelpCenter = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="py-16 px-4 text-center" style={{ background: 'var(--hero-gradient)' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">How can we help you?</h1>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for help..." className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
          </div>
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-12">
          {/* Categories */}
          <h2 className="text-xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {categories.map(cat => (
              <Card key={cat.label} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 text-center">
                  <cat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Popular Articles */}
          <h2 className="text-xl font-bold mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {popularArticles.map(article => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Options */}
          <h2 className="text-xl font-bold mb-6">Still need help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/support/ticket">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-medium mb-1">Submit a Ticket</p>
                  <p className="text-xs text-muted-foreground">We'll respond within 24 hours</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-1">Live Chat</p>
                <p className="text-xs text-muted-foreground">Available 9 AM - 9 PM IST</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-1">Email Us</p>
                <p className="text-xs text-muted-foreground">support@windowslearning.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
