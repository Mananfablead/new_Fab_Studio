import React from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Mail,
  MapPin,
  AlertTriangle,
  Settings,
  Smartphone,
} from "lucide-react";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";
import settingsScreen from "@/assets/iamges/settings-screen.png";
import deleteAccountScreen from "@/assets/iamges/delete-account-screen.png";

const DeleteAccountPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/delete-account" />
      <LandingHeader activePage="delete-account" />

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
            <div className="bg-red-500 text-primary-foreground rounded-full p-3">
              <Trash2 className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Delete Account
            </h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  ⚠️ Account deletion is permanent and irreversible
                </h3>
                <p className="text-red-700">
                  All your data will be removed and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How to Delete Your Account
                </h2>

                <div className="space-y-6">
                  <div className="bg-muted/30 rounded-xl p-6 border border-border">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="fab-gradient-amber text-primary-foreground rounded-full p-2">
                        <span className="font-bold">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Option 1 — From the App (Recommended)
                      </h3>
                    </div>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex items-start">
                        <span className="text-primary mr-3 font-semibold">
                          1.
                        </span>
                        <div>Open Fab Studio app and sign in.</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3 font-semibold">
                          2.
                        </span>
                        <div>Go to Profile (bottom navigation).</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3 font-semibold">
                          3.
                        </span>
                        <div>Tap Settings.</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3 font-semibold">
                          4.
                        </span>
                        <div>Scroll to the bottom and tap Delete Account.</div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3 font-semibold">
                          5.
                        </span>
                        <div>Confirm the action when prompted.</div>
                      </li>
                    </ol>

                    {/* Images showing the delete account process */}
                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            Settings screen with Delete Account option:
                          </p>
                          <img
                            src={settingsScreen}
                            alt="Settings screen showing Delete Account button"
                            className="w-full rounded-lg border border-gray-200"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm";
                              placeholder.textContent = "Settings Screen Image";
                              img.parentNode?.appendChild(placeholder);
                            }}
                          />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            Delete Account confirmation dialog:
                          </p>
                          <img
                            src={deleteAccountScreen}
                            alt="Delete Account confirmation dialog"
                            className="w-full rounded-lg border border-gray-200"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm";
                              placeholder.textContent =
                                "Delete Account Dialog Image";
                              img.parentNode?.appendChild(placeholder);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        <Settings className="h-4 w-4 inline mr-2" />
                        Settings screen showing Delete Account button
                        <Trash2 className="h-4 w-4 inline mx-2" />
                        Delete Account confirmation dialog
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Screenshots: Navigate to Settings → Delete Account →
                        Confirm
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-6 border border-border">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="fab-gradient-amber text-primary-foreground rounded-full p-2">
                        <span className="font-bold">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Option 2 — Via Email Request
                      </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you cannot access the app, email your deletion request
                      to <strong>info@fableadtechnolabs.com</strong> from your
                      registered email address. Include your full name and
                      registered phone number. We will process your request
                      within 7 business days.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What Gets Deleted
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Account profile, login credentials, and personal details
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>All uploaded photos and media files</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Portfolio content (cover image, folders, photos, services,
                      payment details)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Events / groups you own, including all photos within them
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Face recognition data and biometric embeddings</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Wallet balance and transaction history</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>Notifications and activity logs</div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      All active access tokens (you will be logged out
                      everywhere)
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Retention Exceptions
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may retain limited data where required by law, including:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Financial transaction records (as required by Indian tax
                      law)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Data needed to resolve active disputes or legal
                      obligations
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <div>
                      Anonymised, aggregated analytics that cannot identify you
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Contact
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

export default DeleteAccountPage;
