'use client'

import { useState } from 'react'
import { login } from './actions'
import { Input } from '@/components/ui/input'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #024C27 0%, #124E59 45%, #6391AB 100%)',
      }}
    >
      {/* Subtle dot texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(201,216,193,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.06,
        }}
      />

      {/* Floating glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 300,
          background: 'radial-gradient(ellipse, rgba(201,216,193,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-[400px] mx-4"
      >
        {/* Glass card */}
        <div
          className="rounded-3xl p-8 space-y-7"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 24px 64px rgba(2,76,39,0.3), inset 0 1px 0 rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #557b5b 0%, #024C27 100%)' }}
            >
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div className="text-center space-y-1">
              <h1
                className="text-[16px] tracking-[3px]"
                style={{
                  fontFamily: "'Trajan Pro', Georgia, serif",
                  color: '#024C27',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Carisma CRM
              </h1>
              {/* Thin sage divider */}
              <div className="mx-auto my-2" style={{ width: 48, height: 1, background: '#C9D8C1' }} />
              <p
                className="text-[11px] uppercase tracking-[2px]"
                style={{ fontFamily: "'Novecento Wide', sans-serif", color: '#6f6456' }}
              >
                Agent Sign In
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: '#8eb093' }}
              />
              <Input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="pl-10 h-11 text-[13px] rounded-xl"
                style={{
                  background: '#f7f9f6',
                  border: '1px solid rgba(40,55,44,0.18)',
                  color: '#333333',
                }}
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: '#8eb093' }}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="pl-10 h-11 text-[13px] rounded-xl"
                style={{
                  background: '#f7f9f6',
                  border: '1px solid rgba(40,55,44,0.18)',
                  color: '#333333',
                }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-center"
                style={{ color: '#c0392b' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              className="cta-glow w-full h-11 text-[12px] font-bold gap-2 mt-1"
              style={{
                fontFamily: "'Novecento Wide', sans-serif",
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Tagline below card */}
        <p
          className="text-center mt-5 text-[11px] opacity-60 tracking-[1.5px] uppercase"
          style={{ fontFamily: "'Novecento Wide', sans-serif", color: '#C9D8C1' }}
        >
          Carisma Wellness Group
        </p>
      </motion.div>
    </div>
  )
}
