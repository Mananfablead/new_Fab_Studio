import React from "react";
import { Link } from "react-router-dom";
import { Target, Users, Award, ArrowRight } from "lucide-react";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";
import SEOHead from "@/components/SEOHead";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="/aboutus" />
      {/* Header */}
      <LandingHeader activePage="aboutus" />

      {/* Hero Section */}
      <section
        className="pt-60 pb-32 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&fit=crop')",
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
              Intelligent Photography{" "}
              <span className="text-[hsl(var(--fab-amber))]">Solutions</span>
            </h1>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Founded in 2020, Fab Studio is on a mission to transform how
              photographers manage, deliver, and monetize their creative work
              through cutting-edge AI and cloud technology.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
                Our Journey
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Fab Studio began with a personal frustration. As professional
                photographers ourselves, we were spending countless hours on
                manual photo selection, client communication, and gallery
                creation - time that could have been spent behind the camera.
              </p>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                In 2020, we set out to build the solution we wished existed: an
                intelligent platform that could understand photography
                workflows, automate repetitive tasks, and deliver exceptional
                client experiences.
              </p>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Today, our AI-powered platform serves over 50,000 professional
                photographers across 120+ countries, processing millions of
                photos monthly and helping creative businesses thrive in the
                digital age.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="text-center bg-card rounded-xl p-3 sm:p-6 border border-border">
                  <div className="text-2xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
                    50K+
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm font-medium leading-tight">
                    Professional Photographers
                  </div>
                </div>
                <div className="text-center bg-card rounded-xl p-3 sm:p-6 border border-border">
                  <div className="text-2xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
                    500M+
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm font-medium leading-tight">
                    Photos Processed
                  </div>
                </div>
                <div className="text-center bg-card rounded-xl p-3 sm:p-6 border border-border">
                  <div className="text-2xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
                    120+
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm font-medium leading-tight">
                    Countries
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden h-96 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=600&fit=crop"
                    alt="Mission-Driven Innovation — team collaborating"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-semibold text-lg drop-shadow">Mission-Driven Innovation</p>
                  </div> */}
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-lg border border-border">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-[hsl(var(--fab-amber))]" />
                    <span className="text-sm font-medium">Industry Leader</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Innovation First
              </h3>
              <p className="text-muted-foreground">
                We constantly push the boundaries of what's possible with AI and
                photography technology.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[hsl(var(--fab-amber))]/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[hsl(var(--fab-amber))]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Customer Obsessed
              </h3>
              <p className="text-muted-foreground">
                Our photographers' success is our success. We listen, learn, and
                build what they need.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[hsl(var(--fab-info))]/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-[hsl(var(--fab-info))]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Quality Driven
              </h3>
              <p className="text-muted-foreground">
                We maintain the highest standards in everything we build,
                ensuring reliability and excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry veterans and technology experts committed to transforming
              photography workflows
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-primary to-[hsl(var(--fab-amber))] rounded-full w-24 h-24 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                SC
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Sarah Chen
              </h3>
              <p className="text-muted-foreground mb-4">CEO & Co-founder</p>
              <p className="text-sm text-muted-foreground">
                Former VP of Product at Adobe. 15+ years in creative software
                and AI technologies.
              </p>
            </div>
            <div className="text-center bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-primary to-[hsl(var(--fab-amber))] rounded-full w-24 h-24 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                MJ
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Mike Johnson
              </h3>
              <p className="text-muted-foreground mb-4">CTO & Co-founder</p>
              <p className="text-sm text-muted-foreground">
                Ex-Google senior engineer. Expert in cloud infrastructure and
                machine learning systems.
              </p>
            </div>
            <div className="text-center bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-primary to-[hsl(var(--fab-amber))] rounded-full w-24 h-24 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                ED
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Emily Davis
              </h3>
              <p className="text-muted-foreground mb-4">Head of Design</p>
              <p className="text-sm text-muted-foreground">
                Lead designer at Spotify. Passionate about creating intuitive
                user experiences.
              </p>
            </div>
            <div className="text-center bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-primary to-[hsl(var(--fab-amber))] rounded-full w-24 h-24 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                AK
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Alex Kumar
              </h3>
              <p className="text-muted-foreground mb-4">VP of Engineering</p>
              <p className="text-sm text-muted-foreground">
                Former Amazon principal engineer. Scale and performance
                optimization expert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">The passionate people behind Fab Studio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: "Sarah Chen", role: "CEO & Co-founder", image: "SC" },
              { name: "Mike Johnson", role: "CTO & Co-founder", image: "MJ" },
              { name: "Emily Davis", role: "Head of Design", image: "ED" },
              { name: "Alex Kumar", role: "Lead Engineer", image: "AK" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-primary to-[hsl(var(--fab-amber))] rounded-full w-32 h-32 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fab-gradient-amber">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Photography Business?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of photographers who trust Fab Studio for their
            business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:min-w-[180px] bg-background text-foreground px-8 py-3 rounded-xl hover:bg-muted transition-colors flex items-center justify-center font-semibold">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </Link>
            <Link to="/contact-us" className="w-full sm:w-auto">
              <button className="w-full sm:min-w-[180px] bg-transparent text-primary-foreground border-2 border-primary-foreground px-8 py-3 rounded-xl hover:bg-background hover:text-foreground transition-colors font-semibold">
                Contact Us
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

export default AboutUsPage;
