import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const AdminLogin = ({ onLogin, error, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/images/login-bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Glassmorphism Card */}
      <div
        className="relative z-10 w-full mx-6 sm:mx-0 sm:w-[400px] p-8 sm:p-10 rounded-2xl sm:rounded-3xl animate-slide-up"
        style={{
          backgroundColor: 'hsla(0, 0%, 10%, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <h1
          className="text-center text-white text-2xl sm:text-[1.75rem] font-medium mb-8"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          Staff Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Email Field */}
          <div className="flex items-center gap-3 border-b-2 border-white/80 pb-1">
            <User className="w-5 h-5 text-white shrink-0" />
            <div className="relative flex-1">
              <input
                type="email"
                id="login-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent text-white py-2.5 outline-none text-[0.95rem] peer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                disabled={isLoading}
              />
              <label
                htmlFor="login-email"
                className="absolute left-0 top-2.5 text-white/80 font-medium transition-all duration-300 pointer-events-none peer-focus:top-[-18px] peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-[-18px] peer-[:not(:placeholder-shown)]:text-xs"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
              >
                Email
              </label>
            </div>
          </div>

          {/* Password Field */}
          <div className="flex items-center gap-3 border-b-2 border-white/80 pb-1">
            <Lock className="w-5 h-5 text-white shrink-0" />
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-pass"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent text-white py-2.5 pr-8 outline-none text-[0.95rem] peer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                disabled={isLoading}
              />
              <label
                htmlFor="login-pass"
                className="absolute left-0 top-2.5 text-white/80 font-medium transition-all duration-300 pointer-events-none peer-focus:top-[-18px] peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-[-18px] peer-[:not(:placeholder-shown)]:text-xs"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2.5 text-white/70 hover:text-white transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-center">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-lg bg-white text-brand-900 font-medium text-[0.95rem] hover:bg-white/90 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Secure access only. Unauthorized use is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
