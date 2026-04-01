import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SupportTicket = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/help');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Submit a Support Ticket</h1>
          <p className="text-muted-foreground mb-6">Describe your issue and we'll get back to you within 24 hours.</p>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required>
                    <option value="">Select a category</option>
                    <option value="account">Account & Billing</option>
                    <option value="sessions">Sessions & Booking</option>
                    <option value="technical">Technical Issues</option>
                    <option value="mentor">Mentor Related</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue"
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6}
                    placeholder="Please describe your issue in detail..."
                    className="w-full p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attachments (Optional)</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Paperclip className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Screenshots or files that might help</p>
                    <Button variant="outline" size="sm" className="mt-2" type="button">Choose Files</Button>
                  </div>
                </div>
                <Button type="submit" className="w-full gap-1"><Send className="h-4 w-4" /> Submit Ticket</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportTicket;
