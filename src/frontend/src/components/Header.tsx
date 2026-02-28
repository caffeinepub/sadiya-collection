import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LogIn,
  LogOut,
  Menu,
  Package,
  Palette,
  ShoppingBag,
  User,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { THEMES, useTheme } from "../contexts/ThemeContext";
import AuthModal from "./AuthModal";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">(
    "signin",
  );
  const { totalItems, justAdded } = useCart();
  const { currentTheme, setTheme, autoTheme, toggleAutoTheme } = useTheme();
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const openSignIn = () => {
    setAuthModalTab("signin");
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold leading-none text-foreground tracking-wide">
                SADIYA
              </p>
              <p className="text-[10px] text-muted-foreground font-body leading-none tracking-widest uppercase">
                Collection
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}>
                <Button
                  variant={isActive(to) ? "default" : "ghost"}
                  size="sm"
                  className="font-body font-medium"
                >
                  {label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className="font-body font-medium"
                >
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme Switcher */}
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Palette className="w-4.5 h-4.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Change Theme</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-1 mb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Choose Theme
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {THEMES.map((theme) => (
                      <Tooltip key={theme.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setTheme(theme.id)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              currentTheme === theme.id
                                ? "border-foreground scale-110"
                                : "border-transparent"
                            }`}
                            style={{ background: theme.swatch }}
                            aria-label={theme.name}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {theme.emoji} {theme.name}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={toggleAutoTheme}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {autoTheme ? (
                      <ZapOff className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>
                      {autoTheme ? "Stop Auto Theme" : "Auto Theme (30s)"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>

            {/* Cart — always visible */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-4.5 h-4.5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 ${
                        justAdded ? "animate-badge-bounce" : ""
                      }`}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-4.5 h-4.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {currentUser && (
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="font-body text-sm font-semibold truncate">
                        {currentUser.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={openSignIn}
                size="sm"
                className="gap-1.5 btn-ripple"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={isActive(to) ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {isAuthenticated && (
                  <>
                    <Link to="/cart" onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Cart {totalItems > 0 && <Badge>{totalItems}</Badge>}
                      </Button>
                    </Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Button>
                    </Link>
                  </>
                )}
                {!isAuthenticated && (
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      openSignIn();
                    }}
                    className="w-full justify-start gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}
