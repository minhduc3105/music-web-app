import { useState } from "react";
import { supabase } from "../supabase";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("Login successful:", user);
      navigate("/dashboard"); // Chuyển hướng đến trang chính sau khi đăng nhập
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="label-login login-email">Email</label>
            <input
              type="email"
              className="input-email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="label-login login-password">Password</label>
            <input
              type="password"
              className="input-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bt-login">
            Log In
          </button>
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="bt-signup">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
