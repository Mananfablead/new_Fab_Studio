import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AlertCircle, Loader2 } from 'lucide-react';

interface JoinGroupPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinCode: string;
  onJoinCodeChange: (code: string) => void;
  onJoin?: () => void;
  isLoading?: boolean;
}

export default function JoinGroupPopup({ open, onOpenChange, joinCode, onJoinCodeChange, onJoin, isLoading }: JoinGroupPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md mx-auto sm:mx-0">
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
          <DialogDescription>Enter the 6-digit event code to join the group</DialogDescription>
        </DialogHeader>
        <div className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-0">
          <div>
            <label className="text-xl sm:text-2xl font-medium block text-center mb-1 sm:mb-2">Enter event code</label>
            <label className="text-xs sm:text-md font-medium block text-center mb-4 sm:mb-6 text-muted-foreground px-2">
              Enter the 6 digit unique code of your event to join the group
            </label>
            <div className="flex justify-center mb-4 sm:mb-6">
              <InputOTP
                maxLength={6}
                value={joinCode}
                onChange={onJoinCodeChange}
                pattern="^[a-zA-Z0-9]*$"
              >
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="rounded-xl border-2 w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <label className="text-xs sm:text-md font-medium block text-center mb-3 sm:mb-4 flex items-center justify-center gap-1 px-2">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>You can also join group via shared link</span>
            </label>
          </div>
          <button 
            onClick={onJoin}
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 mt-2 sm:mt-4 active:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Group'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}