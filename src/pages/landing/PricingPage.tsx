import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Star,
  ArrowRight,
  Check,
  X,
  Zap,
  Crown,
  Users as UsersIcon,
  ChevronDown,
  Loader2,
  Image,
  Video,
  HardDrive,
  CalendarDays,
  Droplets,
  ScanFace,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPlans } from "@/store/slices/plansSlice";
import { selectPlans, selectPlansLoading } from "@/store/selectors";
import type { Plan } from "@/store/slices/plansSlice";
import SEOHead from "@/components/SEOHead";

const PricingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"user" | "photographer">(
    "photographer",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const plans = useAppSelector(selectPlans);
  const loading = useAppSelector(selectPlansLoading);

  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -404, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 404, behavior: 'smooth' });
  };

  // Fetch plans when tab changes
  useEffect(() => {
    dispatch(fetchPlans(activeTab));
  }, [dispatch, activeTab]);

  // Helper function to format bytes
  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  // Helper function to build capabilities from plan
  function buildCapabilities(
    plan: Plan,
  ): Array<{ icon: React.ReactNode; label: string; value: string | boolean }> {
    const rows: Array<{
      icon: React.ReactNode;
      label: string;
      value: string | boolean;
    }> = [];

    if (plan.max_photos !== undefined && plan.max_photos !== null) {
      rows.push({
        icon: <Image className="w-3.5 h-3.5" />,
        label: "Photos",
        value:
          plan.max_photos === 0
            ? "Unlimited"
            : plan.max_photos.toLocaleString("en-IN"),
      });
    }
    if (
      plan.max_videos !== undefined &&
      plan.max_videos !== null &&
      plan.max_videos !== 0
    ) {
      rows.push({
        icon: <Video className="w-3.5 h-3.5" />,
        label: "Videos",
        value: plan.max_videos.toLocaleString("en-IN"),
      });
    }
    if (
      plan.max_storage_bytes !== undefined &&
      plan.max_storage_bytes !== null
    ) {
      rows.push({
        icon: <HardDrive className="w-3.5 h-3.5" />,
        label: "Storage",
        value:
          plan.max_storage_bytes === 0
            ? "Unlimited"
            : formatBytes(plan.max_storage_bytes),
      });
    }
    if (plan.max_events !== undefined && plan.max_events !== null) {
      rows.push({
        icon: <CalendarDays className="w-3.5 h-3.5" />,
        label: "Events",
        value:
          plan.max_events === 0
            ? "Unlimited"
            : plan.max_events.toLocaleString("en-IN"),
      });
    }
    if (plan.has_custom_watermark === true) {
      rows.push({
        icon: <Droplets className="w-3.5 h-3.5" />,
        label: "Custom Watermark",
        value: true,
      });
    }
    if (plan.has_face_recognition === true) {
      rows.push({
        icon: <ScanFace className="w-3.5 h-3.5" />,
        label: "Face Recognition",
        value: true,
      });
    }
    if (plan.has_bulk_download === true) {
      rows.push({
        icon: <Check className="w-3.5 h-3.5" />,
        label: "Bulk Download",
        value: true,
      });
    }
    if (plan.has_business_branding === true) {
      rows.push({
        icon: <Star className="w-3.5 h-3.5" />,
        label: "Business Branding",
        value: true,
      });
    }
    if (plan.has_digital_album === true) {
      rows.push({
        icon: <Image className="w-3.5 h-3.5" />,
        label: "Digital Flipbook",
        value: true,
      });
    }
    if (plan.has_portfolio_website === true) {
      rows.push({
        icon: <Globe className="w-3.5 h-3.5" />,
        label: "Portfolio Website",
        value: true,
      });
    }
    if (plan.has_switch_downloads === true) {
      rows.push({
        icon: <Zap className="w-3.5 h-3.5" />,
        label: "Switch Downloads",
        value: true,
      });
    }
    if (plan.has_team_login === true) {
      rows.push({
        icon: <UsersIcon className="w-3.5 h-3.5" />,
        label: "Team Login",
        value: true,
      });
    }
    if (plan.has_view_client_favorites === true) {
      rows.push({
        icon: <Check className="w-3.5 h-3.5" />,
        label: "View Client Favorites",
        value: true,
      });
    }

    // Fallback: generic features array
    if (rows.length === 0 && plan.features) {
      const featureList = Array.isArray(plan.features)
        ? plan.features.map(String)
        : Object.entries(plan.features).map(([k, v]) => {
            const label = k
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            return v === true || v === 1 ? label : `${label}: ${v}`;
          });
      featureList.forEach((f) =>
        rows.push({ icon: null, label: f, value: true }),
      );
    }

    return rows;
  }

  // Fallback plans if API fails
  const photographerPlans = [
    {
      name: "Starter",
      price: 0,
      description: "Perfect for individual photographers",
      features: [
        "Up to 1,000 photos per month",
        "Basic AI face recognition",
        "5 client galleries",
        "Email support",
        "Mobile app access",
        "Basic analytics",
      ],
      icon: Camera,
      popular: false,
    },
    {
      name: "Professional",
      price: 290,
      description: "Ideal for growing photography businesses",
      features: [
        "Up to 10,000 photos per month",
        "Advanced AI face recognition",
        "Unlimited client galleries",
        "Priority email support",
        "Mobile app access",
        "Advanced analytics",
        "Custom branding",
        "API access",
      ],
      icon: Zap,
      popular: true,
    },
    {
      name: "Enterprise",
      price: 990,
      description: "For large studios and agencies",
      features: [
        "Unlimited photos",
        "Enterprise AI features",
        "Custom integrations",
        "Dedicated support",
        "White-label solutions",
      ],
      icon: Crown,
      popular: false,
    },
  ];

  const userPlans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for casual users",
      features: [
        "View shared galleries",
        "Download photos",
        "Basic favorites",
        "Mobile access",
        "Email notifications",
      ],
      icon: UsersIcon,
      popular: false,
    },
    {
      name: "Premium",
      price: 49,
      description: "Enhanced experience for photo enthusiasts",
      features: [
        "Unlimited gallery access",
        "High-resolution downloads",
        "Advanced favorites & collections",
        "Priority support",
        "Ad-free experience",
        "Cloud storage for favorites",
      ],
      icon: Star,
      popular: true,
    },
    {
      name: "Pro",
      price: 99,
      description: "For power users & creative professionals",
      features: [
        "Everything in Premium",
        "Exclusive early access",
        "Dedicated account manager",
        "Custom collections",
        "Offline access",
        "Team sharing",
      ],
      icon: Crown,
      popular: false,
    },
  ];

  // Use API plans if available, otherwise use fallback
  const displayPlans =
    plans.length > 0
      ? plans
      : activeTab === "photographer"
        ? photographerPlans
        : userPlans;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/pricing" />
      {/* Header */}
      <LandingHeader activePage="pricing" />

      {/* Hero Section */}
      <section
        className="pt-60 pb-32 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&fit=crop')",
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
              Simple, Transparent{" "}
              <span className="text-[hsl(var(--fab-amber))]">Pricing</span>
            </h1>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Choose the perfect plan for your photography business. Start free
              and scale as you grow.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs — shown right below hero */}
          <div className="flex justify-center mb-10">
            <div className="bg-muted border border-border rounded-2xl p-1.5 inline-flex gap-1 shadow-sm">
              <button
                onClick={() => setActiveTab("photographer")}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "photographer"
                    ? "fab-gradient-amber text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <Camera className="h-4 w-4" />
                Photographer
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "user"
                    ? "fab-gradient-amber text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <UsersIcon className="h-4 w-4" />
                User
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading plans…</p>
            </div>
          ) : (
            <div className="relative group max-w-[1300px] px-2 sm:px-6 lg:px-14 mx-auto">
              <button
                onClick={scrollLeft}
                className="absolute left-0 sm:left-2 lg:left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 sm:right-2 lg:right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <div
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
              {displayPlans.map((plan, index) => {
                const isPopular = plan.popular || plan.is_popular;
                const planIcon =
                  plan.icon ||
                  (index === 1 ? Zap : index === 2 ? Crown : Camera);
                const capabilities = buildCapabilities(plan as Plan);

                return (
                  <div
                    key={index}
                    className={`relative bg-card rounded-2xl fab-shadow-lg border-2 transition-all duration-300 hover:-translate-y-1 flex flex-col shrink-0 snap-center w-[300px] sm:w-[380px] ${
                      isPopular
                        ? "border-primary ring-4 ring-primary/10"
                        : "border-border hover:border-primary/40"
                    } overflow-hidden`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-1 fab-gradient-amber" />
                    )}
                    {isPopular && (
                      <div className="absolute top-4 right-4 fab-gradient-amber text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow">
                        Most Popular
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`rounded-xl p-2.5 ${isPopular ? "fab-gradient-amber" : "bg-primary/10"}`}
                        >
                          {React.createElement(planIcon, {
                            className: `h-6 w-6 ${isPopular ? "text-white" : "text-primary"}`,
                          })}
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {plan.name}
                        </h3>
                      </div>

                      <p className="text-muted-foreground text-sm mb-6">
                        {plan.description}
                      </p>

                      <div className="mb-6">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-extrabold text-foreground">
                            {" "}
                            &#8377;
                            {typeof plan.price === "number"
                              ? plan.price
                              : parseInt(String(plan.price)) || 0}
                          </span>
                          <span className="text-muted-foreground font-normal mb-1">
                            /year
                          </span>
                        </div>
                        {(plan.price === 0 || plan.price === "0") && (
                          <span className="text-xs text-green-600 font-medium mt-1 inline-block">
                            Free forever
                          </span>
                        )}
                      </div>

                      {/* Capabilities/Features List */}
                      <ul className="space-y-3 mb-8 flex-1">
                        {capabilities.length > 0
                          ? capabilities.map((cap, i) => {
                              const isBool = typeof cap.value === "boolean";
                              const isProvided = isBool ? cap.value : true;

                              return (
                                <li
                                  key={i}
                                  className="flex items-center gap-2.5 text-sm"
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                      isProvided ? "bg-green-100" : "bg-red-100"
                                    }`}
                                  >
                                    {isProvided ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <X className="w-3 h-3 text-red-400" />
                                    )}
                                  </div>

                                  {cap.icon && (
                                    <span className="text-muted-foreground">
                                      {cap.icon}
                                    </span>
                                  )}

                                  <span
                                    className={`${isProvided ? "text-foreground" : "text-muted-foreground line-through"}`}
                                  >
                                    {cap.label}
                                    {!isBool && (
                                      <span className="ml-1 font-semibold text-foreground no-underline">
                                        — {cap.value as string}
                                      </span>
                                    )}
                                  </span>
                                </li>
                              );
                            })
                          : // Fallback to features array if no capabilities
                            (Array.isArray(plan.features)
                              ? plan.features
                              : []
                            ).map((feature, fi) => (
                              <li key={fi} className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex-shrink-0 rounded-full p-0.5 ${isPopular ? "bg-primary/10" : "bg-green-50"}`}
                                >
                                  <Check
                                    className={`h-3.5 w-3.5 ${isPopular ? "text-primary" : "text-green-500"}`}
                                  />
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {feature}
                                </span>
                              </li>
                            ))}
                      </ul>

                      <Link
                        to={`/contact-us?role=${activeTab}&plan=${plan.name}`}
                      >
                        <button
                          onClick={() =>
                            window.scrollTo({ top: 0, behavior: "instant" })
                          }
                          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            isPopular
                              ? "fab-gradient-amber text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg"
                              : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary border border-border"
                          }`}
                        >
                          {plan.price === 0 || plan.price === "0"
                            ? "Get Started Free"
                            : isPopular
                              ? "Get Started"
                              : "Choose Plan"}
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Comparison */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Compare All Features</h2>
            <p className="text-muted-foreground">See exactly what you get with each plan</p>
          </div>

          {activeTab === 'photographer' ? (
            <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 font-semibold text-foreground bg-muted/50 w-2/5">Feature</th>
                    {['Starter', 'Professional', 'Enterprise'].map((p, i) => (
                      <th key={p} className={`px-4 py-3.5 text-center font-semibold text-sm ${i === 1 ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-foreground'}`}>
                        {p}{i === 1 && <span className="ml-1.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full align-middle">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: 'Monthly Photos',    starter: '1,000',   pro: '10,000',         enterprise: 'Unlimited' },
                    { feature: 'Client Galleries',  starter: '5',       pro: 'Unlimited',      enterprise: 'Unlimited' },
                    { feature: 'AI Recognition',    starter: 'Basic',   pro: 'Advanced',       enterprise: 'Enterprise' },
                    { feature: 'Custom Branding',   starter: false,     pro: true,             enterprise: true },
                    { feature: 'API Access',        starter: false,     pro: true,             enterprise: true },
                    { feature: 'White-label',       starter: false,     pro: false,            enterprise: true },
                    { feature: 'Support',           starter: 'Email',   pro: 'Priority',       enterprise: '24/7 Phone' },
                  ].map((row, ri) => (
                    <tr key={ri} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-foreground font-medium">{row.feature}</td>
                      {(['starter', 'pro', 'enterprise'] as const).map((col, ci) => (
                        <td key={col} className={`px-4 py-3 text-center ${ci === 1 ? 'bg-primary/5' : ''}`}>
                          {typeof row[col] === 'boolean' ? (
                            row[col]
                              ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100"><Check className="h-3 w-3 text-green-600" /></span>
                              : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50"><X className="h-3 w-3 text-red-400" /></span>
                          ) : (
                            <span className={`text-xs font-medium ${ci === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{row[col]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 font-semibold text-foreground bg-muted/50 w-2/5">Feature</th>
                    {['Free', 'Premium', 'Pro'].map((p, i) => (
                      <th key={p} className={`px-4 py-3.5 text-center font-semibold text-sm ${i === 1 ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-foreground'}`}>
                        {p}{i === 1 && <span className="ml-1.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full align-middle">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: 'Gallery Access',      free: 'Basic',      premium: 'Unlimited',  pro: 'Unlimited' },
                    { feature: 'Photo Downloads',     free: 'Standard',   premium: 'High-res',   pro: 'High-res' },
                    { feature: 'Favorites',           free: 'Basic',      premium: 'Advanced',   pro: 'Advanced' },
                    { feature: 'Ad-free',             free: false,        premium: true,         pro: true },
                    { feature: 'Cloud Storage',       free: false,        premium: true,         pro: true },
                    { feature: 'Offline Access',      free: false,        premium: false,        pro: true },
                    { feature: 'Support',             free: 'Community',  premium: 'Priority',   pro: 'Dedicated' },
                  ].map((row, ri) => (
                    <tr key={ri} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-foreground font-medium">{row.feature}</td>
                      {(['free', 'premium', 'pro'] as const).map((col, ci) => (
                        <td key={col} className={`px-4 py-3 text-center ${ci === 1 ? 'bg-primary/5' : ''}`}>
                          {typeof row[col] === 'boolean' ? (
                            row[col]
                              ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100"><Check className="h-3 w-3 text-green-600" /></span>
                              : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50"><X className="h-3 w-3 text-red-400" /></span>
                          ) : (
                            <span className={`text-xs font-medium ${ci === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{row[col]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section> */}

      {/* Testimonials */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Loved by Photographers</h2>
            <p className="text-xl text-muted-foreground">See what our customers have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Mitchell',
                role: 'Wedding Photographer',
                content: 'Fab Studio has transformed my business. I can deliver photos to clients within hours instead of days. The AI face recognition is incredible!',
                rating: 5
              },
              {
                name: 'James Rodriguez',
                role: 'Portrait Photographer',
                content: 'The professional plan is perfect for my growing studio. Unlimited galleries and custom branding have helped me look more professional.',
                rating: 5
              },
              {
                name: 'Emma Thompson',
                role: 'Event Photographer',
                content: 'Customer support is amazing and the platform keeps getting better. Worth every penny and has saved me countless hours.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-card rounded-2xl fab-shadow-lg border border-border p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[hsl(var(--fab-amber))] fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                question: "Can I change my plan anytime?",
                answer:
                  "Yes — upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle with no hidden fees.",
              },
              {
                question: "Is there a free trial available?",
                answer:
                  "We offer a 14-day free trial for all new users. No credit card required to start — just sign up and explore.",
              },
              {
                question: "What happens if I exceed my photo limit?",
                answer:
                  "You'll receive a notification as you approach your limit. You can upgrade your plan or purchase additional photo credits at any time.",
              },
              {
                question: "Do you offer discounts for annual billing?",
                answer:
                  "Yes — annual billing saves you up to 20% compared to monthly. All prices shown are already the yearly rate.",
              },
              {
                question: "Is my data secure?",
                answer:
                  "Absolutely. We use 256-bit AES encryption, automated backups, and industry-standard security practices to keep your photos and data safe.",
              },
              {
                question: "Can I cancel at any time?",
                answer:
                  "Yes, you can cancel your subscription at any time from your account settings. Your access continues until the end of the billing period.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span
                    className={`font-semibold text-base transition-colors ${openFaq === index ? "text-primary" : "text-foreground group-hover:text-primary"}`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openFaq === index
                        ? "fab-gradient-amber text-white rotate-180"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? "max-h-40" : "max-h-0"}`}
                >
                  <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm border-t border-border/50 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fab-gradient-amber">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of photographers who trust Fab Studio for their
            business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:min-w-[180px] bg-background text-foreground px-8 py-3 rounded-xl hover:bg-muted transition-colors flex items-center justify-center font-semibold">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </Link>
            <Link to="/contact-us" className="w-full sm:w-auto">
              <button className="w-full sm:min-w-[180px] bg-transparent text-primary-foreground border-2 border-primary-foreground px-8 py-3 rounded-xl hover:bg-background hover:text-foreground transition-colors font-semibold">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default PricingPage;
