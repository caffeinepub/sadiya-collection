import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

// Simple deterministic hash — must match AuthContext
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

type ModalView = "tabs" | "forgot-email" | "forgot-reset";

const ADMIN_EMAIL = "admin@sadiyacollection.com";
const ADMIN_CRED_KEY = "sadiya_admin_cred";
const USERS_KEY = "sadiya_users";

export default function AuthModal({
  open,
  onClose,
  defaultTab = "signin",
}: Props) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [view, setView] = useState<ModalView>("tabs");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");

  // Sign Up fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpError, setSignUpError] = useState("");

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [showResetNew, setShowResetNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetErrors = () => {
    setSignInError("");
    setSignUpError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    if (!signInEmail || !signInPassword) {
      setSignInError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await login(signInEmail, signInPassword);
      toast.success("Welcome back!");
      onClose();
    } catch (err: unknown) {
      setSignInError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirm) {
      setSignUpError("Please fill in all fields.");
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      setSignUpError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signup(signUpEmail, signUpPassword, signUpName);
      toast.success("Account created! Welcome to SADIYA Collection.");
      onClose();
    } catch (err: unknown) {
      setSignUpError(
        err instanceof Error ? err.message : "Account creation failed.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    const email = forgotEmail.toLowerCase().trim();
    setIsLoading(true);

    // Simulate small delay
    await new Promise((r) => setTimeout(r, 600));

    // Check if email exists
    const isAdmin = email === ADMIN_EMAIL;
    let found = isAdmin;
    if (!isAdmin) {
      try {
        const stored = JSON.parse(
          localStorage.getItem(USERS_KEY) || "{}",
        ) as Record<
          string,
          { email: string; name: string; passwordHash: string }
        >;
        found = !!stored[email];
      } catch {
        found = false;
      }
    }

    setIsLoading(false);

    if (!found) {
      setForgotError("No account found with this email.");
      return;
    }

    // Generate a 6-digit code and store in state
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResetCode("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetError("");
    setView("forgot-reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetCode.trim()) {
      setResetError("Please enter the reset code.");
      return;
    }
    if (resetCode.trim() !== generatedCode) {
      setResetError("Invalid reset code. Please check and try again.");
      return;
    }
    if (!resetNewPassword || !resetConfirmPassword) {
      setResetError("Please fill in all password fields.");
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const email = forgotEmail.toLowerCase().trim();
    const newHash = simpleHash(resetNewPassword);

    if (email === ADMIN_EMAIL) {
      localStorage.setItem(ADMIN_CRED_KEY, newHash);
    } else {
      try {
        const stored = JSON.parse(
          localStorage.getItem(USERS_KEY) || "{}",
        ) as Record<
          string,
          { email: string; name: string; passwordHash: string }
        >;
        if (stored[email]) {
          stored[email].passwordHash = newHash;
          localStorage.setItem(USERS_KEY, JSON.stringify(stored));
        }
      } catch {
        setIsLoading(false);
        setResetError("Failed to reset password. Please try again.");
        return;
      }
    }

    setIsLoading(false);
    toast.success("Password reset successfully!");
    // Return to sign in
    backToSignIn();
  };

  const backToSignIn = () => {
    setView("tabs");
    setTab("signin");
    setForgotEmail("");
    setForgotError("");
    setGeneratedCode("");
    setResetCode("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetError("");
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onClose();
      // Reset view after close
      setTimeout(() => setView("tabs"), 300);
    }
  };

  const modalTitle =
    view === "forgot-email"
      ? "Forgot Password"
      : view === "forgot-reset"
        ? "Reset Password"
        : tab === "signin"
          ? "Welcome Back"
          : "Create Account";

  const modalSubtitle =
    view === "forgot-email"
      ? "Enter your email to receive a reset code"
      : view === "forgot-reset"
        ? `Reset code sent for ${forgotEmail}`
        : view === "tabs" && tab === "signin"
          ? "Sign in to your SADIYA Collection account"
          : "Join SADIYA Collection for exclusive shopping";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        {/* Decorative header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {view === "tabs" ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <KeyRound className="w-4 h-4 text-primary" />
                )}
              </div>
              <DialogTitle className="font-display text-xl">
                {modalTitle}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground font-body pl-11">
              {modalSubtitle}
            </p>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {/* ── Forgot Password: Email Step ── */}
            {view === "forgot-email" && (
              <motion.div
                key="forgot-email"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <div>
                    <Label htmlFor="fp-email" className="font-body text-sm">
                      Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fp-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9 font-body"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive font-body bg-destructive/10 px-3 py-2 rounded-md"
                    >
                      {forgotError}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2 btn-ripple font-body"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Checking…" : "Send Reset Code"}
                  </Button>

                  <button
                    type="button"
                    onClick={backToSignIn}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body w-full justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Forgot Password: Reset Code + New Password Step ── */}
            {view === "forgot-reset" && (
              <motion.div
                key="forgot-reset"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {/* Show the code prominently */}
                <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground font-body mb-1">
                    Your reset code (use this to continue):
                  </p>
                  <p className="font-display text-2xl font-bold text-primary tracking-widest select-all">
                    {generatedCode}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    Copy this code and enter it below
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="fp-code" className="font-body text-sm">
                      Reset Code
                    </Label>
                    <div className="relative mt-1.5">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fp-code"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="pl-9 font-body tracking-widest"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fp-newpw" className="font-body text-sm">
                      New Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fp-newpw"
                        type={showResetNew ? "text" : "password"}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pl-9 pr-10 font-body"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showResetNew ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fp-confirmpw" className="font-body text-sm">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fp-confirmpw"
                        type={showResetConfirm ? "text" : "password"}
                        value={resetConfirmPassword}
                        onChange={(e) =>
                          setResetConfirmPassword(e.target.value)
                        }
                        placeholder="Repeat your new password"
                        className="pl-9 pr-10 font-body"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showResetConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {resetError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive font-body bg-destructive/10 px-3 py-2 rounded-md"
                    >
                      {resetError}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2 btn-ripple font-body"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Resetting…" : "Reset Password"}
                  </Button>

                  <button
                    type="button"
                    onClick={backToSignIn}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body w-full justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Tabs: Sign In / Sign Up ── */}
            {view === "tabs" && (
              <motion.div
                key="tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Tabs
                  value={tab}
                  onValueChange={(v) => {
                    setTab(v as "signin" | "signup");
                    resetErrors();
                  }}
                >
                  <TabsList className="grid grid-cols-2 w-full mb-5">
                    <TabsTrigger value="signin" className="font-body text-sm">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="font-body text-sm">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Sign In ── */}
                  <TabsContent value="signin">
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <Label
                            htmlFor="si-email"
                            className="font-body text-sm"
                          >
                            Email Address
                          </Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="si-email"
                              type="email"
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="pl-9 font-body"
                              autoComplete="email"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="si-password"
                            className="font-body text-sm"
                          >
                            Password
                          </Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="si-password"
                              type={showPassword ? "text" : "password"}
                              value={signInPassword}
                              onChange={(e) =>
                                setSignInPassword(e.target.value)
                              }
                              placeholder="Your password"
                              className="pl-9 pr-10 font-body"
                              autoComplete="current-password"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {/* Forgot Password link */}
                          <div className="flex justify-end mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setForgotEmail(signInEmail);
                                setForgotError("");
                                setView("forgot-email");
                              }}
                              className="text-xs text-primary hover:text-primary/80 transition-colors font-body underline-offset-2 hover:underline"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </div>

                        {signInError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive font-body bg-destructive/10 px-3 py-2 rounded-md"
                          >
                            {signInError}
                          </motion.p>
                        )}

                        <Button
                          type="submit"
                          className="w-full gap-2 btn-ripple font-body"
                          disabled={isLoading}
                        >
                          {isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {isLoading ? "Signing In…" : "Sign In"}
                        </Button>
                      </form>
                    </motion.div>
                  </TabsContent>

                  {/* ── Sign Up ── */}
                  <TabsContent value="signup">
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <Label
                            htmlFor="su-name"
                            className="font-body text-sm"
                          >
                            Full Name
                          </Label>
                          <div className="relative mt-1.5">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="su-name"
                              type="text"
                              value={signUpName}
                              onChange={(e) => setSignUpName(e.target.value)}
                              placeholder="Your full name"
                              className="pl-9 font-body"
                              autoComplete="name"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="su-email"
                            className="font-body text-sm"
                          >
                            Email Address
                          </Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="su-email"
                              type="email"
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="pl-9 font-body"
                              autoComplete="email"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="su-password"
                            className="font-body text-sm"
                          >
                            Password
                          </Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="su-password"
                              type={showPassword ? "text" : "password"}
                              value={signUpPassword}
                              onChange={(e) =>
                                setSignUpPassword(e.target.value)
                              }
                              placeholder="Min 6 characters"
                              className="pl-9 pr-10 font-body"
                              autoComplete="new-password"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="su-confirm"
                            className="font-body text-sm"
                          >
                            Confirm Password
                          </Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="su-confirm"
                              type={showConfirm ? "text" : "password"}
                              value={signUpConfirm}
                              onChange={(e) => setSignUpConfirm(e.target.value)}
                              placeholder="Repeat your password"
                              className="pl-9 pr-10 font-body"
                              autoComplete="new-password"
                              disabled={isLoading}
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

                        {signUpError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive font-body bg-destructive/10 px-3 py-2 rounded-md"
                          >
                            {signUpError}
                          </motion.p>
                        )}

                        <Button
                          type="submit"
                          className="w-full gap-2 btn-ripple font-body"
                          disabled={isLoading}
                        >
                          {isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {isLoading ? "Creating Account…" : "Create Account"}
                        </Button>
                      </form>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
