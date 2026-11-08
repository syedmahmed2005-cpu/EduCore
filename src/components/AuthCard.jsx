// Shared layout for the public auth pages (forgot / reset password),
// matching the look of the Login page.
function AuthCard({ title, subtitle, children, footer }) {
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
        </div>

        <div className="rounded-3xl border border-app-border bg-app-surface/90 p-8 shadow-xl shadow-green-950/10 backdrop-blur-xl dark:shadow-black/30">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-app-text">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-app-text-muted">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-app-text-muted">
            {footer}
          </p>
        )}
      </div>
    </main>
  );
}

export const inputClass =
  "w-full rounded-xl border border-app-border bg-app-surface-soft px-4 py-3 text-app-text placeholder:text-app-text-muted";

export const buttonClass =
  "w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 hover:shadow-lg hover:shadow-green-900/15 disabled:cursor-not-allowed disabled:opacity-60";

export function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";

  return (
    <div role="alert" className={`mb-5 rounded-lg border px-4 py-3 ${styles}`}>
      {children}
    </div>
  );
}

export default AuthCard;
