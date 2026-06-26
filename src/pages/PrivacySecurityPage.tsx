import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Camera,
  Database,
  MonitorSmartphone,
  Lock,
  Shield,
  CheckCircle2,
  Info,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import SEOHead from "@/components/SEOHead";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const privacySections = [
  {
    id: "profile-visibility",
    icon: User,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    title: "Personal Data Collection",
    tagline: "What information we collect and how we use it",
    intro:
      "Fablead Studio collects personally identifiable information to provide and improve our service. We collect only what we need to run the service and you stay in control of your data.",
    points: [
      "Email address, first name, last name, and phone number for account management.",
      "Contact list information to help you connect with others on Fablead Studio.",
      "Facial data (selfie) stored for 10 years to help find your photos using face recognition.",
      "Usage data including IP address, browser type, device identifiers, and diagnostic information.",
      "Your facial data is never shared with third parties without your explicit consent.",
    ],
  },
  {
    id: "data-privacy",
    icon: Database,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    title: "Data Privacy & Control",
    tagline: "Manage how your personal data is used",
    intro:
      "You have complete control over your data. Download it, request deletion, or manage your preferences at any time. We never sell your data to advertisers or third parties.",
    points: [
      "Download a full copy of your account data at any time.",
      "Request permanent deletion of your account and all associated data.",
      "Opt out of analytics and usage tracking through your account settings.",
      "Manage cookie preferences and third-party integrations.",
      "Your data is never sold to advertisers or third parties without your consent.",
    ],
  },
  {
    id: "photo-privacy",
    icon: Camera,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    title: "Tracking & Cookies",
    tagline: "How we use cookies and tracking technologies",
    intro:
      "We use cookies and similar tracking technologies to improve your experience. You can control cookie settings in your browser, though some features may not work without essential cookies.",
    points: [
      "Essential cookies authenticate users and prevent fraudulent account use.",
      "Persistent cookies remember your login details and language preferences.",
      "Session cookies are deleted when you close your browser.",
      "Web beacons help us count users and track website statistics.",
      "Flash cookies may store your preferences for certain service features.",
    ],
  },
];

const securitySections = [
  {
    id: "data-retention",
    icon: Database,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    title: "Data Retention & Storage",
    tagline: "How long we keep your data and where it is processed",
    intro:
      "We retain your personal data only as long as necessary for the purposes outlined in our privacy policy. Your information may be processed at our operating offices or other locations where our service providers are based.",
    points: [
      "Personal data is retained only as long as necessary for service purposes.",
      "Usage data is generally retained for shorter periods unless needed for security or functionality.",
      "Facial data (selfies) are stored for 10 years from upload date, then you can re-upload if needed.",
      "Your data may be transferred to third parties to train computer vision models for better results.",
      "We ensure adequate controls are in place for any data transfers to protect your information.",
    ],
  },
  {
    id: "legal-disclosure",
    icon: Shield,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    title: "Legal Requirements & Disclosure",
    tagline: "When and how we may disclose your information",
    intro:
      "We may disclose your personal data when required by law, for business transfers, or to protect the rights and safety of our users and service. We will notify you of any privacy policy changes.",
    points: [
      "We disclose data when required by law or valid requests from public authorities (courts, government agencies).",
      "Your data may be transferred during mergers, acquisitions, or asset sales with prior notice.",
      "We may share information to comply with legal obligations and protect our service from misuse.",
      "We disclose data to protect personal safety of users and prevent wrongdoing.",
      "We will notify you of any changes to this Privacy Policy via email or prominent notice on our service.",
    ],
  },
  {
    id: "service-providers",
    icon: MonitorSmartphone,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    title: "Service Providers & Sharing",
    tagline: "How we share your data with trusted partners",
    intro:
      "We may share your personal information with service providers and business partners to facilitate our service, provide better features, and improve your experience.",
    points: [
      "Service providers assist us in monitoring and analyzing service usage to improve functionality.",
      "We may share information with affiliates, subsidiaries, and joint venture partners under this Privacy Policy.",
      "Business partners may assist in research and training to help us offer better services.",
      "When you interact in public areas, your information may be viewed by all users and publicly distributed.",
      "We disclose data only with your consent for purposes not outlined in this Privacy Policy.",
    ],
  },
];

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */

type Section = (typeof privacySections)[0];

const SectionCard = ({
  section,
  index,
}: {
  section: Section;
  index: number;
}) => {
  const Icon = section.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="bg-card rounded-xl border border-border fab-shadow flex flex-col overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.iconBg}`}
        >
          <Icon className={`w-5 h-5 ${section.iconColor}`} />
        </div>
        <div>
          <p className="font-heading font-semibold text-sm">{section.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {section.tagline}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Intro */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {section.intro}
        </p>

        {/* Bullet points */}
        <ul className="space-y-2.5">
          {section.points.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="leading-snug">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   GROUP BLOCK
───────────────────────────────────────────── */

const GroupBlock = ({
  icon: Icon,
  title,
  subtitle,
  sections,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  sections: Section[];
}) => (
  <div className="bg-card rounded-xl border border-border fab-shadow overflow-hidden mb-8">
    {/* Group Header */}
    <div className="p-4 md:p-5 border-b border-border bg-muted/30">
      <h2 className="font-heading font-semibold flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>

    {/* Cards Grid */}
    <div className="p-4 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, index) => (
          <SectionCard key={section.id} section={section} index={index} />
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

const PrivacySecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/privacy-security" />
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold">
            Privacy & Security
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <p className="text-sm text-muted-foreground">
            All changes take effect immediately. Fablead Studio never shares
            your personal data or photos with third parties without your
            explicit consent. Your data is processed securely in accordance with
            our Privacy Policy.
          </p>
        </div>

        {/* Privacy Settings Group */}
        <GroupBlock
          icon={Shield}
          title="Privacy Settings"
          subtitle="Understand how Fablead Studio collects, uses, and protects your personal data"
          sections={privacySections}
        />

        {/* Security Settings Group */}
        <GroupBlock
          icon={Lock}
          title="Security & Legal"
          subtitle="Data retention, legal requirements, and how we share your information"
          sections={securitySections}
        />
      </main>
    </div>
  );
};

export default PrivacySecurityPage;
