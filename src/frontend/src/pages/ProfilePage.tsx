import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthContext";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { isAuthenticated, currentUser, logout, changeUserPassword } =
    useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
  });

  // Change password form
  const [cpForm, setCpForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [cpLoading, setCpLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !cpForm.currentPassword ||
      !cpForm.newPassword ||
      !cpForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (cpForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (cpForm.newPassword !== cpForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setCpLoading(true);
    try {
      await changeUserPassword(cpForm.currentPassword, cpForm.newPassword);
      toast.success("Password changed successfully!");
      setCpForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setCpLoading(false);
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
          className="space-y-6"
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

          {/* Personal Information Card */}
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

          {/* Change Password Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </h2>

            {currentUser?.isAdmin ? (
              <div className="flex items-start gap-3 bg-muted/50 rounded-lg px-4 py-3">
                <Settings className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm font-body text-muted-foreground">
                  Admin password can be changed from the{" "}
                  <a
                    href="/admin"
                    className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Admin Dashboard → Settings
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="cp-current" className="font-body text-sm">
                    Current Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cp-current"
                      type={showCurrent ? "text" : "password"}
                      value={cpForm.currentPassword}
                      onChange={(e) =>
                        setCpForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Your current password"
                      className="pl-9 pr-10 font-body"
                      autoComplete="current-password"
                      disabled={cpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrent ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cp-new" className="font-body text-sm">
                    New Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cp-new"
                      type={showNew ? "text" : "password"}
                      value={cpForm.newPassword}
                      onChange={(e) =>
                        setCpForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Min 6 characters"
                      className="pl-9 pr-10 font-body"
                      autoComplete="new-password"
                      disabled={cpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNew ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cp-confirm" className="font-body text-sm">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cp-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={cpForm.confirmPassword}
                      onChange={(e) =>
                        setCpForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Repeat new password"
                      className="pl-9 pr-10 font-body"
                      autoComplete="new-password"
                      disabled={cpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Separator />

                <Button
                  type="submit"
                  className="gap-2 btn-ripple font-body"
                  disabled={cpLoading}
                >
                  {cpLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {cpLoading ? "Updating…" : "Change Password"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
