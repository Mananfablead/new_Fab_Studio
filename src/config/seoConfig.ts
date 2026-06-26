// ============================================================
//  CENTRALIZED SEO CONFIG — Sirf yahi ek jagah se sab pages
//  ka Title, Description aur Keywords update karo!
// ============================================================

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean; // true = private/auth pages ko search engines se chhupao
}

/** Default fallback meta (agar koi route match na ho) */
export const defaultSEO: SEOMeta = {
  title: "Fablead Studio – Smart Photo Sharing for Photographers",
  description:
    "Fablead Studio by Fablead Studio – Upload, organize, share & deliver photos to clients with watermark, flipbook & portfolio features.",
  keywords:
    "photo sharing, photography platform, watermark photos, photo delivery, photographer tool, flipbook, portfolio, fablead studio, Fablead Studio",
  ogTitle: "Fablead Studio – Smart Photo Sharing for Photographers",
  ogDescription:
    "Upload, organize & deliver photos to clients with watermark, flipbook and portfolio features.",
  ogImage: "/og-image.png",
  twitterTitle: "Fablead Studio – Smart Photo Sharing",
  twitterDescription:
    "Deliver photos to clients with watermark, flipbook and portfolio features.",
};

// ---------------------------------------------------------------
//  Route → SEO mapping
//  Pattern ke liye use karo: "/gallery/:groupId" jaise wild-card
//  SEOHead component isko match karega.
// ---------------------------------------------------------------
export const routeSEOMap: Record<string, SEOMeta> = {
  // ── Landing / Public Pages ───────────────────────────────────
  "/home": {
    title: "Fablead Studio – Smart Photo Sharing Platform for Photographers",
    description:
      "Fablead Studio is the all-in-one photo sharing platform. Share photos with clients, add watermarks, create flipbooks & build your portfolio.",
    keywords:
      "photo sharing platform, professional photography, photo delivery, watermark photos, flipbook creator, portfolio builder, Fablead Studio",
    ogTitle: "Fablead Studio – Smart Photo Sharing Platform",
    ogDescription:
      "Share photos with clients, add watermarks, create flipbooks & build your portfolio.",
    ogImage: "/og-image.png",
    twitterTitle: "Fablead Studio – Smart Photo Sharing",
    twitterDescription:
      "Share photos, add watermarks, create flipbooks & portfolios.",
  },

  "/aboutus": {
    title: "About Us – Fablead Studio | Fablead Studio",
    description:
      "Learn about Fablead Studio and the team behind Fablead Studio. Our mission is to empower photographers with smart photo sharing tools.",
    keywords:
      "about Fablead Studio, about fablead studio, photography team, photo sharing mission",
    ogTitle: "About Fablead Studio – Fablead Studio",
    ogDescription:
      "Meet the team behind Fablead Studio and learn about our photography mission.",
  },

  "/contact-us": {
    title: "Contact Us – Fablead Studio | Fablead Studio",
    description:
      "Get in touch with the Fablead Studio team. We're here to help with any questions about our photo sharing platform.",
    keywords:
      "contact Fablead Studio, fablead studio contact, support, photo sharing help",
    ogTitle: "Contact Fablead Studio",
    ogDescription: "Reach out to our team for support or inquiries.",
  },

  "/pricing": {
    title: "Pricing Plans – Fablead Studio | Affordable Photo Sharing",
    description:
      "Explore Fablead Studio pricing plans. Flexible options for individual photographers, studios & agencies. Start free today!",
    keywords:
      "Fablead Studio pricing, photo sharing plans, photography subscription, affordable photo delivery",
    ogTitle: "Fablead Studio Pricing – Flexible Plans for Photographers",
    ogDescription:
      "Flexible pricing plans for individual photographers, studios & agencies.",
  },

  "/privacy": {
    title: "Privacy Policy – Fablead Studio",
    description:
      "Read the Fablead Studio privacy policy. Learn how we collect, use and protect your personal data and photos.",
    keywords:
      "Fablead Studio privacy policy, data protection, photo platform privacy",
    noIndex: false,
  },

  "/terms": {
    title: "Terms of Service – Fablead Studio",
    description:
      "Read the Fablead Studio terms of service. Understand the rules and guidelines for using our photo sharing platform.",
    keywords:
      "Fablead Studio terms of service, terms and conditions, photo platform terms",
    noIndex: false,
  },

  "/delete-account": {
    title: "Delete Account – Fablead Studio",
    description:
      "Request to permanently delete your Fablead Studio account and all associated data.",
    keywords: "delete account Fablead Studio, remove account, data deletion",
    noIndex: true,
  },

  "/portfolio": {
    title: "Photographer Portfolio – Fablead Studio",
    description:
      "View professional photography portfolio. Discover stunning photo collections on Fablead Studio.",
    keywords:
      "photographer portfolio, photo portfolio, professional photography, Fablead Studio portfolio",
    ogTitle: "Photographer Portfolio on Fablead Studio",
    ogDescription:
      "Discover stunning photography portfolios on Fablead Studio.",
  },

  "/join": {
    title: "Join Group – Fablead Studio",
    description:
      "You've been invited to join a photo group on Fablead Studio. Accept the invitation to view and share photos.",
    keywords: "join photo group, photo sharing invite, Fablead Studio group",
    noIndex: true,
  },

  // ── Auth Pages ───────────────────────────────────────────────
  "/login": {
    title: "Login – Fablead Studio",
    description:
      "Sign in to your Fablead Studio account to manage and share your photos with clients.",
    keywords: "Fablead Studio login, sign in, photographer account",
    noIndex: true,
  },

  "/reset-password": {
    title: "Reset Password – Fablead Studio",
    description: "Reset your Fablead Studio account password securely.",
    keywords: "reset password, Fablead Studio account recovery",
    noIndex: true,
  },

  // ── Protected / App Pages ────────────────────────────────────
  "/dashboard": {
    title: "Dashboard – Fablead Studio",
    description:
      "Manage your photo groups, galleries and client deliveries from your Fablead Studio dashboard.",
    keywords: "Fablead Studio dashboard, photo management, photo groups",
    noIndex: true,
  },

  "/gallery": {
    title: "Photo Gallery – Fablead Studio",
    description:
      "Browse and manage your photo gallery. View, organize and share photos with clients.",
    keywords: "photo gallery, Fablead Studio gallery, photo management",
    noIndex: true,
  },

  "/analytics": {
    title: "Analytics – Fablead Studio",
    description:
      "View detailed analytics for your photo groups – views, downloads and engagement insights.",
    keywords: "photo analytics, Fablead Studio analytics, photography insights",
    noIndex: true,
  },

  "/notifications": {
    title: "Notifications – Fablead Studio",
    description:
      "Stay updated with the latest activity and notifications on your Fablead Studio account.",
    keywords: "Fablead Studio notifications, photo alerts",
    noIndex: true,
  },

  "/help": {
    title: "Help Center – Fablead Studio",
    description:
      "Find answers to common questions and get help with Fablead Studio features.",
    keywords: "Fablead Studio help, photo sharing support, faq",
    noIndex: false,
  },

  "/tutorials": {
    title: "Tutorials – Fablead Studio",
    description:
      "Step-by-step tutorials to get the most out of Fablead Studio – watermarks, flipbooks, portfolios & more.",
    keywords:
      "Fablead Studio tutorials, how to use Fablead Studio, photography guide",
    noIndex: false,
  },

  "/about": {
    title: "About Fablead Studio – Fablead Studio",
    description:
      "Learn more about Fablead Studio features and the Fablead Studio team behind it.",
    keywords: "about Fablead Studio, fablead studio, photography platform info",
  },

  "/privacy-security": {
    title: "Privacy & Security – Fablead Studio",
    description: "Manage your privacy and security settings on Fablead Studio.",
    keywords:
      "privacy settings, security settings, Fablead Studio account security",
    noIndex: true,
  },

  "/group-settings": {
    title: "Group Settings – Fablead Studio",
    description:
      "Configure your photo group settings – participants, privacy, folders, branding and more.",
    keywords: "photo group settings, Fablead Studio group, group management",
    noIndex: true,
  },

  // ── Settings Sub-Pages ───────────────────────────────────────
  "/settings/profile": {
    title: "Profile Settings – Fablead Studio",
    description:
      "Update your profile information and account details on Fablead Studio.",
    keywords: "profile settings, account settings, Fablead Studio profile",
    noIndex: true,
  },

  "/settings/preferences": {
    title: "Preferences – Fablead Studio Settings",
    description:
      "Customize your Fablead Studio experience with personal preferences.",
    keywords: "preferences, app settings, Fablead Studio customization",
    noIndex: true,
  },

  "/settings/branding": {
    title: "Branding Settings – Fablead Studio",
    description:
      "Set up your studio branding on Fablead Studio – logo, colors and more.",
    keywords: "branding settings, studio branding, Fablead Studio brand",
    noIndex: true,
  },

  "/settings/team": {
    title: "Team Settings – Fablead Studio",
    description: "Manage your team members and roles on Fablead Studio.",
    keywords: "team management, Fablead Studio team, photographer team",
    noIndex: true,
  },

  "/settings/flipbook": {
    title: "Flipbook Settings – Fablead Studio",
    description:
      "Configure your flipbook settings for stunning photo slideshows.",
    keywords: "flipbook settings, photo flipbook, Fablead Studio flipbook",
    noIndex: true,
  },

  "/settings/watermark": {
    title: "Watermark Settings – Fablead Studio",
    description:
      "Set up and customize your photo watermarks to protect your work.",
    keywords:
      "watermark settings, photo watermark, protect photos, Fablead Studio watermark",
    noIndex: true,
  },

  "/settings/portfolio": {
    title: "Portfolio Settings – Fablead Studio",
    description:
      "Build and manage your online photography portfolio on Fablead Studio.",
    keywords:
      "portfolio settings, online portfolio, photography portfolio, Fablead Studio",
    noIndex: true,
  },

  "/settings/wallet": {
    title: "Wallet – Fablead Studio",
    description:
      "Manage your Fablead Studio wallet balance and payment methods.",
    keywords: "wallet, Fablead Studio wallet, payment, balance",
    noIndex: true,
  },

  "/settings/transactions": {
    title: "Transactions – Fablead Studio",
    description: "View your complete transaction history on Fablead Studio.",
    keywords: "transactions, payment history, Fablead Studio billing",
    noIndex: true,
  },

  // ── 404 ─────────────────────────────────────────────────────
  "/404": {
    title: "Page Not Found – Fablead Studio",
    description:
      "Oops! The page you're looking for doesn't exist on Fablead Studio.",
    keywords: "404, page not found, Fablead Studio",
    noIndex: true,
  },
};
