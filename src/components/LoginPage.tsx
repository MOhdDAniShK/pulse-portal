import { motion } from 'framer-motion';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#00BFA6]/10 to-[#00897B]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#2F80ED]/10 to-[#9B51E0]/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[#F2994A]/8 to-[#EB5757]/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00BFA6] to-[#00897B] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00BFA6]/20"
          >
            <span className="text-white font-black text-2xl">R</span>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-[#1E1E2D]">Welcome to RateMyStuff</h1>
          <p className="text-sm text-[#7B8190] mt-2">Rate anything — products, players, tools & more</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-xl shadow-black/5 p-6">
          <p className="text-xs font-bold text-[#B0B7C3] uppercase tracking-wider mb-5 text-center">Sign in to continue</p>

          {/* Google Sign-In Button */}
          <a
            href="/auth/google"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-[#E8ECF0] bg-white hover:bg-[#F4F5F7] hover:border-[#00BFA6]/30 hover:shadow-md hover:shadow-[#00BFA6]/5 transition-all duration-300 group cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-bold text-[#1E1E2D] group-hover:text-[#00BFA6] transition-colors">Continue with Google</span>
          </a>

          {/* Features section */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2.5 text-[11px] text-[#7B8190]">
              <span className="w-5 h-5 rounded-full bg-[#00BFA6]/10 flex items-center justify-center text-[#00BFA6] text-[10px] flex-shrink-0">✓</span>
              <span>Rate & review products, tools, and more</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#7B8190]">
              <span className="w-5 h-5 rounded-full bg-[#00BFA6]/10 flex items-center justify-center text-[#00BFA6] text-[10px] flex-shrink-0">✓</span>
              <span>Submit your own listings to the community</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#7B8190]">
              <span className="w-5 h-5 rounded-full bg-[#00BFA6]/10 flex items-center justify-center text-[#00BFA6] text-[10px] flex-shrink-0">✓</span>
              <span>Track analytics and discover trending items</span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E8ECF0]" />
            <span className="text-[10px] font-bold text-[#B0B7C3] uppercase">secure sign-in</span>
            <div className="flex-1 h-px bg-[#E8ECF0]" />
          </div>

          {/* Security info */}
          <div className="bg-[#F4F5F7] rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-xs font-bold text-[#1E1E2D]">Secure & Private</p>
                <p className="text-[10px] text-[#7B8190] mt-0.5 leading-relaxed">
                  We use Google OAuth for secure authentication. We never store your password and only access your public profile info.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#B0B7C3] mt-6">
          © 2026 RateMyStuff. Built with ❤️ by the community.
        </p>
      </motion.div>
    </div>
  );
}
