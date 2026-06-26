import {
  Camera,
  Target,
  Users,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
  bgClass: string;
}

function AboutCard({
  icon,
  title,
  description,
  colorClass,
  bgClass,
}: AboutCardProps) {
  return (
    <div className="relative pt-12 pb-16 px-4 h-full group">
      {/* Side Wings - Matching the image's curved wings */}
      <div
        className={`absolute left-0 right-0 top-20 bottom-10 ${bgClass} opacity-20 rounded-[2.5rem] transition-all group-hover:scale-105 group-hover:opacity-30`}
      />

      {/* Main Card */}
      <div className="relative bg-white dark:bg-card border border-border rounded-xl p-8 shadow-xl flex flex-col items-center text-center h-full z-10 transition-transform group-hover:-translate-y-1">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white dark:bg-background border-2 ${colorClass.replace("bg-", "border-")} shadow-sm`}
        >
          {icon}
        </div>

        <h3 className="text-xl font-heading font-bold mb-4 tracking-widest uppercase text-foreground">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed font-body">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/about" />
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Banner Section */}
        <div className="relative h-[400px] md:h-[450px] rounded-xl overflow-hidden mb-8">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=600&fit=crop"
            alt="Team collaboration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              <span className="text-white font-sans font-normal">
                Discover smarter photo sharing with{" "}
              </span>
              <span className="font-['Poppins'] bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-bold tracking-wide">
                Fablead
              </span>
            </h1>
            <div className="mt-8 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/70" />
            </div>
          </div>
        </div>

        {/* About Us */}
        <div className="bg-card rounded-xl border border-border fab-shadow p-6 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-heading font-bold">About Us</h1>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl fab-gradient flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">fab-photo</h2>
              <p className="text-sm text-muted-foreground">
                AI-Powered Photo Sharing Platform
              </p>
            </div>
          </div>
          <p className="text-md text-muted-foreground leading-relaxed">
            Fab-Photo is a cutting-edge AI-powered photo sharing platform
            designed for photographers, businesses, and individuals who want a
            smarter way to manage and share event photos. By leveraging advanced
            facial recognition technology with up to 99.9% accuracy, Fab-Photo
            automatically identifies people in images and organizes photos
            effortlessly, eliminating the need for manual sorting and saving
            valuable time.
          </p>
          <p className="text-md text-muted-foreground leading-relaxed mt-4">
            With its intelligent and user-friendly system, Fab-Photo ensures
            that every user receives only their relevant photos instantly.
            Whether it's weddings, corporate events, or large gatherings, the
            platform delivers a seamless and personalized photo-sharing
            experience, making it faster, more efficient, and highly engaging
            for everyone involved.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <AboutCard
            icon={<Target className="w-8 h-8 text-fab-amber" />}
            title="Mission"
            description="To make photo sharing effortless and intelligent, ensuring every person gets their perfect moments delivered instantly."
            colorClass="bg-fab-amber"
            bgClass="bg-fab-amber"
          />
          <AboutCard
            icon={<Lightbulb className="w-8 h-8 text-fab-info" />}
            title="Vision"
            description="Building the world's most intelligent photo delivery platform, powered by AI and designed with privacy at its core."
            colorClass="bg-fab-info"
            bgClass="bg-fab-info"
          />
        </div>

        {/* Team */}
        <div className="bg-card rounded-xl border border-border fab-shadow p-6 mb-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Our Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Arjun Patel", "Sneha Gupta", "Vikram Singh", "Meera Joshi"].map(
              (name) => (
                <div key={name} className="text-center">
                  <div className="w-16 h-16 rounded-full fab-gradient mx-auto mb-2 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">Co-Founder</p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-xl border border-border fab-shadow p-6">
          <h2 className="font-heading font-semibold mb-4">Contact Us</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />{" "}
              hello@fabphoto.com
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" /> +91 98765
              43210
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />{" "}
              www.fabphoto.com
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
