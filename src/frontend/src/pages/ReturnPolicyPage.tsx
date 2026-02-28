import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold mb-4 text-foreground flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full inline-block" />
        {title}
      </h2>
      <div className="space-y-3 font-body text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span>Return Policy</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  Return Policy
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                  SADIYA Collection · MT Industries Ltd.
                </p>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg px-4 py-3 text-xs text-muted-foreground font-body border border-border">
              Last updated: January 2025 · Effective for all orders placed on
              this website.
            </div>
          </div>

          {/* 24-hour window HERO highlight — most important info front and center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-bold">
                24-Hour Return Window
              </h2>
            </div>
            <p className="font-body text-sm leading-relaxed opacity-90 mb-3">
              You have exactly{" "}
              <strong>24 hours from the time of delivery</strong> to request a
              return. After this window closes, return requests will not be
              accepted.
            </p>
            <div className="bg-primary-foreground/10 rounded-lg px-4 py-2 text-xs font-body opacity-80">
              ⏱ The countdown starts the moment your order is marked as
              "Delivered." Check "My Orders" to see your remaining return window
              time.
            </div>
          </motion.div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <Section title="How to Request a Return">
              <p>
                Requesting a return is simple and can be done entirely through
                your account:
              </p>
              <div className="space-y-3 mt-4">
                {[
                  {
                    step: "1",
                    title: "Go to My Orders",
                    desc: 'Log in to your account and navigate to the "My Orders" page.',
                  },
                  {
                    step: "2",
                    title: 'Click "Request Return"',
                    desc: 'Find the delivered order and click the "Request Return" button. This button is only visible within the 24-hour window.',
                  },
                  {
                    step: "3",
                    title: "Confirm Your Request",
                    desc: "Review the return details and confirm. You'll receive a confirmation notification.",
                  },
                  {
                    step: "4",
                    title: "Wait for Instructions",
                    desc: "Our team will contact you within 24 hours with instructions for packaging and shipping the item back.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-display font-bold shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Link to="/orders">
                  <span className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-body font-medium">
                    Go to My Orders
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </Section>

            <Section title="Return Eligibility Criteria">
              <p>
                To be eligible for a return, all of the following conditions
                must be met:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  "Request made within 24 hours of delivery",
                  "Item is unused and unworn",
                  "Item is in original packaging",
                  "All original tags are still attached",
                  "No signs of damage, stains, or alteration",
                  "Item is accompanied by original invoice/receipt",
                ].map((criterion) => (
                  <div key={criterion} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-body">{criterion}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Non-Returnable Items">
              <p>
                The following items cannot be returned under any circumstances:
              </p>
              <div className="space-y-2 mt-3">
                {[
                  "Items returned after the 24-hour delivery window",
                  "Items that have been used, worn, or washed",
                  "Items with removed, altered, or damaged tags",
                  "Customized or personalized products",
                  "Items purchased during final sale or clearance events",
                  "Gift cards and vouchers",
                  "Items damaged due to customer misuse or negligence",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-body">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Refund Processing">
              <p>
                Once we receive the returned item and verify it meets our
                eligibility criteria, your refund will be processed:
              </p>
              <div className="bg-muted/40 rounded-lg p-4 border border-border not-prose space-y-3">
                <div className="flex justify-between items-center text-sm font-body">
                  <span className="text-foreground/70">
                    Return verification
                  </span>
                  <span className="font-semibold">2–3 business days</span>
                </div>
                <div className="flex justify-between items-center text-sm font-body">
                  <span className="text-foreground/70">Refund initiation</span>
                  <span className="font-semibold">1–2 business days</span>
                </div>
                <div className="flex justify-between items-center text-sm font-body">
                  <span className="text-foreground/70">Credit to account</span>
                  <span className="font-semibold">5–7 business days</span>
                </div>
                <div className="pt-2 border-t border-border text-xs text-muted-foreground font-body">
                  Total estimated time: 7–14 business days from return receipt.
                  Original shipping charges are non-refundable unless the item
                  was defective or incorrect.
                </div>
              </div>
            </Section>

            <Section title="Defective or Incorrect Items">
              <p>
                If you received a defective item, a damaged product, or the
                wrong item, please contact us immediately at{" "}
                <a
                  href="mailto:tanzebmohammad@gmail.com"
                  className="text-primary hover:underline"
                >
                  tanzebmohammad@gmail.com
                </a>{" "}
                with photos of the issue.
              </p>
              <p>
                For defective or incorrect items, we will cover the return
                shipping cost and offer a full refund or replacement at no
                charge. The standard 24-hour window is extended to 48 hours for
                defective/incorrect items reported with photographic evidence.
              </p>
            </Section>

            <Section title="Return Shipping">
              <p>
                Customers are responsible for return shipping costs unless the
                item was defective or incorrect. We recommend using a tracked
                shipping service, as we are not responsible for items lost in
                transit.
              </p>
              <p>
                Our team will provide the return shipping address after your
                return request has been approved.
              </p>
            </Section>

            <Section title="Contact for Returns">
              <p>
                If you have any questions about your return, please reach out:
              </p>
              <div className="bg-muted/40 rounded-lg p-4 border border-border not-prose">
                <p className="font-semibold text-foreground mb-1">
                  SADIYA Collection Support
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:tanzebmohammad@gmail.com"
                    className="text-primary hover:underline"
                  >
                    tanzebmohammad@gmail.com
                  </a>
                </p>
                <p>Phone: 8750787355</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Support hours: Monday–Saturday, 10 AM – 6 PM IST
                </p>
              </div>
            </Section>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions →
            </Link>
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy →
            </Link>
            <Link
              to="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
