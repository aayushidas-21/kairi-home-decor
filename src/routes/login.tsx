import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
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

function LoginComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else {
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
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An authentication error occurred.");
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
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="mt-2 text-sm text-taupe">
              {isLogin ? "Welcome back to your intentional space" : "Join the Kairi family"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
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

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-espresso/70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-clay py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-linen transition-colors hover:bg-espresso focus:outline-none disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-taupe">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-clay hover:underline focus:outline-none"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-clay hover:underline focus:outline-none"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
