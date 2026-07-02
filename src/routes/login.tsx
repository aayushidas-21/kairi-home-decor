import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";
import { auth, db } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Account — Kairi" },
      { name: "description", content: "Sign in or register an account with Kairi Home Decor." },
    ],
  }),
  component: LoginComponent,
});

function getFriendlyErrorMessage(err: any): string {
  if (!err) return "An authentication error occurred.";
  
  const code = err.code || "";
  
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email. Please register first.";
    case "auth/weak-password":
      return "Password is too weak. It must be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Access to this account has been temporarily disabled. Please try again later.";
    default:
      if (err.message && err.message.includes("permission")) {
        return "Insufficient database permissions. Please contact support.";
      }
      return err.message?.replace(/^Firebase:\s*/, "") || "An authentication error occurred.";
  }
}

function LoginComponent() {
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else if (view === "register") {
        // Register
        if (fullName.trim().length < 2) {
          toast.error("Please enter your full name.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
          // Create user document in Firestore - all new signups default to "user"
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: fullName.trim(),
            role: "user",
            createdAt: new Date().toISOString(),
          });
        } catch (firestoreError) {
          // Clean up the created auth user since profile creation failed
          console.error("Firestore profile creation failed, cleaning up Auth account:", firestoreError);
          await deleteUser(user);
          throw firestoreError;
        }

        toast.success("Account created successfully!");
        navigate({ to: "/" });
      } else if (view === "forgot") {
        // Forgot Password
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent! Please check your inbox.");
        setView("login");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-[480px] px-6 py-20 md:py-28">
        <div className="rounded-2xl border border-divider bg-linen/50 p-8 backdrop-blur-md shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-4xl text-espresso">
              {view === "login" ? "Sign In" : view === "register" ? "Create Account" : "Reset Password"}
            </h1>
            <p className="mt-2 text-sm text-taupe">
              {view === "login" 
                ? "Welcome back to your intentional space" 
                : view === "register" 
                ? "Join the Kairi family" 
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {view === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-espresso/70">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aayushi Das"
                  className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-espresso/70">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@home.com"
                className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
              />
            </div>

            {view !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-wider text-espresso/70">Password</label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-clay hover:underline focus:outline-none"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-clay py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-linen transition-colors hover:bg-espresso focus:outline-none disabled:opacity-50"
            >
              {loading ? "Please wait..." : view === "login" ? "Sign In" : view === "register" ? "Register" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-taupe">
            {view === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setView("register")}
                  className="font-medium text-clay hover:underline focus:outline-none"
                >
                  Create one
                </button>
              </>
            ) : view === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setView("login")}
                  className="font-medium text-clay hover:underline focus:outline-none"
                >
                  Sign in
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-medium text-clay hover:underline focus:outline-none"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

