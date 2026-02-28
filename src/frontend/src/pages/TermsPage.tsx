import { Link } from "@tanstack/react-router";
import { ChevronRight, Scale } from "lucide-react";
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

export default function TermsPage() {
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
              <span>Terms & Conditions</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  Terms & Conditions
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                  SADIYA Collection · MT Industries Ltd.
                </p>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg px-4 py-3 text-xs text-muted-foreground font-body border border-border">
              Last updated: January 2025 · Effective immediately upon use of our
              website.
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using the SADIYA Collection website (the
                "Site"), operated by MT Industries Ltd., you agree to be bound
                by these Terms & Conditions ("Terms"). If you do not agree with
                any part of these Terms, you may not use our Site or services.
              </p>
              <p>
                These Terms apply to all visitors, users, and customers of the
                Site. We reserve the right to update or change these Terms at
                any time. Continued use of the Site after any changes
                constitutes your acceptance of the new Terms.
              </p>
            </Section>

            <Section title="2. Products & Pricing">
              <p>
                All products listed on the Site are subject to availability.
                Prices are displayed in Indian Rupees (INR) and are inclusive of
                applicable taxes unless stated otherwise.
              </p>
              <p>
                We reserve the right to modify prices at any time without prior
                notice. Product images are for illustrative purposes only;
                actual products may vary slightly in color, size, or texture due
                to photography and display settings.
              </p>
              <p>
                SADIYA Collection reserves the right to limit quantities of any
                product, refuse service to any customer, and discontinue any
                product at our discretion.
              </p>
            </Section>

            <Section title="3. Orders & Payment">
              <p>
                Placing an order constitutes an offer to purchase a product. All
                orders are subject to acceptance and availability. We reserve
                the right to refuse or cancel any order at our discretion.
              </p>
              <p>
                Payment must be completed at the time of order placement. We
                accept payments through the payment gateways configured on our
                Site (including Stripe, Razorpay, and other supported
                providers). All payment information is processed securely
                through our payment partners.
              </p>
              <p>
                <strong>Order Cancellation:</strong> You may cancel your order
                before it has been shipped. Once an order has been shipped,
                cancellation is no longer possible. To cancel, visit the "My
                Orders" section on your account.
              </p>
            </Section>

            <Section title="4. Shipping & Delivery">
              <p>
                We aim to ship all orders within 2–3 business days of payment
                confirmation. Estimated delivery times vary by location and
                shipping carrier, typically 5–10 business days for domestic
                orders within India.
              </p>
              <p>
                SADIYA Collection partners with multiple shipping carriers (DHL,
                FedEx, BlueDart, DTDC, Delhivery, Ekart, Xpressbees, and India
                Post). Tracking information will be provided once your order has
                been dispatched.
              </p>
              <p>
                We are not responsible for delays caused by shipping carriers,
                weather conditions, customs processing, or other factors outside
                our control.
              </p>
            </Section>

            <Section title="5. Returns & Refunds">
              <p>
                <strong>
                  Customers have a strict 24-hour return window from the time of
                  delivery.
                </strong>{" "}
                Return requests submitted after 24 hours of delivery will not be
                accepted.
              </p>
              <p>
                To request a return, visit the "My Orders" section within 24
                hours of receiving your order and click "Request Return." Items
                must be unused, unworn, and in original packaging with all tags
                attached.
              </p>
              <p>
                Once a return is approved, refunds will be processed within 7–14
                business days to the original payment method. Shipping costs for
                returns are borne by the customer unless the item is defective
                or incorrect.
              </p>
              <p>
                For detailed information, please read our full{" "}
                <Link to="/returns" className="text-primary hover:underline">
                  Return Policy
                </Link>
                .
              </p>
            </Section>

            <Section title="6. Privacy & Data Security">
              <p>
                Your use of this Site is also governed by our{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which is incorporated herein by reference. We are committed to
                protecting your personal information and use industry-standard
                security measures.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials. SADIYA Collection will never ask for your
                password via email or phone.
              </p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                All content on this Site — including but not limited to text,
                graphics, logos, product images, and software — is the property
                of MT Industries Ltd. or its content suppliers and is protected
                by applicable intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, display, or create
                derivative works from any content on this Site without express
                written permission from MT Industries Ltd.
              </p>
              <p>
                The SADIYA Collection brand name, logo, and tagline "Your Bags
                Shopping Ends Here" are trademarks of MT Industries Ltd. All
                rights reserved.
              </p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>
                MT Industries Ltd. shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising
                out of your use of or inability to use the Site or its products.
              </p>
              <p>
                Our total liability for any claim arising from these Terms or
                your use of the Site shall not exceed the amount paid by you for
                the specific product(s) in question.
              </p>
            </Section>

            <Section title="9. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of India. Any disputes arising under these Terms
                shall be subject to the exclusive jurisdiction of the courts
                located in India.
              </p>
            </Section>

            <Section title="10. Contact Information">
              <p>
                For any questions regarding these Terms & Conditions, please
                contact us:
              </p>
              <div className="bg-muted/40 rounded-lg p-4 border border-border not-prose">
                <p className="font-semibold text-foreground mb-1">
                  MT Industries Ltd. — SADIYA Collection
                </p>
                <p>Manager: Mohammad Tanzeb</p>
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
              </div>
            </Section>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy →
            </Link>
            <Link
              to="/returns"
              className="hover:text-primary transition-colors"
            >
              Return Policy →
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
