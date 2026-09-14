"use client"

import { useState } from 'react'
import { login, signup } from './actions'
import { LogoMark } from '@/components/FigmaApp'

// --- SVG Icons ---
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

export default function LoginRoute() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', pass)

    const res = isRegister ? await signup(formData) : await login(formData)

    if (res && 'error' in res && res.error) {
      setError(res.error)
    } else if (res && 'message' in res && res.message) {
      setSuccess(res.message)
      setIsRegister(false)
    }
    setLoading(false)
  }

  const handleDemo = () => {
    setEmail('admin@archos.demo')
    setPass('password123')
    setTimeout(() => {
      const formData = new FormData()
      formData.append('email', 'admin@archos.demo')
      formData.append('password', 'admin@123')
      login(formData).then(res => {
        if (res?.error) {
          setError(res.error)
          setLoading(false)
        }
      })
    }, 100)
  }

  return (
    <div className="flex bg-white fixed inset-0 overflow-hidden" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="w-full md:w-[50%]  shrink-0 flex flex-col px-8 lg:px-16 py-12 overflow-y-auto justify-center">

        <div className="w-full max-w-[380px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="text-[#B07245]"><LogoMark size={24} /></div>
            <span className="text-[18px] font-bold text-[#111] tracking-wide">ARCHOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#111] leading-tight mb-2 tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-[15px] text-[#71717A]">
              {isRegister ? 'Enter your details to get started' : 'Sign in to your workspace'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-[13px]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md text-green-700 text-[13px]">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-[#111] block mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-[#E4E4E7] rounded-md bg-white pl-10 pr-3.5 py-2.5 text-[14px] text-[#111] focus:outline-none focus:border-[#B07245] focus:ring-1 focus:ring-[#B07245] transition-all"
                  placeholder="you@studio.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#111] block mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  className="w-full border border-[#E4E4E7] rounded-md bg-white pl-10 pr-10 py-2.5 text-[14px] text-[#111] focus:outline-none focus:border-[#B07245] focus:ring-1 focus:ring-[#B07245] transition-all"
                  placeholder="Your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-[#71717A] hover:text-[#111]">
                  <EyeIcon />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111] text-white py-3 rounded-md text-[14px] font-medium hover:bg-[#27272A] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create account' : 'Continue')}
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[14px] font-medium text-[#111] hover:text-[#B07245] underline transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="my-6 flex items-center justify-center relative">
            <div className="w-full border-t border-[#E4E4E7]"></div>
            <div className="absolute bg-white px-3 text-[11px] font-medium text-[#A1A1AA]">OR</div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full bg-white border border-[#E4E4E7] text-[#111] py-3 rounded-md text-[14px] font-medium hover:bg-[#F4F4F5] transition-colors flex items-center justify-center gap-2"
          >
            Use demo account
            <ArrowRightIcon />
          </button>
        </div>

      </div>

      {/* Right panel (takes remaining 45%) */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-[#EAE8E3]">
        {/* Architectural background photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 mix-blend-multiply"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop')",
          }} 
        />

        {/* Soft atmospheric gradient wash for contrast */}
        {/* NEW: Left-to-right fade only behind the text; bottom remains completely clear */}
<div className="absolute inset-0 bg-gradient-to-r from-[#EAE8E3] via-[#EAE8E3]/40 to-transparent pointer-events-none" />

        {/* Content area */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12 lg:p-16">
          {/* Top aesthetic pill / status indicator */}
          <div className="flex items-center gap-2">
            
          </div>

          {/* Core typographic block */}
          <div className="max-w-[460px]">
            {/* Terracotta line & micro-accent */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-[#B07245]" />
            </div>

            {/* Stylized headline */}
            <h2 className="text-[44px] lg:text-[50px] font-serif font-light text-[#111] leading-[1.08] tracking-tight mb-5">
              Design spaces. <br />
              <span className="italic font-normal text-[#B07245]">Build better.</span>
            </h2>


            <p className="text-[15px] font-normal text-[#444] leading-relaxed max-w-[380px]">
              A modular SaaS ecosystem tailored for architecture studios, interior designers, and bespoke construction teams.
            </p>
          </div>

          
        </div>
      </div>
    </div>
  )
}