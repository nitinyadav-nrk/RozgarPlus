import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Job, useSubmitApplication, useGetMySubscription, useCreateSubscription, getGetMySubscriptionQueryKey } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { QrCode, CheckCircle2, Crown, Clock, AlertCircle } from "lucide-react";

const subscribeSchema = z.object({
  utrNumber: z.string().min(6, "UTR number must be at least 6 characters"),
  paymentScreenshot: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const applySchema = z.object({
  resume: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SubscribeForm = z.infer<typeof subscribeSchema>;
type ApplyForm = z.infer<typeof applySchema>;

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationModal({ job, isOpen, onClose }: ApplicationModalProps) {
  const [step, setStep] = useState<"subscribe" | "details" | "success">("subscribe");
  const [subscribeSubmitted, setSubscribeSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: subscription, isLoading: subLoading, refetch: refetchSub } = useGetMySubscription({
    query: { enabled: isOpen, retry: false, queryKey: getGetMySubscriptionQueryKey() }
  });

  const submitApplication = useSubmitApplication();
  const createSubscription = useCreateSubscription();

  const subForm = useForm<SubscribeForm>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { utrNumber: "", paymentScreenshot: "" },
  });

  const applyForm = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: { resume: "" },
  });

  const handleSubscribeSubmit = (data: SubscribeForm) => {
    createSubscription.mutate(
      { data: { utrNumber: data.utrNumber, paymentScreenshot: data.paymentScreenshot || undefined } },
      {
        onSuccess: () => {
          setSubscribeSubmitted(true);
          refetchSub();
          toast({ title: "Subscription request submitted! Awaiting admin approval." });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to submit subscription",
            description: err.message || "Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleApplySubmit = (data: ApplyForm) => {
    submitApplication.mutate(
      {
        data: {
          jobId: job.id,
          resume: data.resume || undefined,
        },
      },
      {
        onSuccess: () => {
          setStep("success");
          toast({ title: "Application submitted successfully!" });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to submit application",
            description: err.message || "Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleReset = () => {
    subForm.reset();
    applyForm.reset();
    setStep("subscribe");
    setSubscribeSubmitted(false);
    onClose();
  };

  const isActive = subscription?.status === "active";
  const isPending = subscription?.status === "pending";
  const currentStep = isActive ? "details" : step;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-[440px]">

        {/* ── Loading ── */}
        {subLoading && (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Checking subscription…</p>
          </div>
        )}

        {/* ── Subscribe step (no active sub) ── */}
        {!subLoading && !isActive && !isPending && !subscribeSubmitted && currentStep === "subscribe" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-amber-500" />
                <DialogTitle>Annual Membership Required</DialogTitle>
              </div>
              <DialogDescription>
                Subscribe for just <span className="font-semibold text-foreground">₹21/year</span> to unlock unlimited job applications across all listings.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100 rounded-xl p-5 gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border">
                <QrCode className="w-40 h-40 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl text-primary">₹21 / year</p>
                <p className="text-sm text-muted-foreground">UPI ID: jobnest@upi</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 w-full">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Apply to all jobs — no per-job fees</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Valid for 365 days</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Admin verification within 24h</li>
              </ul>
            </div>

            <Form {...subForm}>
              <form onSubmit={subForm.handleSubmit(handleSubscribeSubmit)} className="space-y-4">
                <FormField
                  control={subForm.control}
                  name="utrNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTR / Reference Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={subForm.control}
                  name="paymentScreenshot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Screenshot URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createSubscription.isPending}>
                  {createSubscription.isPending ? "Submitting…" : "Submit Subscription"}
                </Button>
              </form>
            </Form>
          </>
        )}

        {/* ── Subscription pending ── */}
        {!subLoading && (isPending || subscribeSubmitted) && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Subscription Pending</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your ₹21 subscription payment has been received and is awaiting admin verification. You'll be able to apply once approved — usually within 24 hours.
            </p>
            <Button variant="outline" onClick={handleReset} className="w-full">Close</Button>
          </div>
        )}

        {/* ── Apply step (active sub) ── */}
        {!subLoading && isActive && currentStep !== "success" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Active Member</span>
              </div>
              <DialogTitle>Apply for {job.title}</DialogTitle>
              <DialogDescription>
                Your membership covers this application. Attach your resume and submit.
              </DialogDescription>
            </DialogHeader>

            <Form {...applyForm}>
              <form onSubmit={applyForm.handleSubmit(handleApplySubmit)} className="space-y-4">
                <FormField
                  control={applyForm.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://drive.google.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitApplication.isPending}>
                  {submitApplication.isPending ? "Submitting…" : "Submit Application"}
                </Button>
              </form>
            </Form>
          </>
        )}

        {/* ── Success ── */}
        {currentStep === "success" && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Received!</h2>
            <p className="text-muted-foreground mb-8">
              We'll review your application shortly. Track the status in your dashboard.
            </p>
            <Button onClick={handleReset} className="w-full">View Dashboard</Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
