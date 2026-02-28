import { Link } from "@tanstack/react-router";
import { ChevronRight, Shield } from "lucide-react";
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

export default function PrivacyPage() {
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
              <span>Privacy Policy</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  Privacy Policy
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                  SADIYA Collection · MT Industries Ltd.
                </p>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg px-4 py-3 text-xs text-muted-foreground font-body border border-border">
              Last updated: January 2025 · We are committed to protecting your
              privacy and securing your data.
            </div>
          </div>

          {/* Security highlight */}
          <div className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-body font-semibold text-sm text-foreground mb-1">
                  Your Data is Encrypted & Secured
                </p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  All customer data collected through SADIYA Collection is
                  encrypted in transit and at rest. We use industry-standard
                  security protocols to protect your personal information. We
                  never sell your data to third parties.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <Section title="1. Information We Collect">
              <p>
                When you use SADIYA Collection, we may collect the following
                types of information:
              </p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Account information: name, email address, and password (stored securely as a hash).",
                  "Profile information: delivery address, phone number (provided voluntarily).",
                  "Order information: items purchased, quantities, payment details (processed by our payment gateway — we do not store card numbers).",
                  "Device information: IP address, browser type, and operating system for security and analytics.",
                  "Usage data: pages visited, time spent, and actions taken on the Site.",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Process and fulfill your orders, including shipping and delivery notifications.",
                  "Manage your account and provide customer support.",
                  "Improve our products, services, and website experience.",
                  "Detect and prevent fraud, unauthorized access, and security incidents.",
                  "Communicate important updates about your orders, account, or changes to our policies.",
                  "Send promotional communications (only with your consent — you can opt out at any time).",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="3. Data Security">
              <p>
                We take data security very seriously. Your personal data is
                protected using industry-standard encryption. Specifically:
              </p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Passwords are stored as cryptographic hashes — we cannot see your actual password.",
                  "All data transmission between your browser and our servers uses HTTPS encryption.",
                  "Payment data is processed exclusively through PCI-DSS compliant payment gateways.",
                  "Access to customer data is strictly limited to authorized personnel.",
                  "We implement rate limiting and account lockout to prevent brute-force attacks.",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Despite our best efforts, no method of data transmission over
                the internet or electronic storage is 100% secure. We encourage
                you to use a strong, unique password and enable two-factor
                authentication where available.
              </p>
            </Section>

            <Section title="4. Cookies">
              <p>
                We use cookies and similar tracking technologies to improve your
                browsing experience, remember your preferences (such as selected
                theme), and analyze Site usage.
              </p>
              <p>
                <strong>Types of cookies we use:</strong>
              </p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Essential cookies: Required for the Site to function correctly (e.g., session management, cart contents).",
                  "Preference cookies: Remember your settings such as theme selection.",
                  "Analytics cookies: Help us understand how visitors use our Site so we can improve it.",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                You can disable cookies in your browser settings, but this may
                affect the functionality of the Site.
              </p>
            </Section>

            <Section title="5. Third-Party Services">
              <p>
                We work with trusted third-party services to operate our
                business. These include:
              </p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Payment processors (Stripe, Razorpay, etc.): Handle payment processing securely. They are governed by their own privacy policies.",
                  "Shipping carriers (DHL, FedEx, BlueDart, DTDC, Delhivery, Ekart, Xpressbees, India Post): Receive your name and delivery address to fulfill orders.",
                  "Internet Computer (ICP): Our platform infrastructure for secure data storage.",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                We do not sell, rent, or trade your personal information to any
                third party for marketing purposes.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>
                Under applicable data protection laws, you have the following
                rights regarding your personal data:
              </p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "Right to access: Request a copy of the personal data we hold about you.",
                  "Right to correction: Request that we correct any inaccurate personal data.",
                  "Right to deletion: Request that we delete your personal data (subject to legal obligations).",
                  "Right to opt-out: Opt out of marketing communications at any time.",
                  "Right to data portability: Receive your data in a structured, machine-readable format.",
                ].map((item) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                To exercise any of these rights, please contact us using the
                information below.
              </p>
            </Section>

            <Section title="7. Children's Privacy">
              <p>
                Our Site is not intended for children under 13 years of age. We
                do not knowingly collect personal information from children. If
                you believe a child has provided us with personal information,
                please contact us immediately.
              </p>
            </Section>

            <Section title="8. Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/40 rounded-lg p-4 border border-border not-prose">
                <p className="font-semibold text-foreground mb-1">
                  MT Industries Ltd. — SADIYA Collection
                </p>
                <p>Data Privacy Officer: Mohammad Tanzeb</p>
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
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions →
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
