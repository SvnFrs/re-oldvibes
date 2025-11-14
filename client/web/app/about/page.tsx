"use client";

import {
  IconPhoto,
  IconClock,
  IconUsers,
  IconSearch,
  IconMessageCircle,
  IconCheck,
  IconSparkles,
  IconHeart,
  IconShieldCheck,
  IconArrowRight,
  IconBrandApple,
  IconBrandAndroid,
  IconTrendingUp,
  IconStar,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../_components/layout/PageShell";
import { useAuth } from "../_contexts/AuthContext";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";

export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: IconPhoto,
      title: "Share Stories",
      description: "Post photos or videos of your used goods as reels or stories. Add descriptions, prices, and tags to help buyers discover your items.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: IconClock,
      title: "24-Hour Vibes",
      description: "Your posts are live for 24 hours, then archived. Keep the feed fresh and discover new treasures every day!",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: IconUsers,
      title: "Connect & Trade",
      description: "Chat, comment, and follow users. No checkout—just message sellers directly to buy and arrange delivery.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
  ];

  const benefits = [
    {
      icon: IconShieldCheck,
      title: "Safe & Secure",
      description: "All posts are reviewed by staff for legitimacy",
    },
    {
      icon: IconHeart,
      title: "No Hidden Fees",
      description: "No fees, no checkout—just connect and trade",
    },
    {
      icon: IconTrendingUp,
      title: "Build Trust",
      description: "Like, comment, and share to build a trusted community",
    },
  ];

  const exploreFeatures = [
    {
      icon: IconSearch,
      title: "Powerful Search",
      description: "Powerful search & filters",
      color: "text-gruvbox-blue",
    },
    {
      icon: IconUsers,
      title: "Follow Users",
      description: "Follow users & build your feed",
      color: "text-gruvbox-green",
    },
    {
      icon: IconMessageCircle,
      title: "Direct Messages",
      description: "DM sellers or comment on posts",
      color: "text-gruvbox-purple",
    },
  ];

  const faqs = [
    {
      question: "How do I sell something?",
      answer: "Download the app, snap photos or videos of your item, add details, and post as a vibe. Our staff will review your post before it goes live.",
    },
    {
      question: "How do I buy something?",
      answer: "Browse or search for items. If you find something you like, message the seller directly to arrange payment and delivery.",
    },
    {
      question: "Is there a fee?",
      answer: "No! Old Vibes is free to use. We just help you connect with buyers and sellers.",
    },
    {
      question: "What happens after 24 hours?",
      answer: "Your post is archived, but you can always repost or manage your vibes in the app.",
    },
  ];

  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gruvbox-orange via-gruvbox-yellow to-gruvbox-aqua/40 py-20 md:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gruvbox-orange/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gruvbox-yellow/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <PageShell width="lg" className="relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <IconSparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Welcome to OldVibes</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Share & Sell Your
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Old Vibes
              </span>
            </h1>
          </FadeIn>

          <SlideUp delay={0.2}>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Snap, share, and sell your preloved goods in a fun, story-like way.
              Connect with friends and discover unique finds.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-gruvbox-orange font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-lg">Get Started Free</span>
                  <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white text-white font-bold hover:bg-white hover:text-gruvbox-orange transition-all text-lg"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-gruvbox-orange font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-lg">Browse Marketplace</span>
                  <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white text-white font-bold hover:bg-white hover:text-gruvbox-orange transition-all text-lg"
                >
                  See How It Works
                </a>
              </div>
            )}
          </SlideUp>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <IconCheck className="w-5 h-5" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="w-5 h-5" />
              <span className="text-sm">Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="w-5 h-5" />
              <span className="text-sm">100% Free</span>
            </div>
          </div>
        </PageShell>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gruvbox-dark-bg0">
        <PageShell width="xl">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gruvbox-orange/10 backdrop-blur-sm rounded-full border border-gruvbox-orange/20 mb-4">
                <IconSparkles className="w-4 h-4 text-gruvbox-orange" />
                <span className="text-sm font-medium text-gruvbox-orange">Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gruvbox-dark-fg0 mb-4">
                How Old Vibes Works
              </h2>
              <p className="text-xl text-gruvbox-gray max-w-2xl mx-auto">
                Everything you need to share and discover vintage treasures
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SlideUp key={feature.title} delay={index * 0.1}>
                <div className="group bg-gruvbox-dark-bg1 rounded-2xl p-8 border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-gruvbox-orange" />
                  </div>
                  <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gruvbox-gray leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gruvbox-dark-bg1">
        <PageShell width="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideUp>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gruvbox-green/10 backdrop-blur-sm rounded-full border border-gruvbox-green/20 mb-4">
                  <IconShieldCheck className="w-4 h-4 text-gruvbox-green" />
                  <span className="text-sm font-medium text-gruvbox-green">Safe & Trusted</span>
                </div>
                <h2 className="text-4xl font-bold text-gruvbox-dark-fg0 mb-6">
                  Safe, Simple, and Social
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gruvbox-dark-bg0 rounded-xl border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-gruvbox-orange/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-gruvbox-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gruvbox-dark-fg0 mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gruvbox-gray">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gruvbox-orange/20 to-gruvbox-yellow/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gruvbox-dark-bg2 rounded-3xl p-8 border border-gruvbox-dark-bg3">
                  <Image
                    src="https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png"
                    alt="App preview"
                    width={400}
                    height={800}
                    className="rounded-2xl shadow-2xl mx-auto"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </PageShell>
      </section>

      {/* Explore Section */}
      <section className="py-20 bg-gruvbox-dark-bg0">
        <PageShell width="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-gruvbox-blue/20 to-gruvbox-purple/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gruvbox-dark-bg1 rounded-3xl p-8 border border-gruvbox-dark-bg2">
                  <Image
                    src="https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png"
                    alt="Explore preview"
                    width={500}
                    height={350}
                    className="rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </FadeIn>

            <SlideUp delay={0.2} className="order-1 lg:order-2">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gruvbox-blue/10 backdrop-blur-sm rounded-full border border-gruvbox-blue/20 mb-4">
                  <IconTrendingUp className="w-4 h-4 text-gruvbox-blue" />
                  <span className="text-sm font-medium text-gruvbox-blue">Discovery</span>
                </div>
                <h2 className="text-4xl font-bold text-gruvbox-dark-fg0 mb-6">
                  Find Your Next Treasure
                </h2>
                <p className="text-lg text-gruvbox-gray mb-8">
                  Search for specific items, browse by category, or explore trending vibes and popular users. Follow your friends to see their latest finds!
                </p>
                <div className="space-y-3">
                  {exploreFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gruvbox-dark-bg1 rounded-xl border border-gruvbox-dark-bg2">
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      <span className="text-gruvbox-dark-fg0 font-medium">
                        {feature.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>
          </div>
        </PageShell>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gruvbox-dark-bg1">
        <PageShell width="lg">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gruvbox-purple/10 backdrop-blur-sm rounded-full border border-gruvbox-purple/20 mb-4">
                <IconMessageCircle className="w-4 h-4 text-gruvbox-purple" />
                <span className="text-sm font-medium text-gruvbox-purple">FAQ</span>
              </div>
              <h2 className="text-4xl font-bold text-gruvbox-dark-fg0 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gruvbox-gray">
                Everything you need to know about Old Vibes
              </p>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <SlideUp key={index} delay={index * 0.05}>
                <div className="bg-gruvbox-dark-bg0 rounded-2xl p-6 border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 transition-all">
                  <h3 className="text-lg font-bold text-gruvbox-orange mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gruvbox-gray leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </PageShell>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-gruvbox-orange via-gruvbox-yellow to-gruvbox-aqua/40 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gruvbox-orange/20 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <PageShell width="lg" className="relative text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <IconStar className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Join Thousands of Users</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join the Old Vibes Community
              </h2>
            </FadeIn>

            <SlideUp delay={0.2}>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Start sharing your vintage finds and discover amazing treasures from other collectors.
                It's free to join and takes less than 2 minutes!
              </p>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-gruvbox-orange font-bold shadow-2xl hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-lg">Create Free Account</span>
                  <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white text-white font-bold hover:bg-white hover:text-gruvbox-orange transition-all text-lg"
                >
                  Already have an account?
                </Link>
              </div>
            </SlideUp>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <IconCheck className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="w-5 h-5" />
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="w-5 h-5" />
                <span>Secure & private</span>
              </div>
            </div>
          </PageShell>
        </section>
      )}

      {/* Download Section */}
      <section id="download" className="py-20 bg-gruvbox-dark-bg0">
        <PageShell width="lg" className="text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gruvbox-blue/10 backdrop-blur-sm rounded-full border border-gruvbox-blue/20 mb-6">
              <IconPhoto className="w-4 h-4 text-gruvbox-blue" />
              <span className="text-sm font-medium text-gruvbox-blue">Mobile App</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-gruvbox-dark-fg0 mb-6">
              Download the Mobile App
            </h2>
          </FadeIn>

          <SlideUp delay={0.2}>
            <p className="text-xl text-gruvbox-gray mb-10 max-w-2xl mx-auto">
              Get the full Old Vibes experience on your mobile device.
              Available for iOS and Android.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-gruvbox-blue to-gruvbox-blue-dark text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <IconBrandApple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-lg font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-gruvbox-blue text-gruvbox-blue font-bold hover:bg-gruvbox-blue hover:text-white transition-all"
              >
                <IconBrandAndroid className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-lg font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </SlideUp>
        </PageShell>
      </section>
    </div>
  );
}