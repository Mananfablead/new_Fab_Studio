import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  submitContactForm,
  clearContactMessage,
} from "../../store/slices/contactSlice";
import { fetchPlans } from "../../store/slices/plansSlice";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";

const ContactUsPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, success, error, successMessage } = useAppSelector(
    (state) => state.contact,
  );
  const { plans, loading: plansLoading } = useAppSelector(
    (state) => state.plans,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    role: "photographer",
    plan: "",
    plan_id: "",
  });

  const [planFromUrl, setPlanFromUrl] = useState<string | null>(null);

  const normalizePlanValue = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

  const findMatchingPlan = (planValue: string) => {
    const normalized = normalizePlanValue(planValue);

    return plans.find((plan) => {
      const candidates = [
        plan.name,
        plan.slug,
        String(plan.id),
      ].filter(Boolean);

      return candidates.some(
        (candidate) => normalizePlanValue(String(candidate)) === normalized,
      );
    });
  };

  useEffect(() => {
    const roleParam = searchParams.get("role");
    const planParam = searchParams.get("plan");

    if (roleParam === "user" || roleParam === "photographer") {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
    if (planParam) {
      setPlanFromUrl(planParam);
      setFormData((prev) => ({ ...prev, plan: planParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchPlans(formData.role));
  }, [dispatch, formData.role]);

  // Set default plan if none selected and plans loaded
  useEffect(() => {
    if (plans.length > 0) {
      if (planFromUrl) {
        const matchingPlan = findMatchingPlan(planFromUrl);
        setFormData((prev) => ({
          ...prev,
          plan: matchingPlan?.name || planFromUrl,
          plan_id: matchingPlan?.id || prev.plan_id,
        }));
      } else if (!formData.plan) {
        setFormData((prev) => ({
          ...prev,
          plan: plans[0].name,
          plan_id: plans[0].id,
        }));
      }
    }
  }, [plans, planFromUrl]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearContactMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchedPlan = findMatchingPlan(formData.plan);
    const selectedPlanId = formData.plan_id || matchedPlan?.id;

    // Prepare payload with plan_id and planName for backend
    const payload = {
      ...formData,
      plan: matchedPlan?.name || formData.plan,
      planName: matchedPlan?.name || formData.plan || undefined,
      plan_id: selectedPlanId || undefined,
    };

    dispatch(submitContactForm(payload)).then((result) => {
      if (result.type === submitContactForm.fulfilled.type) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          role: "photographer",
          plan: "",
          plan_id: "",
        });
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // If plan is being changed, find and set the plan_id
    if (name === "plan") {
      const selectedPlan = findMatchingPlan(value);
      setFormData({
        ...formData,
        [name]: selectedPlan?.name || value,
        plan_id: selectedPlan?.id || "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
        // Reset plan if role changes
        ...(name === "role" ? { plan: "", plan_id: "" } : {}),
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/contact-us" />
      {/* Header */}
      <LandingHeader activePage="contactus" />

      {/* Hero Section */}
      <section
        className="pt-60 pb-32 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&fit=crop')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get in Touch with{" "}
              <span className="text-[hsl(var(--fab-amber))]">Our Team</span>
            </h1>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Have questions? We're here to help. Reach out to our team and
              we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl fab-shadow-lg border border-border p-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Send us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  We'd love to hear from you. Send us a message and we'll
                  respond as soon as possible.
                </p>

                {/* Success Message */}
                {success && successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-800 text-sm">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors rounded-lg"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors rounded-lg"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Role *
                      </label>
                      <div className="relative">
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors rounded-lg appearance-none cursor-pointer"
                        >
                          <option value="photographer">Photographer</option>
                          <option value="user">User</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="plan"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Plan *
                      </label>
                      <div className="relative">
                        <select
                          id="plan"
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          required
                          disabled={plansLoading}
                          className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors rounded-lg appearance-none disabled:opacity-50 cursor-pointer"
                        >
                          <option value="" disabled>
                            Select a plan
                          </option>
                          {planFromUrl && !findMatchingPlan(planFromUrl) && (
                            <option value={planFromUrl}>{planFromUrl}</option>
                          )}
                          {plans.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors rounded-lg"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary transition-colors resize-none rounded-lg"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full fab-gradient-amber text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Cards */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Get in Touch
              </h2>
              <div className="space-y-6">
                {/* Email Us Card */}
                <div className="bg-card border border-border rounded-lg p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Email Us
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Get in touch via email
                    </p>
                    <a
                      href="mailto:support@fableadstudio.com"
                      className="text-primary hover:text-primary/80 font-medium break-all"
                    >
                      info@fableadtechnolabs.com
                    </a>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-card border border-border rounded-lg p-6 flex items-start space-x-4">
                  <div className="bg-[hsl(var(--fab-info))]/10 rounded-full p-3 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-[hsl(var(--fab-info))]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Address
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Come visit us
                    </p>
                    <address className="not-italic text-foreground font-medium leading-relaxed text-sm">
                      A-5001, Ascon Plaza, Adajan, Surat,Gujarat 395009 – India
                    </address>
                  </div>
                </div>

                {/* Map */}
                <div className="rounded-lg overflow-hidden border border-border h-80">
                  <iframe
                    src="https://www.google.com/maps?q=Fablead+Developers+Technolab,+A-5001+Ascon+Plaza,+Adajan,+Surat,+Gujarat+395009&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default ContactUsPage;
