import { useState } from 'react';
import { Plus, CreditCard, Download, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LearnerLayout from '@/components/LearnerLayout';
import { useWallet, useDeposit } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const LearnerWallet = () => {
  const { data: wallet, isLoading } = useWallet();
  const { mutate: deposit, isPending: isDepositing } = useDeposit();
  const { toast } = useToast();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('1000');

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    deposit(numAmount, {
      onSuccess: () => {
        toast({ title: "Funds added successfully!", description: `₹${numAmount} added to your wallet.` });
        setShowAddFunds(false);
      },
      onError: (err: any) => {
        toast({ title: "Deposit failed", description: err.response?.data?.message || "Could not add funds.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <LearnerLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LearnerLayout>
    );
  }

  const transactions = wallet?.transactions || [];

  return (
    <LearnerLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-1">My Wallet</h1>
        <p className="text-muted-foreground mb-6">Manage your learning credits</p>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-sm opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl font-bold mb-4">₹{Number(wallet?.balance || 0).toLocaleString('en-IN')}</p>
            <div className="flex gap-3">
              {showAddFunds ? (
                <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 w-24 text-sm font-bold px-2"
                    placeholder="Amount"
                  />
                  <Button onClick={handleDeposit} disabled={isDepositing} variant="secondary" size="sm">
                    {isDepositing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                  </Button>
                  <Button onClick={() => setShowAddFunds(false)} variant="ghost" size="sm" className="text-white hover:bg-white/10">Cancel</Button>
                </div>
              ) : (
                <Button onClick={() => setShowAddFunds(true)} variant="secondary" size="sm" className="gap-1"><Plus className="h-3 w-3" /> Add Funds</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" /> Add Card</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">UPI / Net Banking / Card</p>
                <p className="text-xs text-muted-foreground">Select on checkout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                    {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.type === 'DEPOSIT' ? 'Funds Added' : 'Session Payment'}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'DEPOSIT' ? 'text-accent' : 'text-foreground'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No transactions yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
};

export default LearnerWallet;
