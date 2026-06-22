'use client'

import { useState } from 'react'
import { login } from './actions'
import { Input } from '@/components/ui/input'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await login(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl bg-gradient-to-r from-[#96B2B2] to-[#6391AB]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl bg-[#024C27]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-[380px] mx-4"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#96B2B2] to-[#6391AB] flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-[20px] font-semibold text-white tracking-tight">Carisma CRM</h1>
              <p className="text-[13px] text-white/40 mt-0.5">Sign in to your agent account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <Input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="pl-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:ring-white/10 rounded-xl h-11"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="pl-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:ring-white/10 rounded-xl h-11"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full h-11 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 mt-1',
                'bg-gradient-to-r from-[#96B2B2] to-[#6391AB] text-white shadow-lg',
                'hover:shadow-[#96B2B2]/25 transition-shadow',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="text-[13px]">Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
