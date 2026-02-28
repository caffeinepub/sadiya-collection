import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LogIn, LogOut, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthContext";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || currentUser?.name || "",
        email: profile.email || currentUser?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    } else if (currentUser) {
      setForm((f) => ({
        ...f,
        name: currentUser.name,
        email: currentUser.email,
      }));
    }
  }, [profile, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync(form);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="font-display text-3xl font-bold mb-3">My Profile</h1>
            <p className="text-muted-foreground font-body mb-6">
              Sign in to view and edit your profile
            </p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="gap-2 font-body btn-ripple"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </main>
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground font-body text-sm mt-1">
                {currentUser?.email}
                {currentUser?.isAdmin && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              size="sm"
              className="gap-1.5 text-muted-foreground font-body"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-body text-sm">
                    Full Name *
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      className="pl-9 font-body"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="font-body text-sm">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="your@email.com"
                      className="pl-9 font-body"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="font-body text-sm">
                    Phone Number
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                      className="pl-9 font-body"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="font-body text-sm">
                    Delivery Address
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      placeholder="Your full delivery address"
                      className="pl-9 font-body resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                <Button
                  type="submit"
                  className="gap-2 btn-ripple font-body"
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saveProfile.isPending ? "Saving…" : "Save Profile"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
