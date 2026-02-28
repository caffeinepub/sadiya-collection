import { Link } from "@tanstack/react-router";
import { Heart, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p
                  className="font-display text-base font-bold leading-none"
                  style={{ color: "oklch(0.98 0.008 30)" }}
                >
                  SADIYA Collection
                </p>
                <p className="text-[10px] opacity-60 leading-none tracking-widest uppercase font-body">
                  by MT Industries Ltd.
                </p>
              </div>
            </div>
            <p className="font-accent text-sm opacity-70 italic mb-4">
              "Your Bags Shopping Ends Here"
            </p>
            <p className="text-xs opacity-50 font-body leading-relaxed">
              Premium bag collections for every occasion. Crafted with care,
              delivered with love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="font-display text-sm font-semibold mb-4 tracking-wide"
              style={{ color: "oklch(0.98 0.008 30)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm opacity-70">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop All Bags" },
                { to: "/orders", label: "My Orders" },
                { to: "/profile", label: "My Profile" },
                { to: "/contact", label: "Contact Us" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:opacity-100 transition-opacity font-body"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3
              className="font-display text-sm font-semibold mb-4 tracking-wide"
              style={{ color: "oklch(0.98 0.008 30)" }}
            >
              Categories
            </h3>
            <ul className="space-y-2 text-sm opacity-70">
              {[
                "Handbags",
                "Backpacks",
                "Tote Bags",
                "Travel Bags",
                "Clutches",
                "Wallets",
              ].map((cat) => (
                <li key={cat}>
                  <a
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="hover:opacity-100 transition-opacity font-body"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="font-display text-sm font-semibold mb-4 tracking-wide"
              style={{ color: "oklch(0.98 0.008 30)" }}
            >
              Support
            </h3>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2 font-body">
                <Phone className="w-4 h-4 shrink-0" />
                <span>8750787355</span>
              </li>
              <li className="flex items-center gap-2 font-body">
                <Mail className="w-4 h-4 shrink-0" />
                <a
                  href="mailto:tanzebmohammad@gmail.com"
                  className="hover:opacity-100 transition-opacity break-all"
                >
                  tanzebmohammad@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 font-body">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>MT Industries Ltd., India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-50 font-body">
          <p>
            © {year} SADIYA Collection · MT Industries Ltd. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 fill-current text-red-400" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
