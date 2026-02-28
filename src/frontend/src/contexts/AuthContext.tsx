import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthUser {
  email: string;
  name: string;
  isAdmin: boolean;
}

interface StoredUser {
  email: string;
  name: string;
  passwordHash: string;
}

interface FailedAttemptRecord {
  count: number;
  lockedUntil: number; // epoch ms
}

export interface AuthContextValue {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changeAdminPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@sadiyacollection.com";
const ADMIN_CRED_KEY = "sadiya_admin_cred";
const SESSION_KEY = "sadiya_session";
const USERS_KEY = "sadiya_users";
const FAILED_ATTEMPTS_KEY = "sadiya_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Simple deterministic hash (not for real security — localStorage only)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// Initialize admin credential hash on first load
function getAdminHash(): string {
  let stored = localStorage.getItem(ADMIN_CRED_KEY);
  if (!stored) {
    // Set default hash — never log or display this value
    stored = simpleHash("Admin@2024#Sadiya");
    localStorage.setItem(ADMIN_CRED_KEY, stored);
  }
  return stored;
}

function getStoredUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getFailedAttempts(): Record<string, FailedAttemptRecord> {
  try {
    return JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveFailedAttempts(attempts: Record<string, FailedAttemptRecord>) {
  localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function recordFailedAttempt(email: string): FailedAttemptRecord {
  const attempts = getFailedAttempts();
  const current = attempts[email] || { count: 0, lockedUntil: 0 };
  const newCount = current.count + 1;
  const lockedUntil =
    newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : 0;
  const updated = { count: newCount, lockedUntil };
  attempts[email] = updated;
  saveFailedAttempts(attempts);
  return updated;
}

function resetFailedAttempts(email: string) {
  const attempts = getFailedAttempts();
  delete attempts[email];
  saveFailedAttempts(attempts);
}

function checkLockout(email: string): { locked: boolean; remainingMs: number } {
  const attempts = getFailedAttempts();
  const record = attempts[email];
  if (!record) return { locked: false, remainingMs: 0 };

  if (record.lockedUntil > 0 && Date.now() < record.lockedUntil) {
    return { locked: true, remainingMs: record.lockedUntil - Date.now() };
  }

  // Lockout expired — clear it
  if (record.lockedUntil > 0 && Date.now() >= record.lockedUntil) {
    resetFailedAttempts(email);
  }

  return { locked: false, remainingMs: 0 };
}

// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount + init admin hash
  useEffect(() => {
    // Initialize admin hash silently
    getAdminHash();

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as AuthUser;
        setCurrentUser(session);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const normalizedEmail = email.toLowerCase().trim();

      // Admin email cannot be re-registered
      if (normalizedEmail === ADMIN_EMAIL) {
        throw new Error("This email is reserved.");
      }

      const users = getStoredUsers();
      if (users[normalizedEmail]) {
        throw new Error("An account with this email already exists.");
      }

      const newUser: StoredUser = {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: simpleHash(password),
      };

      users[normalizedEmail] = newUser;
      saveStoredUsers(users);

      const session: AuthUser = {
        email: normalizedEmail,
        name: name.trim(),
        isAdmin: false,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setCurrentUser(session);
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check lockout
    const lockStatus = checkLockout(normalizedEmail);
    if (lockStatus.locked) {
      const mins = Math.ceil(lockStatus.remainingMs / 60000);
      throw new Error(
        `Too many failed attempts. Account locked for ${mins} more minute${mins !== 1 ? "s" : ""}. Try again later.`,
      );
    }

    // Check admin
    if (normalizedEmail === ADMIN_EMAIL) {
      const adminHash = getAdminHash();
      if (simpleHash(password) === adminHash) {
        resetFailedAttempts(normalizedEmail);
        const session: AuthUser = {
          email: ADMIN_EMAIL,
          name: "Admin",
          isAdmin: true,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setCurrentUser(session);
        return;
      }
      const record = recordFailedAttempt(normalizedEmail);
      const remaining = MAX_ATTEMPTS - record.count;
      if (record.count >= MAX_ATTEMPTS) {
        throw new Error(
          "Too many failed attempts. Account locked for 15 minutes.",
        );
      }
      throw new Error(
        `Invalid email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
      );
    }

    // Check stored users
    const users = getStoredUsers();
    const storedUser = users[normalizedEmail];
    if (!storedUser || storedUser.passwordHash !== simpleHash(password)) {
      const record = recordFailedAttempt(normalizedEmail);
      const remaining = MAX_ATTEMPTS - record.count;
      if (record.count >= MAX_ATTEMPTS) {
        throw new Error(
          "Too many failed attempts. Account locked for 15 minutes.",
        );
      }
      throw new Error(
        `Invalid email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
      );
    }

    resetFailedAttempts(normalizedEmail);
    const session: AuthUser = {
      email: storedUser.email,
      name: storedUser.name,
      isAdmin: false,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const changeAdminPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const adminHash = getAdminHash();
      if (simpleHash(currentPassword) !== adminHash) {
        throw new Error("Current password is incorrect.");
      }
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters.");
      }
      if (!/[A-Z]/.test(newPassword)) {
        throw new Error(
          "New password must contain at least one uppercase letter.",
        );
      }
      if (!/[0-9]/.test(newPassword)) {
        throw new Error("New password must contain at least one number.");
      }
      // Save new hash — never store plain text
      localStorage.setItem(ADMIN_CRED_KEY, simpleHash(newPassword));
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.isAdmin ?? false,
        signup,
        login,
        logout,
        changeAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
