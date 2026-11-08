import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard, {
  Alert,
  buttonClass,
  inputClass,
} from "../components/AuthCard.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send reset link");
      }

      setMessage(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your account email and we'll send you a link to reset your password."
      footer={
        <Link
          to="/login"
          className="font-semibold text-green-700 hover:underline dark:text-green-400"
        >
          ← Back to sign in
        </Link>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      {message ? (
        <Alert type="success">
          {message} The link expires in 15 minutes. Check your spam folder if
          you don't see it.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="forgot-email"
              className="mb-2 block font-semibold text-app-text"
            >
              Email Address
            </label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className={inputClass}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ForgotPassword;
