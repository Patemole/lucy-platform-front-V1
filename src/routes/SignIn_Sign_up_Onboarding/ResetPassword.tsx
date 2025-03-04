import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../auth/firebase";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import lucyLogo from "../../logo_lucy.png";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset email has been sent to your inbox.");
    } catch (error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === "auth/user-not-found") {
          setError("No account found with this email.");
        } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <div className="absolute top-4 left-4">
        <img src={theme.logo} alt="University Logo" className="h-12" />
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-10 mx-4">
        <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleResetPassword} noValidate>
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {message && <p className="text-xs text-green-600 mb-4">{message}</p>}
          {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 mt-4 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:ring focus:ring-blue-300 ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <CircularProgress size={20} color="inherit" />
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="mt-4 text-xs text-center text-gray-600">
            <a href="/auth/sign-in" className="text-blue-600 hover:underline">
              Back to Sign In
            </a>
          </p>

          <div className="mt-8 flex items-center justify-center">
            <p className="text-xs text-gray-400 mr-2">Powered by Lucy</p>
            <Avatar src={lucyLogo} alt="Lucy Logo" sx={{ width: 20, height: 20 }} />
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
