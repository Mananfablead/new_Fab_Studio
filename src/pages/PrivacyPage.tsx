import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/privacy" />
      <LandingHeader activePage="privacy" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="fab-gradient-amber text-primary-foreground rounded-full p-3">
              <Shield className="h-8 w-8" />
            </div>

            <h1 className="text-4xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>

          <div className="text-muted-foreground mb-8">
            <p className="text-lg">Effective date: May 05, 2026</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-8">
              Fablead Studio ("we", "our", "us") operates the Fablead Studio
              photography platform and mobile application. This policy explains
              how we collect, use, store, and protect your personal information.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Information We Collect
                </h2>

                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      <strong>Account data</strong> — name, email address, phone
                      number, and profile photo.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      <strong>Content</strong> — photos, videos, portfolio
                      items, and other media you upload.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      <strong>Biometric data</strong> — facial embeddings used
                      solely for AI photo-matching (stored encrypted; deletable
                      at any time).
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      <strong>Payment data</strong> — transaction records
                      processed via our payment partners. We do not store raw
                      card details.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      <strong>Usage data</strong> — device type, IP address, app
                      version, and interaction logs used to improve the service.
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. How We Use Your Information
                </h2>

                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      To create and manage your account and deliver app
                      features.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      To store, display, and process photos and portfolio
                      content.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      To run AI face-matching so guests can find their photos
                      automatically.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>To process payments and prevent fraud.</div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      To send important service updates, security alerts, and
                      support responses.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      To analyse usage patterns and improve platform
                      performance.
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Data Sharing
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  We share data only with trusted service providers (cloud
                  hosting, analytics, payment processors, SMS/email delivery)
                  strictly as needed to operate the platform. We never sell
                  personal data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Face Data & Photo Matching
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our app allows users to upload or refresh a face reference
                  photo to help identify photos they may appear in within shared
                  or private albums they are permitted to access.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  Information We Collect
                </h3>

                <ul className="space-y-3 text-muted-foreground mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Selfie or face reference images uploaded by the user.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Basic image validation results, such as face detection or
                      eyes-open checks, which may be processed on-device before
                      upload.
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  How We Use Face Data
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Face data is used solely for:
                </p>

                <ul className="space-y-3 text-muted-foreground mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Matching users with photos they may appear in.</div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Improving photo organization and discovery features within
                      authorized albums.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Supporting features such as "My Photos" and similar
                      personalized album experiences.
                    </div>
                  </li>
                </ul>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not use face data for advertising, marketing, or sale to
                  third parties.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  Processing & Storage
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Uploaded face images may be securely transmitted to and
                  processed by Fablead Studio and authorized service providers
                  acting on our behalf. Processing may include automated facial
                  comparison technologies.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  Data Retention
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Face data is retained only for as long as necessary to provide
                  the feature, comply with legal obligations, or until the user
                  deletes their face reference or account.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  User Controls
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Users may:
                </p>

                <ul className="space-y-3 text-muted-foreground mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Update or remove their face reference at any time.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Request deletion of associated face data.</div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Contact us regarding privacy or biometric data concerns.
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                  Security
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use reasonable technical and organizational safeguards to
                  protect uploaded images and related data during transmission
                  and storage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Data Retention
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  We retain your data for as long as your account is active or
                  as needed to provide services. After account deletion,
                  personal data is removed within 30 days, except where
                  retention is required by law (e.g. financial records).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Your Rights
                </h2>

                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>Access or correct your account data via the app.</div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      Request full account and data deletion — see our Delete
                      Account page.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      Withdraw consent for face recognition at any time.
                    </div>
                  </li>

                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>

                    <div>
                      Contact us for any privacy concern or data request.
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Security
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use industry-standard encryption (TLS in transit, AES-256
                  at rest) and access controls to protect your data. No system
                  is 100% secure; please use a strong password and keep your
                  credentials private.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Children's Privacy
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  Fab Studio is not directed at children under 13. We do not
                  knowingly collect personal data from children. If you believe
                  a child has provided us data, contact us and we will delete it
                  promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Changes to This Policy
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  We may update this policy periodically. We will notify you of
                  significant changes via email or an in-app notice. Continued
                  use after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Contact
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

export default PrivacyPage;
