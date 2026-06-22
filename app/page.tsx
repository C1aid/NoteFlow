import { CtaSection } from "@/components/landing/cta-section";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingPrinciples } from "@/components/landing/landing-principles";
import { LandingProductStory } from "@/components/landing/landing-product-story";
import { Reveal, RevealText } from "@/components/landing/motion";
import { PricingTable } from "@/components/landing/pricing-table";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const faqs = [
  {
    question: "Do I need a credit card to get started?",
    answer:
      "No. Sign up, create your workspace, and start messaging immediately. A card is only required if you choose to upgrade to Pro.",
  },
  {
    question: "Can I use private channels on the Free plan?",
    answer:
      "Yes. Public and private channels, DMs, threads, and reactions are available on every plan. Free limits apply to channel count (10) and message history (90 days), not to feature access.",
  },
  {
    question: "What happens to messages older than 90 days on Free?",
    answer:
      "They are hidden from channels, search, and threads — but not deleted. Upgrading to Pro restores instant access to your full archive.",
  },
  {
    question: "Is DevTalk suitable for open-source teams?",
    answer:
      "Yes. Public channels work well for maintainer coordination. GitHub link previews, code blocks, and threads map directly to how OSS teams already communicate.",
  },
  {
    question: "Does DevTalk include AI features?",
    answer:
      "No — by design. There are no AI summaries, assistant bots, or paid AI add-ons. DevTalk is focused on clear, reliable team chat.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <SiteHeader overlapHero />

      <main>
        <HeroSection />
        <LandingProductStory />
        <FeaturesSection />
        <LandingPrinciples />
        <PricingTable />

        <section id="faq" className="scroll-mt-24 border-t border-border py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                FAQ
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                <RevealText
                  as="span"
                  text="Questions before you sign up"
                  wordDelay={75}
                />
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Plan details live in{" "}
                <a href="#pricing" className="text-white hover:underline">
                  pricing
                </a>
                . Feature depth is in{" "}
                <a href="#features" className="text-white hover:underline">
                  capabilities
                </a>
                .
              </p>
            </Reveal>
            <FaqAccordion items={faqs} />
          </div>
        </section>

        <CtaSection />
      </main>

      <Reveal safe y={20}>
        <SiteFooter />
      </Reveal>
    </div>
  );
}
