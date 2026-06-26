import { useEffect, useState } from 'react';
import { Send, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetInquiryState, fetchPlans, submitPlanInquiry } from '@/store/slices/plansSlice';
import {
  selectInquiryLoading,
  selectInquiryError,
  selectPlans,
  selectPlansLoading,
} from '@/store/selectors';
import type { Plan } from '@/store/slices/plansSlice';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PlanInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

export default function PlanInquiryModal({ open, onOpenChange, plan }: PlanInquiryModalProps) {
  const dispatch = useAppDispatch();
  const inquiryLoading = useAppSelector(selectInquiryLoading);
  const inquiryError = useAppSelector(selectInquiryError);
  const plans = useAppSelector(selectPlans);
  const plansLoading = useAppSelector(selectPlansLoading);
  const reduxUser = useAppSelector((state) => state.auth.user);
  const { user } = useAuth();
  const currentUser = reduxUser ?? user;
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localSuccessMessage, setLocalSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: 'photographer',
    selectedPlan: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [planFromModal, setPlanFromModal] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      dispatch(resetInquiryState());
      // If user is logged in, set role to their role
      const initialRole = currentUser?.role || 'photographer';
      setForm({ role: initialRole, selectedPlan: '', subject: '', message: '' });
      setErrors({});
      setPlanFromModal(null);
    }
  }, [open, dispatch, currentUser?.role]);

  // Fetch plans when role changes
  useEffect(() => {
    if (open) {
      dispatch(fetchPlans(form.role));
    }
  }, [form.role, open, dispatch]);

  // Set plan from modal prop and track it
  useEffect(() => {
    if (plan) {
      setPlanFromModal(plan.name);
      setForm((prev) => ({
        ...prev,
        selectedPlan: plan.name,
        subject: `Inquiry about ${plan.name} Plan`,
      }));
    }
  }, [plan]);

  // Set default plan if none selected and plans loaded
  useEffect(() => {
    if (plans.length > 0) {
      // If plan was passed via modal prop, keep it
      if (planFromModal) {
        setForm((prev) => ({ ...prev, selectedPlan: planFromModal }));
      }
      // Otherwise set the first plan as default
      else if (!form.selectedPlan) {
        setForm((prev) => ({ ...prev, selectedPlan: plans[0].name }));
      }
    }
  }, [plans]);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.selectedPlan) newErrors.selectedPlan = 'Plan is required';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset plan if role changes
      if (name === 'role') {
        updated.selectedPlan = '';
      }
      return updated;
    });
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Find the plan object by name
    const selectedPlanObj = plans.find(p => p.name === form.selectedPlan);
    if (!selectedPlanObj) {
      toast.error('Please select a valid plan');
      return;
    }

    const inquiryName =
      currentUser?.name?.trim() ||
      `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim();
    const inquiryEmail = currentUser?.email?.trim();
    if (!inquiryName || !inquiryEmail) {
      toast.error('Your profile is still loading. Please try again in a moment.');
      return;
    }

    setLocalSubmitting(true);
    setLocalSuccessMessage(null);

    try {
      const result = await dispatch(
        submitPlanInquiry({
          plan_id: selectedPlanObj.id,
          name: inquiryName,
          email: inquiryEmail,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      );

      if (!submitPlanInquiry.fulfilled.match(result)) {
        throw new Error((result.payload as string) || 'Failed to send inquiry.');
      }

      setLocalSuccessMessage(
        `Thanks ${inquiryName}, we received your inquiry about ${selectedPlanObj.name}. Our team will get back to you soon.`,
      );
      toast.success('Your inquiry has been sent.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send inquiry.';
      toast.error(message);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!inquiryLoading) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:text-primary-foreground [&>button]:bg-primary [&>button]:hover:opacity-90 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-all max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl m-4 sm:m-0 flex flex-col max-h-[calc(90vh-2rem)]">
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90 flex-shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--fab-amber))]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <DialogHeader className="relative">
              <DialogTitle className="text-xl font-heading font-bold text-white mb-1">
                Send us a Message
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm">
                {plan
                  ? `Interested in the ${plan.name} plan? We'd love to hear from you.`
                  : "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1">
            {localSuccessMessage ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-1">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    {localSuccessMessage}
                  </p>
                </div>
                <Button
                  className="mt-2 bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white px-8"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Role and Plan Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Role */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-role" className="font-semibold text-sm">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    {currentUser ? (
                      // Read-only display when user is logged in
                      <div className="w-full px-3 py-2.5 border border-border rounded-xl bg-muted text-sm flex items-center">
                        <span className="text-foreground capitalize">{form.role}</span>
                      </div>
                    ) : (
                      // Dropdown when user is not logged in
                      <div className="relative">
                        <select
                          id="inquiry-role"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          disabled={inquiryLoading}
                          className={`w-full px-3 py-2.5 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors appearance-none ${errors.role ? 'border-red-400 focus-visible:ring-red-400' : ''
                            }`}
                        >
                          <option value="photographer">Photographer</option>
                          <option value="user">User</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    )}
                    {errors.role && (
                      <p className="text-xs text-red-500">{errors.role}</p>
                    )}
                  </div>

                  {/* Plan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-plan" className="font-semibold text-sm">
                      Plan <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="inquiry-plan"
                        name="selectedPlan"
                        value={form.selectedPlan}
                        onChange={handleChange}
                        disabled={inquiryLoading || plansLoading}
                        className={`w-full px-3 py-2.5 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors appearance-none disabled:opacity-50 cursor-pointer ${errors.selectedPlan ? 'border-red-400 focus-visible:ring-red-400' : ''
                          }`}
                      >
                        <option value="" disabled>Select a plan</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.selectedPlan && (
                      <p className="text-xs text-red-500">{errors.selectedPlan}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-subject" className="font-semibold text-sm">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="inquiry-subject"
                    name="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={inquiryLoading}
                    className={`rounded-xl h-11 ${errors.subject ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-message" className="font-semibold text-sm">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="inquiry-message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    value={form.message}
                    onChange={handleChange}
                    disabled={inquiryLoading}
                    rows={4}
                    className={`rounded-xl resize-none ${errors.message ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* API error */}
                {inquiryError && (
                  <p className="text-sm text-red-500 text-center">{inquiryError}</p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={inquiryLoading || localSubmitting}
                  className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all mt-2"
                >
                  {inquiryLoading || localSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
