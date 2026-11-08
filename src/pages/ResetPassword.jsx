import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard, {
  Alert,
  buttonClass,
  inputClass,
} from "../components/AuthCard.jsx";

const MIN_PASSWORD_LENGTH = 6;

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters`
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not reset password");
      }

      setSuccess(data.message);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const backToLogin = (
    <Link
      to="/login"
      className="font-semibold text-green-700 hover:underline dark:text-green-400"
    >
      ← Back to sign in
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Reset Password" footer={backToLogin}>
        <Alert type="error">
          This reset link is missing its token. Please use the link from your
          email, or{" "}
          <Link to="/forgot-password" className="font-semibold underline">
            request a new one
          </Link>
          .
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Choose a new password for your account."
      footer={backToLogin}
    >
      {error && (
        <Alert type="error">
          {error}{" "}
          {error.includes("expired") && (
            <Link to="/forgot-password" className="font-semibold underline">
              Request a new link
            </Link>
          )}
        </Alert>
      )}

      {success ? (
        <Alert type="success">
          {success} Redirecting you to sign in...
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="new-password"
              className="mb-2 block font-semibold text-app-text"
            >
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={inputClass}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirm-password"
              className="mb-2 block font-semibold text-app-text"
            >
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ResetPassword;
