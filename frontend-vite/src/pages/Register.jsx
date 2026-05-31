import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });

      setIsLoading(false);
      alert("Registration successful! Please sign in.");
      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      alert(error.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="absolute top-24 left-16 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-16 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[35px] shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 relative z-10">
        <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 p-8 text-center relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%)]" />
          <h2 className="text-3xl font-black uppercase tracking-widest mb-2 relative z-10">
            Create Account
          </h2>
          <p className="text-gray-300 relative z-10">Join Vellora today</p>
        </div>

        <form onSubmit={registerHandler} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-2xl focus:border-cyan-400 transition outline-none bg-white/10 text-white placeholder-gray-500 backdrop-blur-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-2xl focus:border-cyan-400 transition outline-none bg-white/10 text-white placeholder-gray-500 backdrop-blur-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="********"
                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-2xl focus:border-cyan-400 transition outline-none bg-white/10 text-white placeholder-gray-500 backdrop-blur-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm tracking-widest uppercase py-4 px-4 rounded-2xl transition duration-300 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/20 hover:scale-105"
          >
            {isLoading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
