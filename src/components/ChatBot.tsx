import { MessageCircle, X, ChevronLeft, Camera, Image, Users, Star, Briefcase, Check, Send, AlertCircle, CheckCircle, Loader2, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPlans, submitPlanInquiry } from '@/store/slices/plansSlice';
import { selectPlans, selectPlansLoading } from '@/store/selectors';
import { useAuth } from '@/contexts/AuthContext';
import type { Plan } from '@/store/slices/plansSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'welcome' | 'topic' | 'subtopic' | 'info' | 'plan-type' | 'plan-comparison' | 'plan-details' | 'contact-form';

interface TopicOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  followUp: string;
  subtopics: SubtopicOption[];
}

interface SubtopicOption {
  id: string;
  label: string;
  description: string;
  details: string[];
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  role?: string;
  plan?: string;
  plan_id?: string | number;
}

// ─── Topic / Subtopic Data ────────────────────────────────────────────────────

const TOPICS: TopicOption[] = [
  {
    id: 'photo-gallery',
    label: 'Photo Gallery',
    icon: <Image className="w-4 h-4" />,
    description: 'Create stunning digital galleries for your events and share them instantly with your clients.',
    followUp: 'Great! What would you like to know about Photo Galleries?',
    subtopics: [
      {
        id: 'create-gallery',
        label: 'Create a Gallery',
        description: 'Learn how to set up your first event gallery and upload photos.',
        details: [
          'Navigate to the "Groups" section in your dashboard.',
          'Click on "Create Group" and enter event details.',
          'Upload photos using our high-speed bulk uploader.',
          'Your gallery is now live and ready to share!'
        ]
      },
      {
        id: 'share-gallery',
        label: 'Share with Clients',
        description: 'Methods to share galleries via link, email, or QR code.',
        details: [
          'Each group has a unique, customizable invite link.',
          'Generate QR codes for instant physical access at events.',
          'Send automated email invitations to your participants.',
          'Embed galleries directly into your own website.'
        ]
      },
      {
        id: 'gallery-privacy',
        label: 'Privacy & Access Control',
        description: 'Setting up PIN protection, face verification, and member permissions.',
        details: [
          'Enable PIN protection for sensitive event albums.',
          'Use AI Face Recognition for personalized private access.',
          'Control who can view, upload, or download photos.',
          'Set expiration dates for gallery access links.'
        ]
      },
      {
        id: 'gallery-storage',
        label: 'Storage & Limits',
        description: 'Understanding storage capacity and photo count limits for your plan.',
        details: [
          'Free plan includes 1GB of high-speed cloud storage.',
          'Pro plan offers 100GB with unlimited photo counts.',
          'Studio plan provides TB-level storage for massive archives.',
          'All photos are stored with multi-region redundancy.'
        ]
      },
    ],
  },
  {
    id: 'ai-features',
    label: 'AI Features',
    icon: <Star className="w-4 h-4" />,
    description: 'Leverage artificial intelligence for face recognition, automatic tagging, and smart delivery.',
    followUp: 'Awesome! Which AI feature are you curious about?',
    subtopics: [
      {
        id: 'face-recognition',
        label: 'Face Recognition',
        description: 'Automatically find and deliver photos to participants using their faces.',
        details: [
          'Participants simply upload a selfie to find their photos.',
          'Our AI scans the entire gallery in milliseconds.',
          'Private, secure, and highly accurate matching.',
          'Works even with masks, glasses, and different angles.'
        ]
      },
      {
        id: 'auto-tagging',
        label: 'Auto Tagging & Sorting',
        description: 'Organize thousands of photos automatically based on content and people.',
        details: [
          'Automatic detection of event types and scenes.',
          'Tags created for people, objects, and locations.',
          'Search your entire archive using simple keywords.',
          'Smart albums generated based on detected themes.'
        ]
      },
      {
        id: 'smart-delivery',
        label: 'Smart Photo Delivery',
        description: 'Instant notification and delivery to guests as soon as photos are uploaded.',
        details: [
          'Real-time processing as you upload from your camera.',
          'Push notifications sent to matched participants instantly.',
          'No more waiting for weeks to see event photos.',
          'Seamless social media sharing integrated.'
        ]
      },
      {
        id: 'ai-enhancement',
        label: 'AI Photo Enhancement',
        description: 'Automatically improve photo quality, colors, and lighting using AI.',
        details: [
          'One-click enhancement for entire galleries.',
          'Noise reduction and sharpening for low-light shots.',
          'Dynamic range optimization for perfect exposures.',
          'Consistent "look and feel" across your whole event.'
        ]
      },
    ],
  },
  {
    id: 'photographer-tools',
    label: 'Photographer Tools',
    icon: <Camera className="w-4 h-4" />,
    description: 'Professional tools for watermarking, bulk management, and custom branding.',
    followUp: 'Sure! What photographer tool can we help you with?',
    subtopics: [
      {
        id: 'upload-tools',
        label: 'Bulk Upload & Management',
        description: 'Efficient ways to upload and organize large volumes of photos.',
        details: [
          'Drag-and-drop support for thousands of files.',
          'Automatic folder-to-group organization.',
          'Background uploading while you continue working.',
          'Support for RAW and high-resolution JPEG formats.'
        ]
      },
      {
        id: 'watermark',
        label: 'Watermarking',
        description: 'Protect your work with custom watermarks applied to all gallery photos.',
        details: [
          'Upload your own custom transparent PNG logo.',
          'Choose position, size, and opacity levels.',
          'Batch apply to all existing and future photos.',
          'Watermarks are removed automatically upon purchase/authorized download.'
        ]
      },
      {
        id: 'branding',
        label: 'Custom Branding',
        description: 'Add your logo and brand colors to the client-facing gallery and emails.',
        details: [
          'Fully white-label your client galleries.',
          'Custom domains for your photography studio.',
          'Branded email notifications for delivery.',
          'Consistent professional look across every touchpoint.'
        ]
      },
      {
        id: 'flipbook',
        label: 'Flipbook Feature',
        description: 'Create an interactive, turning-page digital book from your best shots.',
        details: [
          'Select best photos and convert to a Digital Flipbook.',
          'Realistic page-turning animations and sounds.',
          'Embed flipbooks on your site or share via link.',
          'Perfect for weddings, portfolios, and lookbooks.'
        ]
      },
    ],
  },
  {
    id: 'client-experience',
    label: 'Client Experience',
    icon: <Users className="w-4 h-4" />,
    description: 'Optimized viewing experience for guests with selfie-matching and easy downloads.',
    followUp: 'Happy to help! What aspect of client experience interests you?',
    subtopics: [
      {
        id: 'client-gallery',
        label: 'Client Gallery Access',
        description: 'How clients view, search, and interact with their event photos.',
        details: [
          'Mobile-first, responsive design for on-the-go viewing.',
          'Fast-loading thumbnails and full-resolution previews.',
          'Intuitive swipe and zoom gestures.',
          'Easy "Favorites" hearting for curation.'
        ]
      },
      {
        id: 'selfie-match',
        label: 'Selfie Photo Matching',
        description: 'Let guests find their own photos instantly by just taking a selfie.',
        details: [
          'Guest takes a selfie through the gallery interface.',
          'Instant "Found You!" results with all their photos.',
          'Privacy-focused: guests only see their own matches if configured.',
          'Highest engagement rate for event participants.'
        ]
      },
      {
        id: 'downloads',
        label: 'Photo Downloads',
        description: 'Controlling download quality and bulk download permissions.',
        details: [
          'Single photo or full album bulk downloads.',
          'Choose between original resolution or web-optimized.',
          'PIN-protected downloads for extra security.',
          'Track who downloaded what and when.'
        ]
      },
      {
        id: 'favorites',
        label: 'Favorites & Collections',
        description: 'Allow clients to curate and select their favorite photos from the event.',
        details: [
          'Clients can "heart" photos to create a shortlist.',
          'Export favorite lists for physical album printing.',
          'Share favorite collections with friends and family.',
          'Photographers can see client favorites in real-time.'
        ]
      },
    ],
  },
  {
    id: 'pricing-plans',
    label: 'Pricing & Plans',
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Flexible pricing models tailored for individual photographers and large studios.',
    followUp: 'Let me help you find the right plan. What would you like to know?',
    subtopics: [
      {
        id: 'plan-comparison',
        label: 'Compare Plans',
        description: 'Detailed breakdown of features and limits for Free, Pro, and Studio plans.',
        details: [
          'Free Plan: 1GB storage, basic features, community support, perfect for getting started.',
          'Pro Plan: 100GB storage, AI face recognition, custom branding, priority email support.',
          'Studio Plan: Unlimited storage, full white-label solution, dedicated account manager, API access.',
          'All plans include secure cloud storage, mobile app access, and automatic backups.'
        ]
      },
      {
        id: 'free-trial',
        label: 'Free Trial',
        description: 'Information about our trial period and what you get for free.',
        details: [
          '14-day full access to all Pro features at no cost.',
          'No credit card required to start your trial.',
          'Full access to AI face recognition and custom branding.',
          'Keep your data if you decide to upgrade after the trial ends.'
        ]
      },
      {
        id: 'upgrade',
        label: 'Upgrade / Downgrade',
        description: 'How to change your plan as your business grows.',
        details: [
          'Instantly switch plans via your billing dashboard.',
          'Prorated charges when upgrading mid-month.',
          'Storage limits expand immediately upon upgrade.',
          'Downgrades take effect at the end of your billing cycle.'
        ]
      },
      {
        id: 'billing',
        label: 'Billing & Payment',
        description: 'Managing your subscription, invoices, and payment methods.',
        details: [
          'Secure payments via Stripe and PayPal.',
          'Downloadable PDF invoices for every transaction.',
          'Automated renewal for uninterrupted service.',
          'Securely manage saved cards and billing information in your account.'
        ]
      },
    ],
  },
  {
    id: 'website-portfolio',
    label: 'Website & Portfolio',
    icon: <Globe className="w-4 h-4" />,
    description: 'Build stunning portfolio websites to showcase your photography work and attract clients.',
    followUp: 'Great choice! What would you like to know about creating your portfolio website?',
    subtopics: [
      {
        id: 'create-website',
        label: 'Create Your Website',
        description: 'Step-by-step guide to setting up your professional photography portfolio website.',
        details: [
          'Navigate to "Settings" > "Portfolio" in your dashboard.',
          'Choose from professional templates designed for photographers.',
          'Customize colors, fonts, and layout to match your brand.',
          'Add your logo and business information for a professional look.'
        ]
      },
      {
        id: 'portfolio-galleries',
        label: 'Portfolio Galleries',
        description: 'Showcase your best work in beautiful, organized gallery sections.',
        details: [
          'Create multiple portfolio sections for different photography styles.',
          'Drag-and-drop to arrange photos in your preferred order.',
          'Set featured images for each portfolio section.',
          'Add descriptions and stories to give context to your work.'
        ]
      },
      {
        id: 'custom-domain',
        label: 'Custom Domain',
        description: 'Connect your own domain name for a professional web presence.',
        details: [
          'Purchase a domain or use one you already own.',
          'Easy DNS configuration through our dashboard.',
          'Free SSL certificate included for secure connections.',
          'Professional email addresses with your domain (e.g., contact@yourstudio.com).'
        ]
      },
      {
        id: 'seo-optimization',
        label: 'SEO Optimization',
        description: 'Optimize your portfolio for search engines to attract more clients.',
        details: [
          'Add meta titles and descriptions for each portfolio page.',
          'Automatic sitemap generation for search engines.',
          'Image alt text optimization for better accessibility.',
          'Google Analytics integration to track your visitors.'
        ]
      },
      {
        id: 'contact-integration',
        label: 'Contact Forms & Booking',
        description: 'Add contact forms and booking systems to convert visitors into clients.',
        details: [
          'Customizable contact forms with your preferred fields.',
          'Direct inquiry notifications to your email.',
          'Integration with booking systems for session scheduling.',
          'Social media links to connect across all platforms.'
        ]
      },
      {
        id: 'mobile-responsive',
        label: 'Mobile Responsive Design',
        description: 'Your portfolio looks perfect on all devices - phones, tablets, and desktops.',
        details: [
          'Automatic optimization for all screen sizes.',
          'Touch-friendly navigation for mobile users.',
          'Fast loading times even on slower connections.',
          'Test your site across multiple devices in real-time.'
        ]
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  const [selectedTopic, setSelectedTopic] = useState<TopicOption | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicOption | null>(null);
  const [planType, setPlanType] = useState<'user' | 'photographer' | null>(null);
  const [selectedPlanOption, setSelectedPlanOption] = useState<'compare' | 'free-trial' | 'upgrade' | 'billing' | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    role: '',
    plan: '',
    plan_id: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [selectedApiPlan, setSelectedApiPlan] = useState<Plan | null>(null);
  
  const chatbotRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const plans = useAppSelector(selectPlans);
  const plansLoading = useAppSelector(selectPlansLoading);
  const { user, isAuthenticated } = useAuth();

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Fetch plans when plan-comparison step is reached
  useEffect(() => {
    if (step === 'plan-comparison' && planType) {
      dispatch(fetchPlans(planType));
    }
  }, [step, planType, dispatch]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleOpen = () => {
    setOpen(true);
    setStep('welcome');
    // Pre-populate form with logged-in user data if available
    if (isAuthenticated && user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  const reset = () => {
    setStep('welcome');
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setPlanType(null);
    setSelectedPlanOption(null);
    setSelectedApiPlan(null);
    setContactForm({ name: '', email: '', subject: '', message: '', role: '', plan: '', plan_id: '' });
    setContactSuccess(false);
    setContactError(null);
  };

  const handleTopicSelect = (topic: TopicOption) => {
    setSelectedTopic(topic);
    if (topic.id === 'pricing-plans') {
      setStep('plan-type');
    } else {
      setStep('subtopic');
    }
  };

  const handleSubtopicSelect = (sub: SubtopicOption) => {
    setSelectedSubtopic(sub);
    setStep('info');
  };

  const handlePlanTypeSelect = (type: 'user' | 'photographer') => {
    setPlanType(type);
    setStep('plan-comparison');
  };

  const handlePlanOptionSelect = (option: 'compare' | 'free-trial' | 'upgrade' | 'billing') => {
    setSelectedPlanOption(option);
    setStep('plan-details');
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If plan is being changed, find and set the plan_id
    if (name === 'plan') {
      const selectedPlan = plans.find(p => p.name === value);
      setContactForm({
        ...contactForm,
        [name]: value,
        plan_id: selectedPlan?.id || ''
      });
    } else {
      setContactForm({
        ...contactForm,
        [name]: value
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      // Prepare payload - use logged-in user data if available
      const payload: any = {
        name: isAuthenticated && user ? user.name : contactForm.name,
        email: isAuthenticated && user ? user.email : contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
      };

      if (contactForm.role) {
        payload.role = contactForm.role;
      }

      if (contactForm.plan_id) {
        payload.plan_id = contactForm.plan_id;
      }

      // Add plan context if coming from pricing-plans topic
      if (selectedTopic?.id === 'pricing-plans') {
        payload.role = contactForm.role || planType || payload.role;
      }

      // Submit contact form via API
      const response = await fetch('https://fablead-studio.com/services/api/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const data = await response.json();
      setContactSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '', role: '', plan: '', plan_id: '' });
      setTimeout(() => {
        setContactSuccess(false);
        reset();
      }, 3000);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'subtopic') setStep('topic');
    else if (step === 'info') setStep('subtopic');
    else if (step === 'plan-type') setStep('topic');
    else if (step === 'plan-comparison') setStep('plan-type');
    else if (step === 'plan-details') { setSelectedApiPlan(null); setStep('plan-comparison'); }
    else if (step === 'contact-form') {
      if (selectedSubtopic) setStep('info');
      else if (selectedPlanOption) setStep('plan-details');
      else if (planType) setStep('plan-comparison');
      else setStep('topic');
    }
  };

  // Helper function to format bytes
  function formatBytes(bytes: number): string {
    if (bytes === 0) return 'Unlimited';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  // Build capabilities from plan
  function buildCapabilities(plan: Plan): Array<{ label: string; value: string | boolean }> {
    const rows: Array<{ label: string; value: string | boolean }> = [];

    if (plan.max_photos !== undefined && plan.max_photos !== null) {
      rows.push({
        label: 'Photos',
        value: plan.max_photos === 0 ? 'Unlimited' : plan.max_photos.toLocaleString('en-IN'),
      });
    }
    if (plan.max_videos !== undefined && plan.max_videos !== null && plan.max_videos !== 0) {
      rows.push({
        label: 'Videos',
        value: plan.max_videos.toLocaleString('en-IN'),
      });
    }
    if (plan.max_storage_bytes !== undefined && plan.max_storage_bytes !== null) {
      rows.push({
        label: 'Storage',
        value: plan.max_storage_bytes === 0 ? 'Unlimited' : formatBytes(plan.max_storage_bytes),
      });
    }
    if (plan.max_events !== undefined && plan.max_events !== null) {
      rows.push({
        label: 'Events',
        value: plan.max_events === 0 ? 'Unlimited' : plan.max_events.toLocaleString('en-IN'),
      });
    }
    if (plan.has_custom_watermark === true) {
      rows.push({
        label: 'Custom Watermark',
        value: true,
      });
    }
    if (plan.has_face_recognition === true) {
      rows.push({
        label: 'Face Recognition',
        value: true,
      });
    }
    if (plan.has_bulk_download === true) {
      rows.push({
        label: 'Bulk Download',
        value: true,
      });
    }
    if (plan.has_business_branding === true) {
      rows.push({
        label: 'Business Branding',
        value: true,
      });
    }
    if (plan.has_digital_album === true) {
      rows.push({
        label: 'Digital Flipbook',
        value: true,
      });
    }
    if (plan.has_portfolio_website === true) {
      rows.push({
        label: 'Portfolio Website',
        value: true,
      });
    }
    if (plan.has_switch_downloads === true) {
      rows.push({
        label: 'Switch Downloads',
        value: true,
      });
    }
    if (plan.has_team_login === true) {
      rows.push({
        label: 'Team Login',
        value: true,
      });
    }
    if (plan.has_view_client_favorites === true) {
      rows.push({
        label: 'View Client Favorites',
        value: true,
      });
    }

    if (rows.length === 0 && plan.features) {
      const featureList = Array.isArray(plan.features)
        ? plan.features.map(String)
        : Object.entries(plan.features).map(([k, v]) => {
          const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          return v === true || v === 1 ? label : `${label}: ${v}`;
        });
      featureList.forEach((f) => rows.push({ label: f, value: true }));
    }

    return rows;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Open chat support"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full fab-gradient-amber flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop for closing when clicking outside */}
      <div 
        className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[1px]" 
        onClick={handleClose}
      />
      
      <div
        ref={chatbotRef}
        className="fixed bottom-6 left-1/2 z-[70] w-[360px] sm:w-[400px] -translate-x-1/2 transform md:bottom-8 md:right-8 md:left-auto md:translate-x-0 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ height: '580px' }}
      >
      {/* ── Header ── */}
      <div className="fab-gradient-amber px-5 py-4 relative flex items-center justify-center flex-shrink-0">
        {(step === 'subtopic' || step === 'info' || step === 'plan-type' || step === 'plan-comparison' || step === 'plan-details' || step === 'contact-form') && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white border border-white/20 shadow-sm hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 font-bold" />
          </button>
        )}
        <div className="text-center">
          <p className="text-white font-semibold text-sm leading-tight">Fablead Studio Support</p>
          <p className="text-white/80 text-xs">We reply instantly</p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">

        {/* Welcome / Topic step */}
        {(step === 'welcome' || step === 'topic') && (
          <>
            {/* Bot message */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm leading-relaxed">
                  👋 Hi there! Welcome to <strong>Fablead Studio</strong>. I'm here to help you find the perfect solution for your photography needs.
                </p>
                <p className="text-gray-800 text-sm leading-relaxed mt-2">
                  What are you interested in today?
                </p>
                <p className="text-gray-400 text-[10px] mt-2">{now}</p>
              </div>
            </div>

            {/* Topic option chips */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-3 px-1">Choose a topic</p>
              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:border-red-300 transition-all duration-150 text-sm font-medium text-left"
                  >
                    {topic.icon}
                    <span className="leading-tight">{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Subtopic step */}
        {step === 'subtopic' && selectedTopic && (
          <>
            {/* User selection echo */}
            <div className="flex justify-end">
              <div className="fab-gradient-amber rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                <p className="text-white text-sm font-medium">{selectedTopic.label}</p>
                <p className="text-white/70 text-[10px] mt-1">{now}</p>
              </div>
            </div>

            {/* Bot follow-up */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm font-medium mb-1">About {selectedTopic.label}</p>
                <p className="text-gray-600 text-xs leading-relaxed mb-3 italic">{selectedTopic.description}</p>
                <p className="text-gray-800 text-sm leading-relaxed">{selectedTopic.followUp}</p>
                <p className="text-gray-400 text-[10px] mt-2">{now}</p>
              </div>
            </div>

            {/* Subtopic chips */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-3 px-1">Select an option</p>
              <div className="flex flex-col gap-2">
                {selectedTopic.subtopics.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubtopicSelect(sub)}
                    className="flex items-center px-4 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:border-red-300 transition-all duration-150 text-sm font-medium text-left"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Info step (Knowledge Base) */}
        {step === 'info' && selectedTopic && selectedSubtopic && (
          <>
            {/* User selection echo */}
            <div className="flex justify-end">
              <div className="fab-gradient-amber rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                <p className="text-white text-sm font-medium">{selectedSubtopic.label}</p>
                <p className="text-white/70 text-[10px] mt-1">{now}</p>
              </div>
            </div>

            {/* Bot information delivery */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm max-w-[85%]">
                <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2 py-1 mb-3 w-fit">
                  <span className="text-red-500">{selectedTopic.icon}</span>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{selectedTopic.label}</span>
                </div>

                <h3 className="text-gray-800 font-bold text-base mb-2">{selectedSubtopic.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{selectedSubtopic.description}</p>

                <div className="space-y-3">
                  {selectedSubtopic.details.map((detail, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-snug">{detail}</p>
                    </div>
                  ))}
                </div>

                <p className="text-gray-400 text-[10px] mt-4">{now}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setStep('contact-form')}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Contact Us
              </button>
              <button
                onClick={() => setStep('topic')}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Explore Other Topics
              </button>
              {/* <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl fab-gradient-amber text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Got it, thanks!
              </button> */}
            </div>
          </>
        )}

        {/* Plan Type Selection Step */}
        {step === 'plan-type' && selectedTopic && (
          <>
            {/* User selection echo */}
            <div className="flex justify-end">
              <div className="fab-gradient-amber rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                <p className="text-white text-sm font-medium">{selectedTopic.label}</p>
                <p className="text-white/70 text-[10px] mt-1">{now}</p>
              </div>
            </div>

            {/* Bot follow-up */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm leading-relaxed">Are you a photographer or a user looking for plans?</p>
                <p className="text-gray-400 text-[10px] mt-2">{now}</p>
              </div>
            </div>

            {/* Plan type selection */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-3 px-1">Select your role</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handlePlanTypeSelect('photographer')}
                  className="flex items-center px-4 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:border-red-300 transition-all duration-150 text-sm font-medium text-left gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Photographer Plans
                </button>
                <button
                  onClick={() => handlePlanTypeSelect('user')}
                  className="flex items-center px-4 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:border-red-300 transition-all duration-150 text-sm font-medium text-left gap-2"
                >
                  <Users className="w-4 h-4" />
                  User Plans
                </button>
              </div>
            </div>
          </>
        )}

        {/* Plan Comparison Step - Show Real Plans from API */}
        {step === 'plan-comparison' && planType && (
          <>
            {/* User selection echo */}
            <div className="flex justify-end">
              <div className="fab-gradient-amber rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                <p className="text-white text-sm font-medium">{planType === 'photographer' ? 'Photographer Plans' : 'User Plans'}</p>
                <p className="text-white/70 text-[10px] mt-1">{now}</p>
              </div>
            </div>

            {/* Bot message */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Here are the available {planType === 'photographer' ? 'photographer' : 'user'} plans. Tap one to see full details.
                </p>
                <p className="text-gray-400 text-[10px] mt-2">{now}</p>
              </div>
            </div>

            {/* Plan cards from API */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              {plansLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading plans…</span>
                </div>
              ) : plans.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No plans available right now.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {plans.map((plan) => {
                    const price = typeof plan.price === 'number'
                      ? plan.price === 0 ? 'Free' : `${plan.currency ?? '₹'}${plan.price}`
                      : plan.price;
                    const cycle = plan.billing_cycle ?? plan.period;
                    const capabilities = buildCapabilities(plan);
                    return (
                      <button
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlanOption('compare');
                          setStep('plan-details');
                          // store selected plan for detail view
                          setSelectedApiPlan(plan);
                        }}
                        className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-150 hover:border-red-300 hover:bg-red-50 ${
                          plan.is_popular ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{plan.name}</span>
                          <div className="flex items-center gap-1.5">
                            {plan.is_popular && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded-full">Popular</span>
                            )}
                            {(plan.current || plan.is_current || plan.subscribed) && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Current
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-red-500 font-bold text-sm">
                          {price}{cycle ? <span className="text-xs font-normal text-gray-400"> / {cycle}</span> : null}
                        </p>
                        {plan.description && (
                          <p className="text-gray-500 text-xs mt-1 leading-snug line-clamp-2">{plan.description}</p>
                        )}
                        {capabilities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {capabilities.slice(0, 3).map((cap, i) => (
                              <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                                {typeof cap.value === 'boolean'
                                  ? cap.value ? `✓ ${cap.label}` : `✗ ${cap.label}`
                                  : `${cap.label}: ${cap.value}`}
                              </span>
                            ))}
                            {capabilities.length > 3 && (
                              <span className="text-[10px] text-red-400 px-1">+{capabilities.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>


          </>
        )}

        {/* Plan Details Step */}
        {step === 'plan-details' && planType && selectedPlanOption && (
          <>
            {/* User selection echo */}
            <div className="flex justify-end">
              <div className="fab-gradient-amber rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                <p className="text-white text-sm font-medium">
                  {selectedApiPlan
                    ? selectedApiPlan.name
                    : selectedPlanOption === 'free-trial' ? 'Free Trial Details'
                    : selectedPlanOption === 'upgrade' ? 'Upgrade / Downgrade'
                    : 'Billing & Payments'}
                </p>
                <p className="text-white/70 text-[10px] mt-1">{now}</p>
              </div>
            </div>

            {/* Bot information delivery */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm max-w-[85%]">
                <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2 py-1 mb-3 w-fit">
                  <span className="text-red-500"><Briefcase className="w-3.5 h-3.5" /></span>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Plans</span>
                </div>

                {/* ── Selected API Plan Detail ── */}
                {selectedApiPlan ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-gray-800 font-bold text-base">{selectedApiPlan.name}</h3>
                      <div className="flex items-center gap-1.5">
                        {selectedApiPlan.is_popular && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded-full">Popular</span>
                        )}
                        {(selectedApiPlan.current || selectedApiPlan.is_current || selectedApiPlan.subscribed) && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Current
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <p className="text-red-500 font-bold text-lg mb-2">
                      {typeof selectedApiPlan.price === 'number' && selectedApiPlan.price === 0
                        ? 'Free'
                        : `${selectedApiPlan.currency ?? '₹'}${selectedApiPlan.price}`}
                      {(selectedApiPlan.billing_cycle ?? selectedApiPlan.period) && (
                        <span className="text-xs font-normal text-gray-400"> / {selectedApiPlan.billing_cycle ?? selectedApiPlan.period}</span>
                      )}
                    </p>

                    {selectedApiPlan.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{selectedApiPlan.description}</p>
                    )}

                    {/* Capabilities table */}
                    {(() => {
                      const caps = buildCapabilities(selectedApiPlan);
                      return caps.length > 0 ? (
                        <div className="rounded-lg border border-gray-100 overflow-hidden mb-2">
                          {caps.map((cap, i) => (
                            <div
                              key={i}
                              className={`flex items-center justify-between px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <span className="text-gray-500">{cap.label}</span>
                              {typeof cap.value === 'boolean' ? (
                                cap.value
                                  ? <Check className="w-3.5 h-3.5 text-green-500" />
                                  : <X className="w-3.5 h-3.5 text-gray-300" />
                              ) : (
                                <span className="font-semibold text-gray-800">{cap.value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </>
                ) : (
                  <>
                    <h3 className="text-gray-800 font-bold text-base mb-2">
                      {selectedPlanOption === 'free-trial' && 'Free Trial Details'}
                      {selectedPlanOption === 'upgrade' && 'Upgrade / Downgrade'}
                      {selectedPlanOption === 'billing' && 'Billing & Payments'}
                    </h3>

                    {selectedPlanOption === 'free-trial' && (
                      <>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">Try Pro features for free:</p>
                        <div className="space-y-3">
                          {[
                            '14-day full access to all Pro features at no cost.',
                            'No credit card required to start your trial.',
                            'Full access to AI face recognition and custom branding.',
                            'Keep your data if you decide to upgrade after the trial ends.',
                          ].map((d, i) => (
                            <div key={i} className="flex gap-2">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <p className="text-gray-700 text-sm leading-snug">{d}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedPlanOption === 'upgrade' && (
                      <>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">Manage your plan as your business grows:</p>
                        <div className="space-y-3">
                          {[
                            'Instantly switch plans via your billing dashboard.',
                            'Prorated charges when upgrading mid-month.',
                            'Storage limits expand immediately upon upgrade.',
                            'Downgrades take effect at the end of your billing cycle.',
                          ].map((d, i) => (
                            <div key={i} className="flex gap-2">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <p className="text-gray-700 text-sm leading-snug">{d}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedPlanOption === 'billing' && (
                      <>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">Manage your billing and payments:</p>
                        <div className="space-y-3">
                          {[
                            'Secure payments via Stripe and PayPal.',
                            'Downloadable PDF invoices for every transaction.',
                            'Automated renewal for uninterrupted service.',
                            'Securely manage saved cards and billing information in your account.',
                          ].map((d, i) => (
                            <div key={i} className="flex gap-2">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <p className="text-gray-700 text-sm leading-snug">{d}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                <p className="text-gray-400 text-[10px] mt-4">{now}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setStep('contact-form')}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Contact Us
              </button>
              <button
                onClick={() => { setSelectedApiPlan(null); setStep('plan-comparison'); }}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Plans
              </button>
            </div>
          </>
        )}

        {/* Contact Form Step */}
        {step === 'contact-form' && (
          <>
            {/* Bot message */}
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full fab-gradient-amber flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm leading-relaxed">Please fill out the form below and our team will get back to you shortly.</p>
                <p className="text-gray-400 text-[10px] mt-2">{now}</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {contactSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-xs">Thank you! We'll be in touch soon.</p>
                </div>
              )}

              {contactError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-xs">{contactError}</p>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-3">
                {/* Name and Email fields - behavior depends on auth status and topic */}
                {/* For Pricing form: only show editable fields if NOT logged in (original behavior) */}
                {selectedTopic?.id === 'pricing-plans' ? (
                  !isAuthenticated && (
                    <>
                      <div>
                        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={contactForm.name}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                          placeholder="your@email.com"
                        />
                      </div>
                    </>
                  )
                ) : (
                  <>
                    {/* For non-Pricing forms: show prefilled read-only if logged in, editable if not */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={isAuthenticated ? undefined : handleContactFormChange}
                        readOnly={isAuthenticated}
                        required
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 ${
                          isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={isAuthenticated ? undefined : handleContactFormChange}
                        readOnly={isAuthenticated}
                        required
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 ${
                          isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                    placeholder="Subject"
                  />
                </div>

                {/* Conditional Role and Plan fields - only show when coming from Pricing & Plans */}
                {selectedTopic?.id === 'pricing-plans' && (
                  <>
                    <div>
                      <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={contactForm.role || planType || ''}
                        onChange={handleContactFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 cursor-pointer"
                      >
                        {!planType && <option value="">Select your role</option>}
                        <option value="photographer">Photographer</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="plan" className="block text-xs font-medium text-gray-700 mb-1">
                        Interested Plan *
                      </label>
                      <select
                        id="plan"
                        name="plan"
                        value={contactForm.plan || selectedApiPlan?.name || ''}
                        onChange={handleContactFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 cursor-pointer"
                      >
                        {!selectedApiPlan && <option value="">Select a plan</option>}
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.name}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full fab-gradient-amber text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  <Send className="h-4 w-4" />
                  {contactSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
