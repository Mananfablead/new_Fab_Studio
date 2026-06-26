import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  MapPin,
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  ArrowLeft,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/selectors";
import api from "@/services/api";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const faqs = [
  {
    q: "How to upload photos?",
    a: "Go to your group, click the Upload button, and drag & drop photos or select from your device. You can upload up to 1000 images at once.",
  },
  {
    q: "How to create a group?",
    a: 'Click "Create a Group" on your dashboard. Enter a group name, choose public or private, and share the invite link or QR code.',
  },
  {
    q: "How to download photos?",
    a: "Open any photo in the gallery, click the download icon. You can also bulk download by selecting multiple photos.",
  },
  {
    q: "How does AI face matching work?",
    a: "Upload a selfie when joining a group. Our AI automatically finds and delivers photos containing your face with ~99.9% accuracy.",
  },
  {
    q: "How to manage group permissions?",
    a: "Go to Group Settings > Permissions. You can control download access, photo visibility, and role-based access for each member.",
  },
  {
    q: "How do I set up my custom portfolio website?",
    a: "Go to Settings > Portfolio Page from your dashboard. You can customize your bio, header styles, social media links, templates, and select which event galleries are displayed publicly to visitors.",
  },
  {
    q: "Can I map a custom domain to my portfolio website?",
    a: "Yes! With our premium plans, you can link your own professional domain (e.g., photo.yourbrand.com) under Business Settings > Branding, allowing a fully white-labeled custom experience.",
  },
  {
    q: "What is the Digital Flipbook (Digital Album)?",
    a: "The Digital Flipbook is a premium interactive book showcasing your selected photos with ultra-realistic page-turning animations and sounds. You can convert any gallery into a flipbook to share client wedding albums, senior lookbooks, or virtual print packages.",
  },
  {
    q: "How does custom business branding work?",
    a: "Once business branding is active on your plan, you can upload your studio logo, configure brand colors, customize client emails, and completely replace Fablead Studio branding on all client-facing pages.",
  },
  {
    q: "Can I password protect specific galleries on my website?",
    a: "Yes! You can secure any client gallery with a unique passcode or PIN under Group Settings > Privacy, ensuring only authorized clients or guests can view and download the photos.",
  },
  {
    q: "Is my portfolio website mobile-friendly and SEO optimized?",
    a: "Absolutely. Every portfolio site and gallery is built mobile-first to look stunning on all devices. You can also configure SEO metadata directly in your Portfolio settings to boost your visibility on Google.",
  },
  {
    q: "How do I connect my social media profiles to my website?",
    a: "Inside Settings > Portfolio Page, scroll down to the Social Links section to add your Instagram, Facebook, YouTube, or LinkedIn profiles. They will automatically display as sleek icons in your footer.",
  },
  {
    q: "How do prospective clients contact me through my portfolio?",
    a: "Your public portfolio website comes with an elegant, built-in inquiry form. When a visitor submits a contact request, you receive an instant email notification containing their message and details.",
  },
];
export default function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const user = useSelector(selectUser);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Please log in to submit a ticket.");
      return;
    }

    setIsSubmitting(true);

    const ticketData = {
      user_id: String(user.id),
      subject: formData.subject,
      priority: formData.priority.toLowerCase(),
      description: formData.description,
    };

    console.log("Submitting Support Ticket:", ticketData);

    try {
      const response = await api.post("/support/tickets", ticketData);

      if (response.data) {
        console.log("Ticket submitted successfully:", response.data);
        setFormData({
          subject: "",
          description: "",
          priority: "Medium",
        });
        toast.success("Support ticket submitted successfully!");
      }
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error submitting ticket. Please try again.";
      toast.error(`Failed to submit ticket: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/help" />
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold">Help & Support</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - FAQ */}
          <div className="bg-card rounded-xl border border-border fab-shadow">
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> FAQ
              </h2>
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right - Contact Support */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-card rounded-xl border border-border fab-shadow p-6">
              <h2 className="font-heading font-semibold mb-6">
                Contact Support
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Info Fields - Read Only */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-sm font-medium text-foreground focus:outline-none cursor-not-allowed opacity-75"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-sm font-medium text-foreground focus:outline-none cursor-not-allowed opacity-75"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={user?.phone || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-sm font-medium text-foreground focus:outline-none cursor-not-allowed opacity-75"
                  />
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Enter your subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-fab-primary/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-fab-primary/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-fab-primary/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-lg fab-gradient text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 fab-shadow">
                <MapPin className="w-5 h-5 text-fab-info flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Address</p>
                  <address className="not-italic text-xs text-muted-foreground leading-relaxed">
                    A-5001, Ascon Plaza, Adajan, Surat,Gujarat 395009 – India
                  </address>
                </div>
              </div>
              <button className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors fab-shadow">
                <Mail className="w-5 h-5 text-fab-amber" />
                <div className="text-left">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    info@fableadtechnolabs.com
                  </p>
                </div>
              </button>
              {/* <button className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors fab-shadow">
                <Phone className="w-5 h-5 text-fab-success" />
                <div className="text-left"><p className="text-sm font-medium">WhatsApp</p><p className="text-xs text-muted-foreground">+91 98765 43210</p></div>
              </button> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
