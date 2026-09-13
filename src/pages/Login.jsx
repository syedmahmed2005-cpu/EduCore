import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(role) {
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/demo-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Demo login failed"
      );
    }

    setUser(data.user);
    navigate("/dashboard");
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-background px-4 py-10 transition-colors duration-200">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-200/60 blur-3xl dark:bg-green-900/20"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-900/20"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-md">
            <span className="text-3xl">🎓</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-green-900 dark:text-green-300">
            EduCore
          </h1>

          <p className="mt-2 text-app-text-muted">
            Sign in to access your account
          </p>
        </div>

        <div className="rounded-3xl border border-app-border bg-app-surface/90 p-8 shadow-xl shadow-green-950/10 backdrop-blur-xl dark:shadow-black/30">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-app-text">
              Welcome Back
            </h2>

            <p className="mt-1 text-app-text-muted">
              Please enter your credentials to continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="mb-2 block font-semibold text-app-text">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-app-border bg-app-surface-soft px-4 py-3 text-app-text placeholder:text-app-text-muted"
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-semibold text-app-text">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-app-border bg-app-surface-soft px-4 py-3 text-app-text placeholder:text-app-text-muted"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 hover:shadow-lg hover:shadow-green-900/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3">
  <div className="h-px flex-1 bg-app-border" />

  <span className="text-xs font-semibold uppercase tracking-wider text-app-text-muted">
    Demo Access
  </span>

  <div className="h-px flex-1 bg-app-border" />
</div>

<p className="mb-4 text-center text-sm text-app-text-muted">
  Explore EduCore instantly using sample data.
</p>

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  <button
    type="button"
    onClick={() => handleDemoLogin("student")}
    disabled={loading}
    className="rounded-xl border border-green-600 bg-green-50 px-4 py-3 font-semibold text-green-700 transition hover:bg-green-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/70"
  >
    Student Demo
  </button>

  <button
    type="button"
    onClick={() => handleDemoLogin("faculty")}
    disabled={loading}
    className="rounded-xl border border-green-600 bg-green-50 px-4 py-3 font-semibold text-green-700 transition hover:bg-green-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/70"
  >
    Faculty Demo
  </button>
</div>

<p className="mt-3 text-center text-xs text-app-text-muted">
  Demo accounts provide read-only access.
</p>
        </div>

        <p className="mt-6 text-center text-sm text-app-text-muted">
          Secure access for students, faculty, and
          administrators.
        </p>
      </div>
    </main>
  );
}

export default Login;