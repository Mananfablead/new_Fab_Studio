import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  Star,
  Database,
  Camera,
  Check,
  Crown,
  Loader2,
  Image,
  Video,
  HardDrive,
  CalendarDays,
  Droplets,
  ScanFace,
  X,
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

const LandingPage = () => {
  const navigate = useNavigate();
  const [pricingTab, setPricingTab] = useState<"user" | "photographer">(
    "photographer",
  );
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
    dispatch(fetchPlans(pricingTab));
  }, [dispatch, pricingTab]);

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
        icon: <Users className="w-3.5 h-3.5" />,
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
        "Up to 1,000 photos/month",
        "Basic AI face recognition",
        "5 client galleries",
        "Email support",
        "Mobile app access",
      ],
      icon: Camera,
      popular: false,
    },
    {
      name: "Professional",
      price: 290,
      description: "Ideal for growing photography businesses",
      features: [
        "Up to 10,000 photos/month",
        "Advanced AI face recognition",
        "Unlimited client galleries",
        "Priority support",
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
      icon: Users,
      popular: false,
    },
    {
      name: "Premium",
      price: 49,
      description: "Enhanced experience for photo enthusiasts",
      features: [
        "Unlimited gallery access",
        "High-resolution downloads",
        "Advanced collections",
        "Priority support",
        "Ad-free experience",
        "Cloud storage",
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
  const activePlans =
    plans.length > 0
      ? plans
      : pricingTab === "photographer"
        ? photographerPlans
        : userPlans;
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/home" />
      {/* Header */}
      <LandingHeader activePage="home" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-fab-amber/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
                <Zap className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  The Future of Photography
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your{" "}
                <span className="text-primary relative inline-block">
                  Photography Business
                </span>{" "}
                with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Fab Studio empowers photographers with intelligent photo
                organization, instant client galleries, and automated delivery.
                Join thousands of professionals who've revolutionized their
                workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <button
                  onClick={() => (window.location.href = "/contact-us")}
                  className="fab-gradient-amber text-primary-foreground px-10 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center text-lg font-semibold group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-8 text-gray-600">
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 min-w-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                    50,000+ Photographers
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 min-w-0">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                    120+ Countries
                  </span>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="relative group">
                {/* Decorative Frame */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-fab-amber/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />

                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl transform transition-transform duration-500 border-4 border-white">
                  <img
                    src="https://media.istockphoto.com/id/171150042/photo/sunrise-image-in-lcd-oxbow-bend-gtnp.webp?a=1&b=1&s=612x612&w=0&k=20&c=A93bwl-Ao4lmoca5afUBGuQl-57k7p2B0leHwE_gruU="
                    alt="Professional photographer at work"
                    className="w-full h-[500px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">
                        Smart Gallery Engine
                      </p>
                      <p className="text-white/80 text-xs">
                        AI-driven organization
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
                      <Zap className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Secondary floating element */}
                <div
                  className="absolute top-2 right-2 sm:-top-6 sm:-right-6 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-gray-100 animate-bounce transition-all hover:scale-110"
                  style={{ animationDuration: "3s" }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-green-100 rounded-full p-1.5 sm:p-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">
                      Verified Pro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-powered Photo Galleries Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
        {/* Abstract Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Smart <span className="text-primary">Photo Galleries</span> with
              AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automatically organize, manage, and deliver your photos—Fab Studio
              does the hard work for you.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[200px]">
            {[
              {
                src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=400&fit=crop",
                alt: "AI photo organization",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
                alt: "Photography workflow",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop",
                alt: "Photo gallery",
                span: "col-span-2 row-span-2",
              },
              {
                src: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&h=400&fit=crop",
                alt: "Client gallery delivery",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&h=400&fit=crop",
                alt: "AI photo sorting",
                span: "col-span-1 row-span-1",
              },

              {
                src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=800&fit=crop",
                alt: "Professional photography",
                span: "col-span-2 row-span-2",
              },
              {
                src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop",
                alt: "Wedding photography",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=400&h=400&fit=crop",
                alt: "Portrait photography",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
                alt: "Model shoot",
                span: "col-span-1 row-span-1",
              },
              {
                src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
                alt: "Event coverage",
                span: "col-span-1 row-span-1",
              },
            ].map((img, i) => (
              <div
                key={i}
                className={`${img.span} rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group relative`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Decorative background for stats */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fab-amber/10 blur-[100px] -ml-32 -mb-32" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  200M+
                </div>
                <div className="text-primary text-sm uppercase tracking-[0.2em] font-bold">
                  Photos Uploaded
                </div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  20M+
                </div>
                <div className="text-primary text-sm uppercase tracking-[0.2em] font-bold">
                  Active Users
                </div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  99.9%
                </div>
                <div className="text-primary text-sm uppercase tracking-[0.2em] font-bold">
                  Uptime Guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Powerful Features for Photographers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your photography workflow and
              delight your clients
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: Zap,
                title: "Lightning-Fast Upload",
                desc: "Process thousands of photos in minutes with AI-optimized infrastructure.",
                features: [
                  "Batch processing",
                  "Auto-enhancement",
                  "Smart tagging",
                ],
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Bank-level encryption protects your creative work with automated backups.",
                features: [
                  "256-bit encryption",
                  "Watermarking",
                  "Access control",
                ],
              },
              {
                icon: Globe,
                title: "Global CDN Delivery",
                desc: "Lightning-fast gallery loading for clients worldwide with auto-optimization.",
                features: [
                  "120+ edge locations",
                  "Auto-optimization",
                  "Mobile responsive",
                ],
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-50 rounded-[2rem] p-10 border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] -mr-12 -mt-12 group-hover:w-32 group-hover:h-32 transition-all duration-500" />

                <div className="bg-primary text-white rounded-2xl p-4 w-fit mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-8 line-relaxed">
                  {feature.desc}
                </p>
                <ul className="space-y-3">
                  {feature.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm font-semibold text-gray-700"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?q=80&w=800&auto=format&fit=crop"
                  alt="Get Started with Fab Studio"
                  className="w-full h-[550px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight">
                Launch Your Studio in{" "}
                <span className="text-primary italic">3 Simple Steps</span>
              </h2>
              <div className="space-y-10 relative">
                {[
                  {
                    step: "1",
                    title: "Sign-up",
                    desc: "Create your account in seconds and start exploring our AI-powered features.",
                  },
                  {
                    step: "2",
                    title: "Upload Photos",
                    desc: "Securely upload your photos and watch as our AI organizes them instantly.",
                  },
                  {
                    step: "3",
                    title: "Share with Clients",
                    desc: "Deliver stunning, personalized galleries to your clients with just one click.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Choose the perfect plan for your photography needs
            </p>

            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl mb-2 shadow-inner">
              <button
                onClick={() => setPricingTab("photographer")}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  pricingTab === "photographer"
                    ? "bg-white text-primary shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-4 w-4" />
                Photographer
              </button>
              <button
                onClick={() => setPricingTab("user")}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  pricingTab === "user"
                    ? "bg-white text-primary shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-4 w-4" />
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
              {activePlans.map((plan, index) => {
                const isPopular = plan.popular || plan.is_popular;
                const planIcon =
                  plan.icon ||
                  (index === 1 ? Zap : index === 2 ? Crown : Camera);
                const capabilities = buildCapabilities(plan as Plan);

                return (
                  <div
                    key={index}
                    className={`group relative bg-white rounded-[2.5rem] p-10 border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col shrink-0 snap-center w-[300px] sm:w-[380px] ${
                      isPopular
                        ? "border-primary ring-8 ring-primary/5 scale-105 z-10"
                        : "border-slate-100 hover:border-primary/20"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-6 right-6 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Best Value
                      </div>
                    )}
                    <div className="mb-8">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${isPopular ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}
                      >
                        {React.createElement(planIcon, {
                          className: "h-7 w-7",
                        })}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8 pb-8 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-foreground">
                          {" "}
                          &#8377;
                          {typeof plan.price === "number"
                            ? plan.price
                            : parseInt(String(plan.price)) || 0}
                        </span>
                        <span className="text-muted-foreground font-semibold">
                          /year
                        </span>
                      </div>
                    </div>

                    {/* Capabilities/Features List */}
                    <ul className="space-y-3 mb-10 flex-1">
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
                            <li key={fi} className="flex items-center gap-3">
                              <div
                                className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${isPopular ? "bg-primary/20" : "bg-slate-100"}`}
                              >
                                <Check
                                  className={`h-3 w-3 ${isPopular ? "text-primary" : "text-slate-500"}`}
                                  strokeWidth={3}
                                />
                              </div>
                              <span className="text-gray-700 font-medium text-sm">
                                {feature}
                              </span>
                            </li>
                          ))}
                    </ul>

                    <Link
                      to={`/contact-us?role=${pricingTab}&plan=${plan.name}`}
                    >
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "instant" })
                        }
                        className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform group-hover:scale-[1.02] active:scale-95 ${
                          isPopular
                            ? "bg-primary text-white shadow-xl shadow-primary/25 hover:shadow-primary/40"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {plan.price === 0 || plan.price === "0"
                          ? "Get Started Free"
                          : "Choose Plan"}
                      </button>
                    </Link>
                  </div>
                );
              })}
              </div>
            </div>
          )}
          <div className="text-center mt-10">
            <button
              onClick={() => {
                navigate("/pricing");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              View full pricing & feature comparison
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Loved by Photographers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what professionals are saying about Fab Studio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[hsl(var(--fab-amber))] fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Fab Studio transformed my wedding photography business. I can
                deliver galleries to clients within hours instead of days. The
                AI face recognition is incredible!"
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    SM
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Sarah Mitchell
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Star className="h-3 w-3 text-[hsl(var(--fab-amber))] mr-1 fill-current" />
                    Wedding Photographer
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[hsl(var(--fab-amber))] fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "The professional plan is perfect for my growing studio.
                Unlimited galleries and custom branding have helped me look more
                professional to clients."
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    JR
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    James Rodriguez
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Star className="h-3 w-3 text-[hsl(var(--fab-amber))] mr-1 fill-current" />
                    Portrait Photographer
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-[hsl(var(--fab-amber))] fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "As a sports photographer, speed is everything. Fab Studio's
                instant upload and gallery creation has saved me countless
                hours."
              </p>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    ET
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Emma Thompson
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Star className="h-3 w-3 text-[hsl(var(--fab-amber))] mr-1 fill-current" />
                    Sports Photographer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 fab-gradient-amber">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Photography Business?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Join over 50,000 professional photographers who've streamlined their
            workflow with Fab Studio. Start your free trial today - no credit
            card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:min-w-[200px] bg-background text-foreground px-8 py-4 rounded-xl hover:bg-muted transition-all duration-300 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <ArrowRight className="h-5 w-5 mr-2 animate-pulse" />
                Start Free Trial
              </button>
            </Link>
            <button
              onClick={() => {
                navigate("/contact-us");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="w-full sm:min-w-[200px] sm:w-auto bg-transparent text-primary-foreground border-2 border-primary-foreground px-8 py-4 rounded-xl hover:bg-background hover:text-foreground transition-all duration-300 flex items-center justify-center text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1"
            >
              <Users className="h-5 w-5 mr-2" />
              Schedule Demo
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-primary-foreground/80">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
