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

interface AuthContextValue {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@sadiyacollection.com";
const ADMIN_PASSWORD = "Admin@2024#Sadiya";
const SESSION_KEY = "sadiya_session";
const USERS_KEY = "sadiya_users";

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

// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
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

    // Check hardcoded admin
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session: AuthUser = {
        email: ADMIN_EMAIL,
        name: "Admin",
        isAdmin: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setCurrentUser(session);
      return;
    }

    // Check stored users
    const users = getStoredUsers();
    const storedUser = users[normalizedEmail];
    if (!storedUser || storedUser.passwordHash !== simpleHash(password)) {
      throw new Error("Invalid email or password.");
    }

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
