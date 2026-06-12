import Link from "next/link";
import { ArrowRight, Check, Sparkles, Users, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Auto-save editor",
    description: "Rich text editing with bold, italic, and lists. Changes save automatically.",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    description: "Edit notes together with live sync and presence indicators.",
  },
  {
    icon: Sparkles,
    title: "Simple pricing",
    description: "Start free with 5 notes, upgrade to Premium for unlimited notes and sharing.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["Up to 5 notes", "Rich text editor", "Auto-save"],
  },
  {
    name: "Premium",
    price: "$9/mo",
    description: "For teams and power users",
    features: [
      "Unlimited notes",
      "Real-time collaboration",
      "Share & invite collaborators",
    ],
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-6 w-6 text-primary" />
            NoteFlow
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Notes that flow with your team
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            NoteFlow is a collaborative note-taking platform with real-time editing,
            secure authentication, and flexible subscription plans.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardHeader>
                    <Icon className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Pricing</h2>
            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.highlighted ? "border-primary shadow-lg" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="text-3xl font-bold">{plan.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} NoteFlow. Built with Next.js, Supabase & Stripe.</p>
      </footer>
    </div>
  );
}
