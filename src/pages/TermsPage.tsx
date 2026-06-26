import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/terms" />
      <LandingHeader activePage="terms" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
          <Link
            to="/home"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-3 mb-8">
            <div className="fab-gradient-amber text-primary-foreground rounded-full p-3">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Terms & Conditions
            </h1>
          </div>

          <div className="text-muted-foreground mb-8">
            <p className="text-lg">Last updated: May 05, 2026</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-8">
              Welcome to Fab Studio. By downloading, installing, or using our
              application and services, you agree to be bound by these Terms &
              Conditions. Please read them carefully.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Fab Studio you confirm that you are at
                  least 13 years old, have read and understood these terms, and
                  agree to comply with them. If you do not agree, do not use the
                  platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Services Provided
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Fab Studio provides a professional photography platform
                  including:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Event album creation, photo upload, and sharing</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      AI-powered face recognition for automatic photo tagging
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Portfolio builder with custom URL</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Digital flipbook generation</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Client album selection and delivery tools</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Photo monetisation (per-photo and per-album pricing)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Team member management with role-based access</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Watermarking and download controls</div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Account Responsibilities
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3.1 Account Security
                </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      You are responsible for keeping your login credentials
                      confidential.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Notify us immediately at info@fableadtechnolabs.com if you
                      suspect unauthorised access.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      You are liable for all activity that occurs under your
                      account.
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3.2 Accurate Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to provide accurate, current, and complete
                  information during registration and to keep it updated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Content & Intellectual Property
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  4.1 Your Content
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You retain full ownership of all photos and content you
                  upload. By uploading, you grant Fab Studio a limited,
                  non-exclusive licence to store, display, and process your
                  content solely to provide the service.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  4.2 Prohibited Content
                </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Illegal, harmful, obscene, or defamatory material</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Content that infringes third-party intellectual property
                      or privacy rights
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Spam, malware, or any content intended to disrupt the
                      platform
                    </div>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right to remove violating content without
                  notice.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  4.3 Platform IP
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All platform software, design, trademarks, and branding belong
                  to Fablead Technolabs. You may not copy, modify, or distribute
                  them without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Face Recognition
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Face recognition is an opt-in feature. By registering your
                  face you consent to the creation and storage of a facial
                  embedding. This data is encrypted, used only for photo
                  matching within the platform, and can be deleted at any time
                  from your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Payments & Refunds
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.1 Subscriptions & Purchases
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Certain features require a paid subscription or one-time
                  purchase. All prices are displayed in the app before purchase.
                  Payments are processed securely via our payment partners.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.2 Refund Policy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Subscription fees are non-refundable except where required by
                  applicable law. For billing disputes contact
                  info@fableadtechnolabs.com within 7 days of the charge.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Acceptable Use
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Attempt to gain unauthorised access to any part of the
                      platform or other users' accounts
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Reverse-engineer, decompile, or scrape the platform
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Use the platform to harass, threaten, or harm others
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Circumvent any security, watermark, or access-control
                      feature
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Service Availability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We aim for high availability but do not guarantee
                  uninterrupted service. Scheduled maintenance, updates, or
                  unforeseen technical issues may cause temporary downtime. We
                  are not liable for losses arising from service interruptions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, Fablead Technolabs
                  shall not be liable for indirect, incidental, or consequential
                  damages arising from your use of the platform. Our total
                  liability shall not exceed the amount you paid us in the 3
                  months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Termination
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your account if you violate these
                  terms. You may delete your account at any time via the app or
                  our Delete Account page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by the laws of India. Any disputes
                  shall be subject to the exclusive jurisdiction of the courts
                  in Surat, Gujarat, India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these terms periodically. Continued use after
                  changes are posted constitutes acceptance. We will notify you
                  of material changes via email or in-app notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  13. Contact
                </h2>
                <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                  <div className="font-semibold text-foreground">
                    Fablead Technolabs
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        A-5001, Ascon Plaza, Adajan, Surat, Gujarat 395009 –
                        India
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>info@fableadtechnolabs.com</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default TermsPage;
