import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useContactInfo } from "../hooks/useQueries";

export default function ContactPage() {
  const { data: contactInfo } = useContactInfo();

  const contact = contactInfo || {
    email: "tanzebmohammad@gmail.com",
    phone: "8750787355",
    address: "MT Industries Ltd., India",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll respond within 24 hours.");
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="text-xs uppercase tracking-widest font-body mb-2 opacity-70"
              style={{ color: "oklch(0.98 0.008 30)" }}
            >
              Get In Touch
            </p>
            <h1
              className="font-display text-4xl md:text-5xl font-bold mb-3"
              style={{ color: "oklch(0.98 0.008 30)" }}
            >
              Contact Us
            </h1>
            <p
              className="font-accent italic text-lg opacity-80"
              style={{ color: "oklch(0.88 0.06 50)" }}
            >
              We're here to help with your shopping experience
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl font-bold mb-2">
              Support Details
            </h2>
            <p className="text-muted-foreground font-body mb-6">
              Reach out to our support team for any queries about products,
              orders, or returns.
            </p>

            {/* Contact cards */}
            <div className="space-y-4">
              {/* Manager */}
              <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Mohammad Tanzeb</p>
                  <p className="text-xs text-muted-foreground font-body">
                    Store Manager · SADIYA Collection
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Call / WhatsApp</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-primary font-body text-sm hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Email Support</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary font-body text-sm hover:underline break-all"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Business Address</p>
                  <p className="text-muted-foreground font-body text-sm">
                    {contact.address || "MT Industries Ltd., India"}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Support Hours</p>
                  <p className="text-muted-foreground font-body text-sm">
                    Mon – Sat: 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">
                  Send Us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name" className="font-body text-sm">
                      Your Name *
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Full name"
                      className="mt-1 font-body"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="contact-email"
                      className="font-body text-sm"
                    >
                      Email *
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1 font-body"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact-phone" className="font-body text-sm">
                    Phone Number
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="mt-1 font-body"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contact-subject"
                    className="font-body text-sm"
                  >
                    Subject *
                  </Label>
                  <Input
                    id="contact-subject"
                    placeholder="Order query, product info, return request..."
                    className="mt-1 font-body"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contact-message"
                    className="font-body text-sm"
                  >
                    Message *
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="How can we help you?"
                    className="mt-1 font-body resize-none"
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 btn-ripple font-body"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
