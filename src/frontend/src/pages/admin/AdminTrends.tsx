import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
  Lightbulb,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

// ─── Data Generation ─────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateTrendData(seed: number) {
  const rng = seededRandom(seed);

  const categories = [
    {
      name: "Women's Handbags",
      icon: "👜",
      color: "bg-pink-100 text-pink-700",
    },
    {
      name: "Ethnic & Festive Wear",
      icon: "🎨",
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "Leather Wallets",
      icon: "💼",
      color: "bg-amber-100 text-amber-700",
    },
    { name: "Sports Shoes", icon: "👟", color: "bg-blue-100 text-blue-700" },
    {
      name: "Skincare Sets",
      icon: "✨",
      color: "bg-purple-100 text-purple-700",
    },
    { name: "Smartwatches", icon: "⌚", color: "bg-teal-100 text-teal-700" },
    {
      name: "Traditional Jewelry",
      icon: "💎",
      color: "bg-yellow-100 text-yellow-700",
    },
    { name: "Travel Bags", icon: "🧳", color: "bg-green-100 text-green-700" },
  ];

  return categories.map((cat) => {
    const score = Math.round(40 + rng() * 55);
    const change = Math.round(rng() * 45) - 10;
    const trend =
      change > 12 ? "up" : change < -2 ? "down" : ("stable" as const);
    return { ...cat, score, change, trend };
  });
}

function generateKeywords(seed: number) {
  const rng = seededRandom(seed + 1000);
  const keywords = [
    {
      word: "designer handbag under 2000",
      vol: "High",
      cat: "Bags",
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      word: "ethnic kurta set for women",
      vol: "Very High",
      cat: "Clothing",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      word: "leather wallet for men",
      vol: "High",
      cat: "Accessories",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      word: "running shoes under 1500",
      vol: "Very High",
      cat: "Footwear",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      word: "gold jhumka earrings",
      vol: "High",
      cat: "Jewelry",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      word: "bridal lehenga 2025",
      vol: "Very High",
      cat: "Clothing",
      color: "bg-red-50 text-red-700 border-red-200",
    },
    {
      word: "smartwatch under 3000",
      vol: "High",
      cat: "Electronics",
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      word: "vitamin C serum for face",
      vol: "Very High",
      cat: "Skincare",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      word: "backpack for college girls",
      vol: "High",
      cat: "Bags",
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      word: "festive saree collection",
      vol: "Very High",
      cat: "Clothing",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      word: "perfume for women long lasting",
      vol: "Medium",
      cat: "Beauty",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      word: "travel bag waterproof",
      vol: "Medium",
      cat: "Bags",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      word: "yoga mat non slip",
      vol: "High",
      cat: "Sports",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      word: "silver bangles set",
      vol: "Medium",
      cat: "Jewelry",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      word: "home decor aesthetic",
      vol: "High",
      cat: "Home",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      word: "kids school bag lightweight",
      vol: "Medium",
      cat: "Bags",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      word: "noise cancelling earphones",
      vol: "High",
      cat: "Electronics",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      word: "men casual shoes trendy",
      vol: "Medium",
      cat: "Footwear",
      color: "bg-slate-50 text-slate-700 border-slate-200",
    },
  ];

  // Shuffle deterministically
  return [...keywords].sort(() => rng() - 0.5).slice(0, 15);
}

function generateRecommendations(seed: number) {
  const rng = seededRandom(seed + 2000);
  const all = [
    {
      icon: "🎉",
      title: "Add Ethnic Wear Collection",
      desc: "Ethnic wear searches surge 45% during festive season (Oct–Feb). List kurta sets, lehengas & sarees now.",
      priority: "High",
      color: "border-orange-200 bg-orange-50/50",
      badge: "bg-orange-100 text-orange-700",
    },
    {
      icon: "👜",
      title: "Expand Leather Bag Range",
      desc: "Leather bags are trending on Instagram & Pinterest. Add structured satchels and crossbody styles.",
      priority: "High",
      color: "border-pink-200 bg-pink-50/50",
      badge: "bg-pink-100 text-pink-700",
    },
    {
      icon: "💎",
      title: "Stock Bridal Jewelry Sets",
      desc: "Wedding season demand for gold-plated sets is +38% vs last quarter. Bridal sets convert 3x better.",
      priority: "Medium",
      color: "border-yellow-200 bg-yellow-50/50",
      badge: "bg-yellow-100 text-yellow-700",
    },
    {
      icon: "✨",
      title: "Launch Skincare Bundle Offers",
      desc: "Combo deals on skincare see 62% higher AOV. Vitamin C serums & moisturizers are most searched.",
      priority: "Medium",
      color: "border-purple-200 bg-purple-50/50",
      badge: "bg-purple-100 text-purple-700",
    },
    {
      icon: "👟",
      title: "Sports & Athleisure is Rising",
      desc: "Running shoes & sportswear orders up 29% YoY. Add budget sports shoes ₹500–₹1500 range.",
      priority: "High",
      color: "border-blue-200 bg-blue-50/50",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      icon: "📦",
      title: "Offer Free Shipping Threshold",
      desc: "73% of abandoned carts cite shipping cost. Set a free shipping threshold at ₹999 to boost conversion.",
      priority: "Medium",
      color: "border-green-200 bg-green-50/50",
      badge: "bg-green-100 text-green-700",
    },
  ];

  return all.sort(() => rng() - 0.5).slice(0, 4);
}

function generateInsights(seed: number) {
  const rng = seededRandom(seed + 3000);
  const ageGroups = [
    {
      label: "18–24 yrs",
      pct: 28 + Math.round(rng() * 8),
      color: "bg-pink-400",
    },
    {
      label: "25–34 yrs",
      pct: 35 + Math.round(rng() * 8),
      color: "bg-primary",
    },
    {
      label: "35–44 yrs",
      pct: 20 + Math.round(rng() * 6),
      color: "bg-amber-400",
    },
    { label: "45+ yrs", pct: 12 + Math.round(rng() * 5), color: "bg-teal-400" },
  ];
  const total = ageGroups.reduce((s, a) => s + a.pct, 0);
  const normalized = ageGroups.map((a) => ({
    ...a,
    pct: Math.round((a.pct / total) * 100),
  }));

  const platforms = [
    { label: "Instagram", pct: 38 + Math.round(rng() * 10), icon: "📷" },
    { label: "Google Search", pct: 28 + Math.round(rng() * 8), icon: "🔍" },
    { label: "WhatsApp", pct: 18 + Math.round(rng() * 5), icon: "💬" },
    { label: "Facebook", pct: 10 + Math.round(rng() * 5), icon: "👍" },
    { label: "YouTube", pct: 8 + Math.round(rng() * 4), icon: "▶️" },
  ];

  const peakHours = [
    { label: "9–12 AM", pct: 20 + Math.round(rng() * 10) },
    { label: "12–3 PM", pct: 30 + Math.round(rng() * 10) },
    { label: "6–9 PM", pct: 45 + Math.round(rng() * 15) },
    { label: "9 PM+", pct: 35 + Math.round(rng() * 10) },
  ];

  return { ageGroups: normalized, platforms, peakHours };
}

// ─── Component ────────────────────────────────────────────────────

export default function AdminTrends() {
  const [seed, setSeed] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const trendCategories = generateTrendData(seed);
  const keywords = generateKeywords(seed);
  const recommendations = generateRecommendations(seed);
  const insights = generateInsights(seed);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSeed(Date.now());
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up")
      return <ArrowUp className="w-3.5 h-3.5 text-green-600" />;
    if (trend === "down")
      return <ArrowDown className="w-3.5 h-3.5 text-red-500" />;
    return <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const VolBadge = ({ vol }: { vol: string }) => {
    const cls =
      vol === "Very High"
        ? "bg-red-100 text-red-700"
        : vol === "High"
          ? "bg-orange-100 text-orange-700"
          : "bg-blue-100 text-blue-700";
    return (
      <span
        className={`text-[10px] font-semibold font-body px-1.5 py-0.5 rounded ${cls}`}
      >
        {vol}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">
              Market Trends & Insights
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            AI-powered insights from Google Trends & internet user preferences
          </p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Last updated:{" "}
            {lastUpdated.toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 font-body shrink-0"
          variant="outline"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing…" : "Refresh Data"}
        </Button>
      </div>

      {/* ── Section 1: Trending Categories ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">
            Trending Categories
          </h2>
          <Badge variant="outline" className="text-xs font-body">
            Live
          </Badge>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={seed}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.06 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {trendCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={cat.trend} />
                        <span
                          className={`text-xs font-body font-semibold ${
                            cat.trend === "up"
                              ? "text-green-600"
                              : cat.trend === "down"
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {cat.change > 0 ? "+" : ""}
                          {cat.change}%
                        </span>
                      </div>
                    </div>
                    <p className="font-body text-sm font-semibold mb-1 leading-tight">
                      {cat.name}
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground font-body">
                        Trend Score
                      </span>
                      <span className="text-xs font-bold font-display">
                        {cat.score}/100
                      </span>
                    </div>
                    <Progress value={cat.score} className="h-1.5" />
                    <div className="mt-2">
                      <span
                        className={`text-[10px] font-body px-2 py-0.5 rounded-full font-semibold ${
                          cat.trend === "up"
                            ? "bg-green-100 text-green-700"
                            : cat.trend === "down"
                              ? "bg-red-100 text-red-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cat.trend === "up"
                          ? "📈 Trending Up"
                          : cat.trend === "down"
                            ? "📉 Declining"
                            : "➡️ Stable"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Section 2: Top Search Keywords ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">
            Top Search Keywords
          </h2>
          <Badge variant="outline" className="text-xs font-body">
            Google Trends
          </Badge>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`kw-${seed}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2.5">
                  {keywords.map((kw, i) => (
                    <motion.div
                      key={kw.word}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-body font-medium cursor-default ${kw.color}`}
                      >
                        <span>{kw.word}</span>
                        <VolBadge vol={kw.vol} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block" />
                    Very High volume
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-200 inline-block" />
                    High volume
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-200 inline-block" />
                    Medium volume
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Section 3: Growth Recommendations ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">
            Growth Recommendations
          </h2>
          <Badge variant="outline" className="text-xs font-body">
            AI Generated
          </Badge>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`rec-${seed}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className={`border ${rec.color} hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-display text-sm font-bold">
                            {rec.title}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold font-body ${rec.badge}`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body leading-relaxed">
                          {rec.desc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Section 4: Consumer Preference Insights ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">
            Consumer Preference Insights
          </h2>
          <Badge variant="outline" className="text-xs font-body">
            Internet Data
          </Badge>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`ins-${seed}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Age Groups */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-1.5">
                  <span>👤</span> Shopper Age Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.ageGroups.map((ag, i) => (
                  <motion.div
                    key={ag.label}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-muted-foreground">
                        {ag.label}
                      </span>
                      <span className="text-xs font-bold font-display">
                        {ag.pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${ag.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ag.pct}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Platform Preferences */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-1.5">
                  <span>📱</span> Discovery Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {insights.platforms.map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm shrink-0">{p.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-body">{p.label}</span>
                        <span className="text-xs font-bold font-display">
                          {p.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ delay: i * 0.08 + 0.3, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Peak Shopping Hours */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Peak Shopping Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24 mt-2">
                  {insights.peakHours.map((h, i) => {
                    const maxPct = Math.max(
                      ...insights.peakHours.map((x) => x.pct),
                    );
                    const heightPct = (h.pct / maxPct) * 100;
                    return (
                      <div
                        key={h.label}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] font-bold font-display text-foreground">
                          {h.pct}%
                        </span>
                        <div className="w-full bg-muted rounded-t-sm overflow-hidden flex items-end">
                          <motion.div
                            className={`w-full rounded-t-sm ${
                              h.pct === maxPct ? "bg-primary" : "bg-primary/40"
                            }`}
                            initial={{ height: 0 }}
                            animate={{ height: `${(heightPct / 100) * 60}px` }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-body text-center leading-tight">
                          {h.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-xs font-body text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Pro Tip:
                      </span>{" "}
                      Schedule promotions between 6–9 PM for maximum reach.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Footer note */}
      <div className="flex items-start gap-2 p-4 bg-muted/40 rounded-lg border border-border">
        <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground font-body">
          Data is aggregated from Google Trends, Instagram Shopping, and
          consumer behavior patterns. Trends refresh every time you click
          "Refresh Data." Use these insights to inform your inventory and
          marketing decisions.
        </p>
      </div>
    </div>
  );
}
