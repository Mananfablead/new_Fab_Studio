import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export default function PaymentSuccessModal({ open, onOpenChange, message = 'Your plan has been updated.' }: PaymentSuccessModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6 sm:p-8 rounded-3xl bg-white border-0 shadow-2xl gap-0">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-black font-heading text-slate-800">Payment Successful!</h2>
          <p className="text-slate-500 text-sm font-medium px-4">
            {message}
          </p>
          
          <div className="flex flex-col w-full gap-3 pt-6">
            <Button
              className="w-full py-6 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all text-[15px]"
              onClick={() => onOpenChange(false)}
            >
              Continue
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all text-[15px]"
              onClick={() => {
                onOpenChange(false);
                navigate('/settings/transactions');
              }}
            >
              View Transactions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
