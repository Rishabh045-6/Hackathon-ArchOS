"use client";
import { useState, useEffect, useRef } from 'react'
import { submitWon, submitExpense } from '@/app/figma-actions'
import AddExpenseForm from './accounts/AddExpenseForm'

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type AppState = 'login' | 'app'

type Screen =
  | 'dashboard'
  | 'crm'
  | 'crm-detail'
  | 'projects'
  | 'project-detail'
  | 'accounts'
  | 'activity'
  | 'applications'
  | 'contacts'
  | 'files'
  | 'notifications'
  | 'users'
  | 'settings'

type OrgId = 'acme' | 'small'
type AppLabel = 'CRM' | 'Projects' | 'Accounts'
type StatusLabel =
  | 'Planning' | 'Active' | 'Won' | 'Proposal' | 'Qualification'
  | 'Negotiation' | 'Enabled' | 'Coming Soon' | 'Completed' | 'On Hold'

interface Expense {
  id: string | number
  description: string
  category: string
  project: string | { name: string }
  projectId?: string
  amount: number
}

interface Notification {
  id: number
  title: string
  detail: string
  app: AppLabel
  time: string
  read: boolean
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & DATA
═══════════════════════════════════════════════════════════════ */
const ORGS: Record<OrgId, { name: string; apps: string[]; initials: string }> = {
  acme: { name: 'Acme Design Studio', apps: ['CRM', 'Projects', 'Accounts'], initials: 'AD' },
  small: { name: 'Small Studio', apps: ['Projects'], initials: 'SS' },
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 1, description: 'Italian Marble Tiles', category: 'Material', project: 'Luxury Villa', amount: 120000 },
  { id: 2, description: 'Teak Wood Panels', category: 'Material', project: 'Luxury Villa', amount: 80000 },
  { id: 3, description: 'Site Transport', category: 'Transport', project: 'Luxury Villa', amount: 15000 },
]

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, title: 'Opportunity marked as Won', detail: 'Luxury Villa · ABC Interiors', app: 'CRM', time: '09:42', read: false },
  { id: 2, title: 'Project created automatically', detail: 'Luxury Villa', app: 'Projects', time: '10:03', read: false },
  { id: 3, title: 'Architect assigned to project', detail: 'Ananya — Luxury Villa', app: 'Projects', time: '10:15', read: true },
  { id: 4, title: 'Expense added', detail: 'Italian Marble Tiles — ₹1,20,000', app: 'Accounts', time: '11:24', read: true },
]

const APP_COLORS: Record<AppLabel, { bg: string; text: string; dot: string; border: string }> = {
  CRM:      { bg: '#F5EDE5', text: '#9C5F30', dot: '#B07245', border: '#E8D0BB' },
  Projects: { bg: '#E4EFF2', text: '#2E5F70', dot: '#3D7A8A', border: '#C0DAE2' },
  Accounts: { bg: '#EAECF0', text: '#404A5E', dot: '#4A5568', border: '#C8CDD8' },
}

const STATUS_STYLES: Record<StatusLabel, { bg: string; text: string }> = {
  Planning:      { bg: '#FBF0DF', text: '#8C6010' },
  Active:        { bg: '#E6F2EB', text: '#2E6A42' },
  Won:           { bg: '#E6F2EB', text: '#2E6A42' },
  Proposal:      { bg: '#F5EDE5', text: '#9C5F30' },
  Qualification: { bg: '#EAECF0', text: '#404A5E' },
  Negotiation:   { bg: '#E4EFF2', text: '#2E5F70' },
  Enabled:       { bg: '#E6F2EB', text: '#2E6A42' },
  'Coming Soon': { bg: '#F2F2F0', text: '#9E9A95' },
  Completed:     { bg: '#E6F2EB', text: '#2E6A42' },
  'On Hold':     { bg: '#F2EDE8', text: '#8A6040' },
}

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

/* ═══════════════════════════════════════════════════════════════
   SVG PRIMITIVES
═══════════════════════════════════════════════════════════════ */
export function LogoMark({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 20 20" fill="none">
      <rect x="0.75" y="0.75" width="18.5" height="18.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="0.75" y="0.75" width="9.25" height="9.25" fill="currentColor" />
      <line x1="0.75" y1="10" x2="19.25" y2="10" stroke="currentColor" strokeWidth="1" />
      <line x1="10" y1="0.75" x2="10" y2="19.25" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

const IcoOverview = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/></svg>
const IcoCRM = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 8.5l1 1.5 2.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoProjects = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="5" x2="4" y2="13" stroke="currentColor" strokeWidth="1"/></svg>
const IcoAccounts = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><line x1="1" y1="6.5" x2="13" y2="6.5" stroke="currentColor" strokeWidth="1"/><line x1="4.5" y1="6.5" x2="4.5" y2="11" stroke="currentColor" strokeWidth="1"/></svg>
const IcoContacts = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoFiles = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="8" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v3.5H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M12 4.5V13H2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="4" y1="8.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
const IcoActivity = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><polyline points="5,4 7,7 9,6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoBell = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2a3.5 3.5 0 0 1 3.5 3.5v1.5l1 2H2.5l1-2V5.5A3.5 3.5 0 0 1 7 2Z" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 11.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoUsers = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="9.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2 1.8-3.5 4-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M7 12c0-2 1.8-3.5 4-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoSettings = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.3 3.3l.7.7M10 10l.7.7M3.3 10.7l.7-.7M10 4l.7-.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoChevronDown = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoChevronRight = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoCheck = () => <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5L7.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoMenu = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IcoX = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const IcoTrendUp = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 9l3.5-3.5L7 8l4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 3H11v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IcoMinus = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>

/* ═══════════════════════════════════════════════════════════════
   UI PRIMITIVES
═══════════════════════════════════════════════════════════════ */
function AppBadge({ app }: { app: AppLabel }) {
  const c = APP_COLORS[app]
  return (
    <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm"
      style={{ background: c.bg, color: c.text }}>
      {app}
    </span>
  )
}

function StatusBadge({ label }: { label: StatusLabel }) {
  const s = STATUS_STYLES[label]
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-sm"
      style={{ background: s.bg, color: s.text }}>
      {label}
    </span>
  )
}

function KPICard({ label, value, trend, trendLabel }: {
  label: string; value: string; trend?: 'up' | 'flat'; trendLabel?: string
}) {
  return (
    <div className="bg-white border border-[#E5E1D9] p-5 flex flex-col gap-3">
      <div className="text-[10px] font-semibold text-[#9E9A95] tracking-widest uppercase">{label}</div>
      <div className="text-[26px] font-semibold text-[#1A1918] leading-none tracking-tight" style={{ fontFamily: "'DM Mono', monospace" }}>
        {value}
      </div>
      {trendLabel && (
        <div className={`flex items-center gap-1 text-[11px] font-medium ${trend === 'up' ? 'text-[#2E6A42]' : 'text-[#9E9A95]'}`}>
          {trend === 'up' ? <IcoTrendUp /> : <IcoMinus />}
          {trendLabel}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest">{children}</h2>
      {right}
    </div>
  )
}

function PageHeader({ eyebrow, title, subtitle, action }: {
  eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        {eyebrow && (
          <div className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#B07245' }}>
            {eyebrow}
          </div>
        )}
        <h1 className="text-[28px] font-medium text-[#1A1918] leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {title}
        </h1>
        {subtitle && <p className="text-[14px] text-[#9E9A95] mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function Breadcrumb({ items, onNavigate }: {
  items: { label: string; target?: Screen }[]
  onNavigate: (s: Screen) => void
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[#B0ABA5] mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <IcoChevronRight />}
          {item.target ? (
            <button onClick={() => onNavigate(item.target!)} className="hover:text-[#706B65] transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-[#706B65]">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-9 h-5 rounded-full relative transition-colors duration-150"
      style={{ background: on ? '#1A1918' : '#D5D0CA' }}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-150 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@acmedesign.studio')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 900)
  }

  const handleDemo = () => {
    setEmail('admin@acmedesign.studio')
    setPass('••••••••')
    setTimeout(handleLogin, 300)
  }

  return (
    <div className="h-full flex" style={{ background: '#F5F3EF', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="flex-1 flex items-center justify-center px-12">
        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="text-[#B07245]"><LogoMark size={24} /></div>
            <span className="text-[18px] font-semibold text-[#1A1918] tracking-[0.06em]">ARCHOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-medium text-[#1A1918] leading-tight mb-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Welcome back
            </h1>
            <p className="text-[14px] text-[#9E9A95]">Sign in to your workspace</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#E5E1D9] bg-white px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245] transition-colors"
                placeholder="you@studio.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">Password</label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full border border-[#E5E1D9] bg-white px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245] transition-colors"
                placeholder="Your password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 text-[13px] font-semibold text-white transition-colors mb-4"
            style={{ background: loading ? '#C89070' : '#B07245' }}
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>

          <div className="text-center">
            <button onClick={handleDemo} className="text-[12px] text-[#B07245] hover:text-[#965E35] transition-colors">
              Demo: sign in as Acme Design Studio admin →
            </button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex w-[440px] flex-col border-l border-[#E5E1D9]" style={{ background: '#131211' }}>
        <div className="flex-1 flex flex-col justify-center px-10">
          <div className="text-[#403D3A] text-[10px] font-semibold tracking-widest uppercase mb-8">Your workspaces</div>
          {[
            { name: 'Acme Design Studio', apps: 'CRM · Projects · Accounts', initials: 'AD', active: true },
            { name: 'Small Studio', apps: 'Projects', initials: 'SS', active: false },
          ].map(org => (
            <div key={org.name}
              className={`flex items-center gap-4 p-4 mb-2 border transition-colors ${org.active ? 'border-[#B07245]/40 bg-white/5' : 'border-[#252220] hover:bg-white/5'}`}
            >
              <div className="w-9 h-9 flex items-center justify-center text-[12px] font-semibold shrink-0"
                style={{ background: org.active ? '#B07245' : '#252220', color: org.active ? '#fff' : '#706B65' }}>
                {org.initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#C8C4BE]">{org.name}</div>
                <div className="text-[11px] text-[#4A4540] mt-0.5">{org.apps}</div>
              </div>
              {org.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B07245]" />}
            </div>
          ))}
        </div>
        <div className="px-10 py-6 border-t border-[#252220]">
          <p className="text-[11px] text-[#4A4540] leading-relaxed">
            ARCHOS gives your team a single workspace with modular applications. Each app works independently or together.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION PANEL
═══════════════════════════════════════════════════════════════ */
function NotifPanel({
  notifs, onClose, onReadAll, onNavigate
}: {
  notifs: Notification[]
  onClose: () => void
  onReadAll: () => void
  onNavigate: (s: Screen) => void
}) {
  const unread = notifs.filter(n => !n.read).length
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute top-0 right-0 h-full w-[360px] bg-white border-l border-[#E5E1D9] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2EFE9]">
          <div>
            <div className="text-[14px] font-semibold text-[#1A1918]">Notifications</div>
            {unread > 0 && <div className="text-[11px] text-[#9E9A95] mt-0.5">{unread} unread</div>}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={onReadAll} className="text-[11px] text-[#B07245] hover:text-[#965E35] transition-colors">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-[#9E9A95] hover:text-[#1A1918] transition-colors"><IcoX /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="text-[#D5D0CA] mb-3">
                <IcoBell />
              </div>
              <div className="text-[13px] text-[#B0ABA5]">No notifications yet</div>
            </div>
          ) : (
            notifs.map((n) => (
              <div key={n.id}
                className={`flex gap-3 px-5 py-4 border-b border-[#F7F5F0] hover:bg-[#FAFAF8] transition-colors cursor-pointer ${!n.read ? 'bg-[#FDF8F4]' : ''}`}>
                <div className="shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full mt-1" style={{ background: !n.read ? APP_COLORS[n.app].dot : '#E5E1D9' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#1A1918]">{n.title}</div>
                  <div className="text-[12px] text-[#9E9A95] mt-0.5 truncate">{n.detail}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <AppBadge app={n.app} />
                    <span className="text-[11px] text-[#C8C0B5] font-mono">{n.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F2EFE9]">
          <button onClick={() => { onNavigate('notifications'); onClose() }}
            className="text-[12px] font-medium text-[#B07245] hover:text-[#965E35] transition-colors flex items-center gap-1">
            View all notifications <IcoChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
function Sidebar({ screen, org, open, onNavigate, onOrgClick, onClose, user }: {
  screen: Screen; org: OrgId; open: boolean; user?: any;
  onNavigate: (s: Screen) => void
  onOrgClick: () => void
  onClose: () => void
}) {
  const hasApp = (app: string) => ORGS[org].apps.includes(app)

  const NavItem = ({ label, icon, target }: { label: string; icon: React.ReactNode; target: Screen }) => {
    const active = screen === target
    return (
      <button onClick={() => { onNavigate(target); onClose() }}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] rounded-sm transition-all duration-100 text-left ${active
          ? 'bg-white/12 text-white'
          : 'text-[#6A6460] hover:text-[#C0BBB5] hover:bg-white/5'}`}>
        <span className={active ? 'text-white' : 'text-[#4A4540]'}>{icon}</span>
        {label}
        {active && <div className="ml-auto w-1 h-1 rounded-full bg-[#B07245]" />}
      </button>
    )
  }

  const NavGroup = ({ label }: { label: string }) => (
    <div className="pt-4 pb-1 px-3">
      <span className="text-[9px] font-semibold tracking-[0.14em] text-[#38352F] uppercase">{label}</span>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <div className={`${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative z-30 w-[218px] min-w-[218px] bg-[#131211] flex flex-col h-full border-r border-[#242220] transition-transform duration-200`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[17px] border-b border-[#242220]">
          <div className="text-[#B07245]"><LogoMark /></div>
          <span className="text-[15px] font-semibold text-white tracking-[0.07em]">ARCHOS</span>
          <button onClick={onClose} className="ml-auto text-[#4A4540] hover:text-[#9E9A95] lg:hidden"><IcoX /></button>
        </div>

        {/* Org switcher */}
        <button onClick={onOrgClick}
          className="flex items-center justify-between px-4 py-3 text-left border-b border-[#242220] hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-[#B07245] shrink-0"
              style={{ background: '#2A2420', border: '1px solid #3A3028' }}>
              {ORGS[org].initials}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-[#C0BBB5] truncate leading-tight">{ORGS[org].name}</div>
              <div className="text-[10px] text-[#4A4540] truncate">{ORGS[org].apps.join(' · ')}</div>
            </div>
          </div>
          <span className="text-[#4A4540] group-hover:text-[#6A6460] shrink-0 ml-1"><IcoChevronDown /></span>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          <NavItem label="Overview" icon={<IcoOverview />} target="dashboard" />

          <NavGroup label="Applications" />
          {hasApp('CRM') && <NavItem label="CRM" icon={<IcoCRM />} target="crm" />}
          {hasApp('Projects') && <NavItem label="Projects" icon={<IcoProjects />} target="projects" />}
          {hasApp('Accounts') && <NavItem label="Accounts" icon={<IcoAccounts />} target="accounts" />}

          <NavGroup label="Platform" />
          <NavItem label="Contacts" icon={<IcoContacts />} target="contacts" />
          <NavItem label="Files" icon={<IcoFiles />} target="files" />
          <NavItem label="Activity" icon={<IcoActivity />} target="activity" />
          <NavItem label="Notifications" icon={<IcoBell />} target="notifications" />

          <NavGroup label="Admin" />
          <NavItem label="Applications" icon={<IcoOverview />} target="applications" />
          <NavItem label="Users" icon={<IcoUsers />} target="users" />
          <NavItem label="Settings" icon={<IcoSettings />} target="settings" />
        </nav>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-[#242220] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[#9E9A95] truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-[#4A4540] truncate">{user?.email || ''}</div>
          </div>
          <a href="/auth/logout" className="text-[#9E9A95] hover:text-[#B07245] transition-colors ml-auto" title="Log out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TOP BAR
═══════════════════════════════════════════════════════════════ */
function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: {
  org: OrgId; unreadCount: number; user?: any;
  onOrgClick: () => void; onNotifClick: () => void; onMenuClick: () => void
}) {
  return (
    <div className="h-11 border-b border-[#E5E1D9] bg-white flex items-center justify-between px-4 lg:px-6 shrink-0">
      <button onClick={onMenuClick} className="text-[#9E9A95] hover:text-[#1A1918] transition-colors lg:hidden mr-3">
        <IcoMenu />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 lg:gap-4">
        <button onClick={onOrgClick}
          className="flex items-center gap-1.5 text-[12px] text-[#9E9A95] hover:text-[#1A1918] transition-colors">
          <span className="hidden sm:inline">{ORGS[org].name}</span>
          <IcoChevronDown />
        </button>
        <button onClick={onNotifClick}
          className="relative w-7 h-7 flex items-center justify-center text-[#9E9A95] hover:text-[#1A1918] hover:bg-[#F5F3EF] rounded-sm transition-colors">
          <IcoBell />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#B07245]" />
          )}
        </button>
        <div className="relative group">
          <button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </button>
          <div className="absolute right-0 top-full pt-1 w-36 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
            <div className="bg-white border border-[#E5E1D9] shadow-lg">
              <div className="px-3 py-2 border-b border-[#F0EDE6]">
                <div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || 'User'}</div>
                <div className="text-[10px] text-[#9E9A95]">{user?.email || ''}</div>
              </div>
              <a href="/auth/logout" className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#5A5A5A] hover:bg-[#F5F3EF] hover:text-[#B07245] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log out
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ORG SWITCHER MODAL
═══════════════════════════════════════════════════════════════ */
function OrgSwitcher({ current, onSelect, onClose }: {
  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-white border border-[#E5E1D9] shadow-2xl w-[380px]" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#F2EFE9]">
          <div className="text-[10px] font-semibold text-[#B0ABA5] uppercase tracking-widest">Switch Organization</div>
        </div>
        {[
          { id: 'acme' as OrgId, name: 'Acme Design Studio', apps: 'CRM · Projects · Accounts', tier: 'Full Suite', note: '3 applications enabled' },
          { id: 'small' as OrgId, name: 'Small Studio', apps: 'Projects', tier: 'Starter', note: '1 application enabled' },
        ].map(org => (
          <button key={org.id}
            onClick={() => { onSelect(org.id); onClose() }}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left border-b border-[#F2EFE9] last:border-0 hover:bg-[#FAFAF8] transition-colors ${current === org.id ? 'bg-[#FAFAF8]' : ''}`}>
            <div className="w-9 h-9 flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: current === org.id ? '#B07245' : '#F5F3EF', color: current === org.id ? '#fff' : '#9E9A95', border: '1px solid', borderColor: current === org.id ? '#B07245' : '#E5E1D9' }}>
              {ORGS[org.id].initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#1A1918]">{org.name}</span>
                {current === org.id && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="#2E6A42" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="text-[12px] text-[#B0ABA5] mt-0.5">{org.apps}</div>
              <div className="text-[10px] text-[#C8C0B5] mt-0.5">{org.note}</div>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 shrink-0"
              style={{ background: current === org.id ? '#E6F2EB' : '#F2F2F0', color: current === org.id ? '#2E6A42' : '#9E9A95' }}>
              {org.tier}
            </span>
          </button>
        ))}
        <div className="px-5 py-3 border-t border-[#F2EFE9]">
          <p className="text-[11px] text-[#C8C0B5]">Switching organizations changes your available applications and data.</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: DASHBOARD
═══════════════════════════════════════════════════════════════ */
const GLOBAL_ACTIVITY_ITEMS = [
  { time: '09:42', title: 'Opportunity marked as Won', detail: 'Luxury Villa', app: 'CRM' as AppLabel },
  { time: '10:03', title: 'Project created automatically', detail: 'Luxury Villa', app: 'Projects' as AppLabel },
  { time: '10:15', title: 'Architect assigned to project', detail: 'Ananya — Luxury Villa', app: 'Projects' as AppLabel },
  { time: '11:24', title: 'Expense added', detail: 'Italian Marble Tiles — ₹1,20,000', app: 'Accounts' as AppLabel },
]

function Dashboard({ org, onNavigate, wonState, user }: {
  org: OrgId; onNavigate: (s: Screen) => void; wonState: boolean; user?: any
}) {
  const hasAll = org === 'acme'
  const feed = wonState ? GLOBAL_ACTIVITY_ITEMS : GLOBAL_ACTIVITY_ITEMS.slice(1)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[920px]">
      <div>
        <h1 className="text-[28px] lg:text-[32px] font-medium text-[#1A1918] leading-tight mb-1.5"
          style={{ fontFamily: "'Instrument Serif', serif" }}>
          {greeting}, {user?.name ? user.name.split(" ")[0] : "User"}
        </h1>
        <p className="text-[14px] text-[#9E9A95]">Here's what's happening across your workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active Projects" value="3" trend="flat" trendLabel="Same as last month" />
        <KPICard label="Pipeline Value" value={hasAll ? '₹45,00,000' : '—'} trend={hasAll ? 'up' : undefined} trendLabel={hasAll ? '+₹8,00,000 vs last month' : 'CRM not enabled'} />
        <KPICard label="Open Tasks" value="12" trend="up" trendLabel="4 due this week" />
        <KPICard label="Project Expenses" value={hasAll ? '₹2,15,000' : '—'} trendLabel={hasAll ? 'Across 3 projects' : 'Accounts not enabled'} />
      </div>

      {/* Recent activity */}
      <div>
        <SectionLabel right={
          <button onClick={() => onNavigate('activity')} className="text-[11px] text-[#B07245] hover:text-[#965E35] transition-colors flex items-center gap-1">
            View all <IcoChevronRight />
          </button>
        }>Recent Activity</SectionLabel>
        <div className="bg-white border border-[#E5E1D9]">
          {feed.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F5F2EC] last:border-0 hover:bg-[#FDFCFA] transition-colors">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: APP_COLORS[item.app].dot }} />
              <span className="text-[11px] text-[#C8C0B5] font-mono w-10 shrink-0 tabular-nums">{item.time}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-[#1A1918]">{item.title}</span>
                <span className="text-[13px] text-[#9E9A95] ml-2">{item.detail}</span>
              </div>
              {hasAll && <div className="shrink-0"><AppBadge app={item.app} /></div>}
            </div>
          ))}
          {feed.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-[#C8C0B5]">
              Activity will appear here as you use ARCHOS.
            </div>
          )}
        </div>
      </div>

      {/* App cards */}
      {hasAll && (
        <div>
          <SectionLabel>Your Applications</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { app: 'CRM' as AppLabel, target: 'crm' as Screen, desc: 'Manage leads and opportunities', stat: '5 active opportunities', value: '₹45,00,000 pipeline' },
              { app: 'Projects' as AppLabel, target: 'projects' as Screen, desc: 'Plan and deliver your work', stat: '3 projects in progress', value: '12 open tasks' },
              { app: 'Accounts' as AppLabel, target: 'accounts' as Screen, desc: 'Track project finances', stat: '₹2,15,000 expenses logged', value: '3 projects tracked' },
            ]).map(card => (
              <button key={card.app} onClick={() => onNavigate(card.target)}
                className="bg-white border border-[#E5E1D9] p-5 text-left hover:border-[#C8C0B5] hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <AppBadge app={card.app} />
                  <StatusBadge label="Enabled" />
                </div>
                <div className="text-[15px] font-semibold text-[#1A1918] mb-1">{card.app}</div>
                <div className="text-[12px] text-[#9E9A95] mb-4 leading-relaxed">{card.desc}</div>
                <div className="border-t border-[#F2EFE9] pt-3 space-y-1">
                  <div className="text-[12px] font-semibold text-[#1A1918]" style={{ fontFamily: "'DM Mono', monospace" }}>{card.value}</div>
                  <div className="text-[11px] text-[#B0ABA5]">{card.stat}</div>
                </div>
                <div className="text-[11px] font-semibold text-[#B07245] group-hover:text-[#965E35] transition-colors mt-3 flex items-center gap-1">
                  Open {card.app} <IcoChevronRight />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: CRM
═══════════════════════════════════════════════════════════════ */
const KANBAN = [
  {
    id: 'qualification', label: 'Qualification', color: '#EAECF0',
    cards: [
      { name: 'Modern Office Fit-out', company: 'Horizon Corp', value: '₹18,00,000', owner: 'Priya M.', stage: 'Qualification' as StatusLabel },
      { name: 'Boutique Hotel Lobby', company: 'Stay Well Hotels', value: '₹32,00,000', owner: 'Demo Admin', stage: 'Qualification' as StatusLabel },
    ]
  },
  {
    id: 'proposal', label: 'Proposal', color: '#F5EDE5',
    cards: [
      { name: 'Luxury Villa', company: 'ABC Interiors', value: '₹25,00,000', owner: 'Demo Admin', stage: 'Proposal' as StatusLabel, highlight: true },
      { name: 'Corporate HQ Redesign', company: 'Axis Partners', value: '₹55,00,000', owner: 'Rohan K.', stage: 'Proposal' as StatusLabel },
    ]
  },
  {
    id: 'negotiation', label: 'Negotiation', color: '#E4EFF2',
    cards: [
      { name: 'Residential Complex', company: 'Sharma Builders', value: '₹42,00,000', owner: 'Ananya S.', stage: 'Negotiation' as StatusLabel },
    ]
  },
  {
    id: 'won', label: 'Won', color: '#E6F2EB', cards: [] as { name: string; company: string; value: string; owner: string; stage: StatusLabel; highlight?: boolean }[]
  },
]

function CRMScreen({ onNavigate, wonState }: { onNavigate: (s: Screen) => void; wonState: boolean }) {
  const columns = wonState
    ? [
        KANBAN[0],
        { ...KANBAN[1], cards: KANBAN[1].cards.filter(c => !c.highlight) },
        KANBAN[2],
        { ...KANBAN[3], cards: [{ name: 'Luxury Villa', company: 'ABC Interiors', value: '₹25,00,000', owner: 'Demo Admin', stage: 'Won' as StatusLabel }] },
      ]
    : KANBAN

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 min-h-full">
      <PageHeader eyebrow="CRM" title="Manage leads and opportunities."
        action={<button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ New Lead</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active Leads" value="8" trend="up" trendLabel="+2 this week" />
        <KPICard label="Pipeline Value" value="₹45,00,000" />
        <KPICard label="Opportunities" value="5" />
        <KPICard label="Won This Month" value={wonState ? '₹25,00,000' : '₹0'} trendLabel={wonState ? 'Luxury Villa' : undefined} />
      </div>

      <div>
        <SectionLabel right={
          <div className="flex items-center gap-2">
            {(['Qualification', 'Proposal', 'Negotiation', 'Won'] as StatusLabel[]).map(s => (
              <span key={s} className="text-[10px] text-[#B0ABA5] hidden lg:block">{s}</span>
            ))}
          </div>
        }>Opportunity Pipeline</SectionLabel>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {columns.map(col => (
            <div key={col.id} className="min-w-[196px] w-[196px] flex-shrink-0">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: col.color, border: '1px solid #E5E1D9' }} />
                  <span className="text-[10px] font-semibold text-[#9E9A95] tracking-widest uppercase">{col.label}</span>
                </div>
                <span className="text-[11px] text-[#C8C0B5] font-mono">{col.cards.length}</span>
              </div>
              <div className="space-y-2">
                {col.cards.map(card => (
                  <div key={card.name}
                    onClick={() => card.name === 'Luxury Villa' && onNavigate('crm-detail')}
                    className={`bg-white border p-4 space-y-2.5 transition-all ${card.highlight ? 'border-[#B07245]/30 cursor-pointer hover:border-[#B07245] hover:shadow-sm' : card.stage === 'Won' ? 'border-[#B0D9BC] border-l-2 border-l-[#2E6A42]' : 'border-[#E5E1D9]'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-semibold text-[#1A1918] leading-tight">{card.name}</div>
                      {card.stage === 'Won' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="#2E6A42" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="text-[11px] text-[#9E9A95]">{card.company}</div>
                    <div className="text-[15px] font-semibold text-[#1A1918]" style={{ fontFamily: "'DM Mono', monospace" }}>{card.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-[#B0ABA5]">{card.owner}</div>
                      {card.highlight && <div className="text-[10px] font-semibold text-[#B07245]">View →</div>}
                    </div>
                  </div>
                ))}
                {col.cards.length === 0 && (
                  <div className="border border-dashed border-[#E5E1D9] p-6 text-center text-[11px] text-[#D5CEC8]">
                    {col.id === 'won' ? 'No wins yet' : 'No opportunities'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: CRM DETAIL
═══════════════════════════════════════════════════════════════ */
function CRMDetail({ wonState, onWon, onNavigate }: {
  wonState: boolean; onWon: () => void; onNavigate: (s: Screen) => void
}) {
  const [toast, setToast] = useState(false)
  const [crossApp, setCrossApp] = useState(wonState)

  const handleWon = () => {
    onWon()
    setToast(true)
    setTimeout(() => { setToast(false); setCrossApp(true) }, 2500)
  }

  const crmActivity = [
    { date: 'Jan 15', event: 'Lead created from inbound inquiry' },
    { date: 'Jan 20', event: 'Proposal sent to ABC Interiors' },
    { date: 'Jan 28', event: 'Client site walkthrough completed' },
    { date: 'Feb 02', event: 'Stage updated to Proposal' },
    ...(wonState ? [{ date: 'Feb 09', event: 'Opportunity marked as Won — ₹25,00,000' }] : []),
  ]

  return (
    <div className="p-6 lg:p-8 max-w-[880px]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[#1A1918] text-white px-5 py-4 flex items-center gap-3.5 shadow-2xl z-50"
          style={{ minWidth: 280 }}>
          <div className="w-8 h-8 bg-[#2E6A42]/20 flex items-center justify-center rounded-full shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="#4A9E6A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold">Opportunity marked as Won</div>
            <div className="text-[11px] text-[#6A6460] mt-0.5">Triggering project creation in Projects…</div>
          </div>
        </div>
      )}

      <Breadcrumb items={[{ label: 'CRM', target: 'crm' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}>
            Luxury Villa
          </h1>
          <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-[22px] font-semibold text-[#1A1918] tracking-tight" style={{ fontFamily: "'DM Mono', monospace" }}>
              ₹25,00,000
            </span>
            <StatusBadge label={wonState ? 'Won' : 'Proposal'} />
          </div>
        </div>
        {!wonState ? (
          <button onClick={handleWon}
            className="bg-[#B07245] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#965E35] transition-colors shadow-sm shrink-0">
            Mark as Won
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[#2E6A42] text-[13px] font-semibold shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Won · Feb 09, 2026
          </div>
        )}
      </div>

      {/* Cross-app trigger */}
      {crossApp && (
        <div className="mb-6 border border-[#3D7A8A]/25 p-4 flex items-center justify-between"
          style={{ background: '#EDF4F6' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: APP_COLORS.Projects.dot }} />
            <div>
              <div className="text-[13px] font-semibold text-[#1A1918]">Project creation triggered</div>
              <div className="text-[12px] text-[#706B65] mt-0.5">
                <span style={{ color: APP_COLORS.Projects.text, fontWeight: 600 }}>Projects</span> · Luxury Villa created · Team assignment in progress
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate('project-detail')}
            className="text-[12px] font-semibold flex items-center gap-1 shrink-0 ml-4 transition-colors"
            style={{ color: APP_COLORS.Projects.text }}>
            View Project <IcoChevronRight />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Details */}
          <div className="bg-white border border-[#E5E1D9] p-6">
            <SectionLabel>Opportunity Details</SectionLabel>
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              {[
                { label: 'Value', value: '₹25,00,000', mono: true },
                { label: 'Expected Close', value: 'Mar 15, 2026' },
                { label: 'Owner', value: 'Demo Admin' },
                { label: 'Stage', value: wonState ? 'Won' : 'Proposal', badge: true },
                { label: 'Lead Source', value: 'Referral' },
                { label: 'Created', value: 'Jan 15, 2026' },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-[10px] text-[#C8C0B5] uppercase tracking-widest mb-1.5">{f.label}</div>
                  {f.badge
                    ? <StatusBadge label={(wonState ? 'Won' : 'Proposal') as StatusLabel} />
                    : <div className={`text-[13px] text-[#1A1918] ${f.mono ? 'font-semibold' : ''}`}
                        style={f.mono ? { fontFamily: "'DM Mono', monospace" } : {}}>
                        {f.value}
                      </div>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white border border-[#E5E1D9] p-6">
            <SectionLabel>Activity</SectionLabel>
            {crmActivity.map((item, i) => (
              <div key={i} className="flex gap-4 pb-4 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2 h-2 rounded-full mt-0.5" style={{ background: APP_COLORS.CRM.dot }} />
                  {i < crmActivity.length - 1 && <div className="w-px flex-1 mt-1.5" style={{ background: '#EDE9E3' }} />}
                </div>
                <div>
                  <div className="text-[13px] text-[#1A1918]">{item.event}</div>
                  <div className="text-[11px] text-[#C8C0B5] mt-0.5 font-mono">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E1D9] p-5">
            <SectionLabel>Client</SectionLabel>
            <div className="text-[14px] font-semibold text-[#1A1918] mb-3">ABC Interiors</div>
            <div className="space-y-2.5 text-[13px] text-[#706B65]">
              <div>contact@abcinteriors.com</div>
              <div>+91 98765 43210</div>
              <div className="text-[11px] text-[#B0ABA5]">Mumbai, Maharashtra</div>
            </div>
            <button onClick={() => onNavigate('contacts')}
              className="mt-4 text-[12px] font-medium flex items-center gap-1 transition-colors"
              style={{ color: APP_COLORS.CRM.text }}>
              View Contact <IcoChevronRight />
            </button>
          </div>

          {wonState && (
            <div className="bg-white border border-[#E5E1D9] p-5">
              <SectionLabel>Linked Records</SectionLabel>
              <div className="space-y-3">
                <button onClick={() => onNavigate('project-detail')}
                  className="w-full flex items-center gap-3 py-2 text-left hover:opacity-80 transition-opacity">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0"
                    style={{ background: APP_COLORS.Projects.bg, color: APP_COLORS.Projects.text }}>
                    <IcoProjects />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#1A1918]">Luxury Villa</div>
                    <div className="text-[11px] text-[#B0ABA5]">Projects · Planning</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: PROJECTS
═══════════════════════════════════════════════════════════════ */
const PROJECTS_LIST = [
  { name: 'Luxury Villa', client: 'ABC Interiors', status: 'Planning' as StatusLabel, budget: 2500000, spent: 215000, tasks: 8, done: 3, highlight: true },
  { name: 'Modern Office Fit-out', client: 'Horizon Corp', status: 'Active' as StatusLabel, budget: 1800000, spent: 840000, tasks: 15, done: 9 },
  { name: 'Boutique Hotel Lobby', client: 'Stay Well Hotels', status: 'Active' as StatusLabel, budget: 3200000, spent: 1200000, tasks: 22, done: 11 },
  { name: 'Residential Penthouse', client: 'Kapoor Family', status: 'On Hold' as StatusLabel, budget: 1500000, spent: 80000, tasks: 6, done: 1 },
]

function ProjectsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[940px]">
      <PageHeader eyebrow="Projects" title="Plan, coordinate and deliver your work."
        action={<button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ New Project</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active Projects" value="3" trend="flat" trendLabel="Same as last month" />
        <KPICard label="Tasks Due" value="4" trend="up" trendLabel="This week" />
        <KPICard label="Total Budget" value="₹90,00,000" />
        <KPICard label="Total Expenses" value="₹23,35,000" trend="up" trendLabel="+₹1,20,000 this week" />
      </div>

      <div>
        <SectionLabel right={
          <div className="flex items-center gap-2">
            {['All', 'Active', 'Planning', 'On Hold'].map(f => (
              <button key={f} className={`text-[11px] px-2.5 py-1 transition-colors ${f === 'All' ? 'bg-[#1A1918] text-white' : 'text-[#9E9A95] border border-[#E5E1D9] hover:border-[#C8C0B5]'}`}>
                {f}
              </button>
            ))}
          </div>
        }>Projects</SectionLabel>

        <div className="bg-white border border-[#E5E1D9]">
          <div className="hidden lg:grid grid-cols-[1fr_110px_130px_130px_80px_60px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
            {['Project', 'Status', 'Budget', 'Spent', 'Tasks', ''].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">{h}</div>
            ))}
          </div>
          {PROJECTS_LIST.map(p => {
            const pct = Math.round((p.spent / p.budget) * 100)
            return (
              <div key={p.name}
                onClick={() => p.highlight && onNavigate('project-detail')}
                className={`lg:grid lg:grid-cols-[1fr_110px_130px_130px_80px_60px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 transition-colors flex flex-col gap-2 ${p.highlight ? 'cursor-pointer hover:bg-[#FDFCFA]' : ''}`}>
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1918]">{p.name}</div>
                  <div className="text-[11px] text-[#B0ABA5] mt-0.5">{p.client}</div>
                </div>
                <div className="flex items-center"><StatusBadge label={p.status} /></div>
                <div className="text-[13px] text-[#1A1918] flex items-center font-mono">{fmt(p.budget)}</div>
                <div className="flex flex-col justify-center">
                  <div className="text-[13px] text-[#9E9A95] font-mono">{fmt(p.spent)}</div>
                  <div className="h-0.5 bg-[#F0EDE8] mt-1.5 w-24">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? '#B07245' : '#D5CEC8' }} />
                  </div>
                </div>
                <div className="text-[12px] text-[#9E9A95] font-mono flex items-center">{p.done}/{p.tasks}</div>
                <div className="flex items-center">
                  {p.highlight && <span className="text-[#B07245] text-[11px] font-semibold">View →</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: PROJECT DETAIL
═══════════════════════════════════════════════════════════════ */
const PROJECT_TASKS = [
  { name: 'Initial Client Meeting', done: true },
  { name: 'Site Survey & Measurements', done: true },
  { name: 'Design Brief Preparation', done: false },
  { name: 'Material Specification & Selection', done: false },
  { name: 'Architectural Drawings', done: false },
  { name: 'Interior Layout Plan', done: false },
  { name: 'Contractor Briefing', done: false },
  { name: 'Client Sign-off', done: false },
]

const PROJECT_TEAM = [
  { role: 'Architect', name: 'Ananya Sharma', initials: 'AS', color: '#E4EFF2' },
  { role: 'Interior Designer', name: 'Rohan Mehta', initials: 'RM', color: '#F5EDE5' },
  { role: 'Site Engineer', name: 'Vikram Singh', initials: 'VS', color: '#EAECF0' },
]

function ProjectDetail({ onNavigate, wonState, expenses }: {
  onNavigate: (s: Screen) => void; wonState: boolean; expenses: Expense[]
}) {
  const luxExp = expenses.filter(e => e.project === 'Luxury Villa')
  const spent = luxExp.reduce((s, e) => s + e.amount, 0)
  const budget = 2500000
  const remaining = budget - spent
  const pct = Math.min(100, Math.round((spent / budget) * 100))

  const crossActivity = [
    ...(wonState ? [{ event: 'Opportunity marked as Won', sub: 'Luxury Villa · ₹25,00,000', app: 'CRM' as AppLabel }] : []),
    { event: 'Project created automatically', sub: 'From CRM opportunity', app: 'Projects' as AppLabel },
    { event: 'Architect assigned', sub: 'Ananya Sharma added to team', app: 'Projects' as AppLabel },
    ...luxExp.map(e => ({ event: `Expense added — ${fmt(e.amount)}`, sub: `${e.description} · ${e.category}`, app: 'Accounts' as AppLabel })),
  ]

  const doneCount = PROJECT_TASKS.filter(t => t.done).length

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <Breadcrumb items={[{ label: 'Projects', target: 'projects' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>
          <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>
          <div className="mt-2.5"><StatusBadge label="Planning" /></div>
        </div>
        <button className="border border-[#E5E1D9] text-[#706B65] px-4 py-2 text-[12px] font-medium hover:border-[#C8C0B5] transition-colors shrink-0">
          Edit Project
        </button>
      </div>

      {/* Budget bar */}
      <div className="bg-white border border-[#E5E1D9] p-6 mb-6">
        <div className="grid grid-cols-3 divide-x divide-[#F2EFE9]">
          {[
            { label: 'Budget', value: fmt(budget), color: '#1A1918' },
            { label: 'Spent', value: fmt(spent), color: '#B07245' },
            { label: 'Remaining', value: fmt(remaining), color: '#2E6A42' },
          ].map(item => (
            <div key={item.label} className="px-6 first:pl-0 last:pr-0">
              <div className="text-[10px] font-semibold text-[#B0ABA5] uppercase tracking-widest mb-2">{item.label}</div>
              <div className="text-[22px] lg:text-[26px] font-semibold leading-none tracking-tight" style={{ color: item.color, fontFamily: "'DM Mono', monospace" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="h-1 bg-[#F0EDE8] overflow-hidden">
            <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: '#B07245' }} />
          </div>
          <div className="text-[10px] text-[#C8C0B5] mt-1.5 font-mono">{pct}% of budget utilised</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Tasks */}
          <div className="bg-white border border-[#E5E1D9] p-6">
            <SectionLabel right={
              <span className="text-[11px] font-mono text-[#B0ABA5]">{doneCount}/{PROJECT_TASKS.length}</span>
            }>Tasks</SectionLabel>
            <div className="h-0.5 bg-[#F0EDE8] mb-4">
              <div className="h-full bg-[#1A1918] transition-all" style={{ width: `${(doneCount / PROJECT_TASKS.length) * 100}%` }} />
            </div>
            <div className="space-y-1">
              {PROJECT_TASKS.map(t => (
                <div key={t.name} className="flex items-center gap-3 py-1.5">
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${t.done ? 'bg-[#1A1918] border-[#1A1918] text-white' : 'border-[#D5CEC8] text-transparent'}`}>
                    <IcoCheck />
                  </div>
                  <span className={`text-[13px] ${t.done ? 'text-[#B0ABA5] line-through' : 'text-[#1A1918]'}`}>{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-app activity */}
          <div className="bg-white border border-[#E5E1D9] p-6">
            <SectionLabel right={
              <div className="text-[9px] font-semibold tracking-widest text-[#B0ABA5] uppercase border border-[#E5E1D9] px-2 py-0.5">
                Across Applications
              </div>
            }>Activity</SectionLabel>
            {crossActivity.map((item, i) => (
              <div key={i} className="flex gap-3.5 pb-5 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2 h-2 rounded-full mt-0.5" style={{ background: APP_COLORS[item.app].dot }} />
                  {i < crossActivity.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: '#EDE9E3' }} />}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{item.event}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <AppBadge app={item.app} />
                    <span className="text-[11px] text-[#B0ABA5]">{item.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E1D9] p-5">
            <SectionLabel>Team</SectionLabel>
            <div className="space-y-4">
              {PROJECT_TEAM.map(m => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold shrink-0 border"
                    style={{ background: m.color, borderColor: m.color, color: '#1A1918' }}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#1A1918]">{m.name}</div>
                    <div className="text-[11px] text-[#B0ABA5]">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-5 text-[11px] text-[#B0ABA5] hover:text-[#706B65] transition-colors border border-[#E5E1D9] px-3 py-1.5 w-full">
              + Add Team Member
            </button>
          </div>

          <div className="bg-white border border-[#E5E1D9] p-5">
            <SectionLabel>Client</SectionLabel>
            <div className="text-[13px] font-semibold text-[#1A1918] mb-1">ABC Interiors</div>
            <div className="text-[12px] text-[#9E9A95]">contact@abcinteriors.com</div>
            <button onClick={() => onNavigate('contacts')} className="mt-3 text-[11px] font-medium flex items-center gap-1 transition-colors" style={{ color: APP_COLORS.Projects.text }}>
              View contact <IcoChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: ACCOUNTS
═══════════════════════════════════════════════════════════════ */
function AccountsScreen({ expenses, onAdd, serverState }: { expenses: Expense[]; onAdd: (e: Omit<Expense, 'id'>) => void; serverState?: any }) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ description: '', category: 'Material', project: 'Luxury Villa', amount: '' })

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const largest = Math.max(...expenses.map(e => e.amount))

  const cat_colors: Record<string, string> = { Material: '#B07245', Transport: '#3D7A8A', Labor: '#4A5568', Equipment: '#8C6010', Consultation: '#5A4570' }

  const handleSubmit = () => {
    if (!form.description || !form.amount) return
    onAdd({ description: form.description, category: form.category, project: form.project, amount: Number(form.amount) })
    setModal(false)
    setForm({ description: '', category: 'Material', project: 'Luxury Villa', amount: '' })
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[940px]">
        {modal && (
          <AddExpenseForm 
            projects={serverState?.projects || []}
            onAdded={() => { setModal(false); window.location.reload(); }}
            onCancel={() => setModal(false)}
          />
        )}

      <PageHeader eyebrow="Accounts" title="Track project expenses and financial health."
        action={<button onClick={() => setModal(true)} className="bg-[#B07245] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#965E35] transition-colors">+ Add Expense</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total Expenses" value={fmt(total)} trend="up" trendLabel="+₹1,20,000 this week" />
        <KPICard label="Active Projects" value="3" />
        <KPICard label="This Month" value={fmt(total)} />
        <KPICard label="Largest Expense" value={fmt(largest)} />
      </div>

      <div>
        <SectionLabel>Expenses</SectionLabel>
        <div className="bg-white border border-[#E5E1D9]">
          <div className="hidden lg:grid grid-cols-[1fr_120px_180px_130px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
            {['Description', 'Category', 'Project', 'Amount'].map((h, i) => (
              <div key={h} className={`text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}>{h}</div>
            ))}
          </div>
          {expenses.map(e => (
            <div key={e.id} className="lg:grid lg:grid-cols-[1fr_120px_180px_130px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 hover:bg-[#FDFCFA] transition-colors flex flex-col gap-1.5">
              <div className="text-[13px] font-medium text-[#1A1918]">{e.description}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat_colors[e.category] || '#9E9A95' }} />
                <span className="text-[12px] text-[#9E9A95]">{e.category}</span>
              </div>
              <div className="text-[12px] text-[#9E9A95]">
                <a href={`/projects/${e.projectId || ''}`} className="hover:text-[#B07245] hover:underline cursor-pointer transition-colors">
                  {typeof e.project === 'string' ? e.project : (e.project as any)?.name} &rarr;
                </a>
              </div>
              <div className="text-[14px] font-semibold text-[#1A1918] lg:text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(e.amount)}</div>
            </div>
          ))}
          <div className="lg:grid lg:grid-cols-[1fr_120px_180px_130px] gap-4 px-5 py-4 border-t-2 border-[#E5E1D9] bg-[#FAFAF8]">
            <div className="hidden lg:block lg:col-span-3 text-[11px] font-semibold text-[#9E9A95] uppercase tracking-widest">Total</div>
            <div className="text-[15px] font-semibold text-[#1A1918] lg:text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(total)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: ACTIVITY
═══════════════════════════════════════════════════════════════ */
function ActivityScreen({ wonState, expenses }: { wonState: boolean; expenses: Expense[] }) {
  const [filter, setFilter] = useState<'all' | AppLabel>('all')

  const allItems = [
    ...(wonState ? [
      { time: '09:42', title: 'Opportunity marked as Won', detail: 'Luxury Villa · ABC Interiors', app: 'CRM' as AppLabel },
      { time: '10:03', title: 'Project created automatically', detail: 'Luxury Villa', app: 'Projects' as AppLabel },
      { time: '10:15', title: 'Architect assigned', detail: 'Ananya Sharma — Luxury Villa', app: 'Projects' as AppLabel },
    ] : []),
    ...expenses.map((e, i) => ({
      time: `11:${(24 + i).toString().padStart(2, '0')}`,
      title: 'Expense added',
      detail: `${e.description} — ${fmt(e.amount)}`,
      app: 'Accounts' as AppLabel,
    })),
  ]

  const items = filter === 'all' ? allItems : allItems.filter(i => i.app === filter)

  return (
    <div className="p-6 lg:p-8 max-w-[680px]">
      <PageHeader title="Activity" subtitle="Everything happening across your workspace." />

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'CRM', 'Projects', 'Accounts'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${filter === f ? 'bg-[#1A1918] text-white' : 'border border-[#E5E1D9] text-[#9E9A95] hover:border-[#C8C0B5]'}`}>
            {f === 'all' ? 'All Apps' : f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E5E1D9] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[11px] font-semibold text-[#9E9A95] uppercase tracking-widest">Today · Sep 9, 2026</div>
          <div className="text-[9px] font-semibold tracking-widest text-[#C8C0B5] uppercase border border-[#E5E1D9] px-2 py-0.5">
            One Timeline · All Applications
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-[#D5D0CA] text-[32px] mb-3">○</div>
            <div className="text-[14px] font-medium text-[#B0ABA5] mb-1">No activity yet</div>
            <div className="text-[12px] text-[#D5CEC8]">Mark a CRM opportunity as Won to trigger cross-app activity.</div>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ background: APP_COLORS[item.app].dot }} />
                {i < items.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: '#EDE9E3' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[14px] font-medium text-[#1A1918]">{item.title}</span>
                  <AppBadge app={item.app} />
                </div>
                <div className="text-[13px] text-[#9E9A95] mt-0.5">{item.detail}</div>
                <div className="text-[11px] text-[#C8C0B5] font-mono mt-1.5">{item.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: APPLICATIONS
═══════════════════════════════════════════════════════════════ */
const ALL_APPS_DATA = [
  { id: 'CRM', name: 'CRM', desc: 'Lead and opportunity management', detail: 'Track pipeline, manage client relationships, log activity.', available: true },
  { id: 'Projects', name: 'Projects', desc: 'Project and task management', detail: 'Plan, schedule, track tasks and coordinate team delivery.', available: true },
  { id: 'Accounts', name: 'Accounts', desc: 'Project financial management', detail: 'Track budgets, log expenses, monitor financial health per project.', available: true },
  { id: 'HR', name: 'HR', desc: 'Employee management', detail: 'Manage contracts, leave, team structure and payroll integration.', available: false },
  { id: 'Vendor', name: 'Vendor Management', desc: 'Supplier and procurement', detail: 'Manage approved vendors, raise POs, track deliveries.', available: false },
]

const APP_BG: Record<string, string> = { CRM: '#F5EDE5', Projects: '#E4EFF2', Accounts: '#EAECF0', HR: '#EEE8F5', Vendor: '#F0F0EE' }

function ApplicationsScreen({ org, onOrgSwitch }: { org: OrgId; onOrgSwitch: (o: OrgId) => void }) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({ CRM: true, Projects: true, Accounts: true })
  const orgApps = ORGS[org].apps

  return (
    <div className="p-6 lg:p-8 max-w-[760px]">
      <PageHeader title="Applications" subtitle="Choose the tools your organization needs. Each app works independently or together." />

      {/* Org context */}
      <div className="mb-6 bg-white border border-[#E5E1D9] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest mb-1">Viewing entitlements for</div>
          <div className="text-[14px] font-semibold text-[#1A1918]">{ORGS[org].name}</div>
          <div className="text-[11px] text-[#B0ABA5] mt-0.5">{ORGS[org].apps.length} application{ORGS[org].apps.length !== 1 ? 's' : ''} enabled</div>
        </div>
        <div className="flex gap-2">
          {(['acme', 'small'] as OrgId[]).map(o => (
            <button key={o} onClick={() => onOrgSwitch(o)}
              className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${org === o ? 'bg-[#1A1918] text-white' : 'border border-[#E5E1D9] text-[#9E9A95] hover:border-[#C8C0B5]'}`}>
              {ORGS[o].name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {ALL_APPS_DATA.map(app => {
          const included = orgApps.includes(app.id)
          const enabled = toggles[app.id] && included
          return (
            <div key={app.id}
              className={`bg-white border p-5 flex items-start gap-5 transition-all ${!app.available ? 'border-[#F5F2EC] opacity-55' : included ? 'border-[#E5E1D9]' : 'border-[#F5F2EC]'}`}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0 border"
                style={{ background: APP_BG[app.id] || '#F5F3EF', borderColor: APP_BG[app.id] || '#F5F3EF', color: '#706B65' }}>
                <LogoMark size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[14px] font-semibold text-[#1A1918]">{app.name}</div>
                  {!app.available && <StatusBadge label="Coming Soon" />}
                  {app.available && included && <StatusBadge label="Enabled" />}
                  {app.available && !included && (
                    <span className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">Not included</span>
                  )}
                </div>
                <div className="text-[12px] text-[#9E9A95] font-semibold mb-0.5">{app.desc}</div>
                <div className="text-[12px] text-[#B0ABA5] leading-relaxed">{app.detail}</div>
              </div>
              <div className="shrink-0 pt-0.5">
                {app.available && included && app.id !== 'Projects' && (
                  <Toggle on={enabled} onChange={v => setToggles(t => ({ ...t, [app.id]: v }))} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {org === 'small' && (
        <div className="mt-6 border border-[#E5E1D9] bg-[#FAFAF8] p-5">
          <div className="text-[11px] font-semibold text-[#9E9A95] uppercase tracking-widest mb-2">About Small Studio</div>
          <p className="text-[13px] text-[#706B65] leading-relaxed">
            This workspace uses only <strong className="text-[#1A1918]">Projects</strong>. CRM and Accounts are independent modules — they can be added at any time without migrating or losing existing data. Contacts, files and activity remain shared across all apps.
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: CONTACTS
═══════════════════════════════════════════════════════════════ */
function ContactsScreen({ onNavigate, expenses }: { onNavigate: (s: Screen) => void; expenses: Expense[] }) {
  const luxExp = expenses.filter(e => e.project === 'Luxury Villa')
  const totalExp = luxExp.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="p-6 lg:p-8 max-w-[740px]">
      <div className="mb-8">
        <div className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest mb-2.5">Contacts — Platform Layer</div>
        <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight mb-1"
          style={{ fontFamily: "'Instrument Serif', serif" }}>ABC Interiors</h1>
        <p className="text-[13px] text-[#9E9A95]">Shared contact entity — appears across CRM, Projects and Accounts</p>
      </div>

      <div className="mb-5 flex items-center gap-3 text-[12px] text-[#706B65] border border-[#E5E1D9] bg-[#FAFAF8] px-4 py-3">
        <div className="w-1.5 h-1.5 bg-[#B07245] rounded-full shrink-0" />
        <span>Platform-level entity · one record shared across all enabled applications</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E1D9] p-5">
            <SectionLabel>Contact Information</SectionLabel>
            <div className="space-y-4">
              {[
                { label: 'Company', value: 'ABC Interiors' },
                { label: 'Email', value: 'hello@abcinteriors.com', highlight: true },
                { label: 'Phone', value: '+91 98765 43210' },
                { label: 'City', value: 'Mumbai, Maharashtra' },
                { label: 'Industry', value: 'Interior Design' },
                { label: 'Account Owner', value: 'Demo Admin' },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-[10px] text-[#C8C0B5] uppercase tracking-widest mb-1">{f.label}</div>
                  <div className={`text-[13px] ${f.highlight ? '' : 'text-[#1A1918]'}`}
                    style={f.highlight ? { color: APP_COLORS.CRM.text } : {}}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest mb-3">Appears In</div>

          {[
            { app: 'CRM' as AppLabel, title: '1 Opportunity', sub: 'Luxury Villa · ₹25,00,000', target: 'crm-detail' as Screen },
            { app: 'Projects' as AppLabel, title: '1 Project', sub: 'Luxury Villa · Planning', target: 'project-detail' as Screen },
            { app: 'Accounts' as AppLabel, title: `${fmt(totalExp)} Expenses`, sub: `${luxExp.length} expense${luxExp.length !== 1 ? 's' : ''} logged`, target: 'accounts' as Screen },
          ].map(ref => (
            <button key={ref.app} onClick={() => onNavigate(ref.target)}
              className="w-full bg-white border border-[#E5E1D9] p-4 flex items-center justify-between text-left hover:border-[#C8C0B5] hover:shadow-sm transition-all group">
              <div>
                <AppBadge app={ref.app} />
                <div className="text-[13px] font-semibold text-[#1A1918] mt-2">{ref.title}</div>
                <div className="text-[11px] text-[#B0ABA5] mt-0.5">{ref.sub}</div>
              </div>
              <span className="text-[#D5CEC8] group-hover:text-[#9E9A95] transition-colors"><IcoChevronRight /></span>
            </button>
          ))}

          {/* All contacts */}
          <div className="bg-white border border-[#E5E1D9] p-4 mt-2">
            <SectionLabel>All Contacts</SectionLabel>
            {['ABC Interiors', 'Horizon Corp', 'Stay Well Hotels', 'Sharma Builders', 'Axis Partners'].map((c, i) => (
              <div key={c} className={`flex items-center gap-3 py-2.5 ${i !== 0 ? 'border-t border-[#F5F2EC]' : ''} ${c === 'ABC Interiors' ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-6 h-6 bg-[#F5F3EF] border border-[#E5E1D9] flex items-center justify-center text-[9px] font-bold text-[#9E9A95] shrink-0">
                  {c.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="text-[12px] font-medium text-[#1A1918]">{c}</div>
                {c === 'ABC Interiors' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B07245]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: FILES
═══════════════════════════════════════════════════════════════ */
const FILES_DATA = [
  { name: 'Luxury Villa — Concept Drawings.pdf', type: 'PDF', size: '4.2 MB', project: 'Luxury Villa', date: 'Feb 08, 2026', app: 'Projects' as AppLabel },
  { name: 'ABC Interiors — Proposal.pdf', type: 'PDF', size: '1.8 MB', project: 'Luxury Villa', date: 'Jan 20, 2026', app: 'CRM' as AppLabel },
  { name: 'Material Specifications.xlsx', type: 'Excel', size: '320 KB', project: 'Luxury Villa', date: 'Feb 05, 2026', app: 'Projects' as AppLabel },
  { name: 'Site Survey Photos.zip', type: 'Archive', size: '82 MB', project: 'Luxury Villa', date: 'Jan 28, 2026', app: 'Projects' as AppLabel },
  { name: 'Budget Estimate Q1.xlsx', type: 'Excel', size: '128 KB', project: 'Luxury Villa', date: 'Feb 01, 2026', app: 'Accounts' as AppLabel },
]

function FilesScreen() {
  return (
    <div className="p-6 lg:p-8 max-w-[860px]">
      <PageHeader title="Files" subtitle="All documents and attachments across your workspace."
        action={<button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">↑ Upload</button>} />

      <div className="bg-white border border-[#E5E1D9]">
        <div className="hidden lg:grid grid-cols-[1fr_80px_80px_140px_120px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
          {['File', 'Type', 'Size', 'Project', 'Source'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {FILES_DATA.map((f, i) => (
          <div key={i} className="lg:grid lg:grid-cols-[1fr_80px_80px_140px_120px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 hover:bg-[#FDFCFA] transition-colors flex flex-col gap-1.5 cursor-pointer">
            <div className="text-[13px] font-medium text-[#1A1918]">{f.name}</div>
            <div className="text-[12px] text-[#9E9A95]">{f.type}</div>
            <div className="text-[12px] text-[#9E9A95] font-mono">{f.size}</div>
            <div className="text-[12px] text-[#9E9A95]">{f.project}</div>
            <div><AppBadge app={f.app} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: NOTIFICATIONS (full page)
═══════════════════════════════════════════════════════════════ */
function NotificationsScreen({ notifs, onReadAll }: { notifs: Notification[]; onReadAll: () => void }) {
  const unread = notifs.filter(n => !n.read).length
  return (
    <div className="p-6 lg:p-8 max-w-[640px]">
      <PageHeader title="Notifications" subtitle="Stay updated on activity across your workspace."
        action={unread > 0 ? <button onClick={onReadAll} className="text-[12px] font-medium text-[#B07245] hover:text-[#965E35] transition-colors">Mark all read</button> : undefined} />
      <div className="bg-white border border-[#E5E1D9]">
        {notifs.map((n, i) => (
          <div key={n.id} className={`flex gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 ${!n.read ? 'bg-[#FDF8F4]' : 'hover:bg-[#FDFCFA]'} transition-colors`}>
            <div className="shrink-0 pt-1">
              <div className="w-2 h-2 rounded-full" style={{ background: !n.read ? APP_COLORS[n.app].dot : '#E5E1D9' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#1A1918]">{n.title}</div>
              <div className="text-[12px] text-[#9E9A95] mt-0.5">{n.detail}</div>
              <div className="flex items-center gap-2 mt-2">
                <AppBadge app={n.app} />
                <span className="text-[11px] text-[#C8C0B5] font-mono">{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: USERS
═══════════════════════════════════════════════════════════════ */
const USERS_DATA = [
  { name: 'Demo Admin', email: 'admin@acmedesign.studio', role: 'Admin', apps: ['CRM', 'Projects', 'Accounts'], initials: 'DA', active: true },
  { name: 'Ananya Sharma', email: 'ananya@acmedesign.studio', role: 'Architect', apps: ['Projects'], initials: 'AS', active: true },
  { name: 'Rohan Mehta', email: 'rohan@acmedesign.studio', role: 'Designer', apps: ['Projects', 'CRM'], initials: 'RM', active: true },
  { name: 'Priya M.', email: 'priya@acmedesign.studio', role: 'Sales', apps: ['CRM'], initials: 'PM', active: false },
]

function UsersScreen({ serverState }: { serverState: any }) {
  const isAdmin = serverState?.user?.email === 'admin@archos.demo';
  const displayUsers = isAdmin ? serverState.allUsers || [] : (serverState.members || []).map((m: any) => m.user);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) return;
    const { updateUserRole } = await import('@/app/admin-actions');
    await updateUserRole(userId, newRole);
    window.location.reload();
  };

  const ROLES = [
    "Architect",
    "Interior Designer",
    "Project Manager",
    "Designer",
    "Sales",
    "Finance / Accounts",
    "Other"
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[800px]">
      <PageHeader title="Users" subtitle="Manage team members and their application access."
        action={isAdmin && <button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ Invite User</button>} />
      <div className="bg-white border border-[#E5E1D9]">
        <div className="hidden lg:grid grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
          {['User', 'Role', 'App Access', 'Status'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {displayUsers.map((u: any) => {
          const initials = u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
          const role = u.profession || 'Pending';
          const isActive = isAdmin ? (u.memberships && u.memberships.length > 0) : true;
          
          return (
            <div key={u.email} className="lg:grid lg:grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 flex flex-col gap-1.5 hover:bg-[#FDFCFA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#F5F3EF] border border-[#E5E1D9] flex items-center justify-center text-[10px] font-semibold text-[#706B65] shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{u.name}</div>
                  <div className="text-[11px] text-[#B0ABA5]">{u.email}</div>
                </div>
              </div>
              <div className="text-[12px] text-[#9E9A95] flex items-center relative">
                {isAdmin ? (
                  <select 
                    value={role} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-transparent border border-transparent hover:border-[#E5E1D9] focus:border-[#B07245] rounded px-1 py-0.5 outline-none text-[#1A1918] cursor-pointer w-full"
                  >
                    <option value="Pending" disabled>Pending</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span>{role}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isActive ? (
                  <>
                    <AppBadge app="CRM" />
                    <AppBadge app="Projects" />
                  </>
                ) : (
                  <span className="text-[11px] text-[#B0ABA5]">No access</span>
                )}
              </div>
              <div className="flex items-center">
                <span className={`text-[11px] font-medium ${isActive ? 'text-[#2E6A42]' : 'text-[#C8C0B5]'}`}>
                  {isActive ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
function SettingsScreen({ org }: { org: OrgId }) {
  return (
    <div className="p-6 lg:p-8 max-w-[640px]">
      <PageHeader title="Settings" subtitle="Organization configuration and preferences." />
      <div className="space-y-4">
        {[
          { label: 'Organization Name', value: ORGS[org].name, type: 'text' },
          { label: 'Domain', value: org === 'acme' ? 'acmedesign.studio' : 'smallstudio.in', type: 'text' },
          { label: 'Timezone', value: 'Asia/Kolkata (IST)', type: 'select' },
          { label: 'Currency', value: 'INR — Indian Rupee', type: 'select' },
          { label: 'Date Format', value: 'DD MMM YYYY', type: 'select' },
        ].map(f => (
          <div key={f.label} className="bg-white border border-[#E5E1D9] p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest mb-1">{f.label}</div>
              <div className="text-[13px] text-[#1A1918]">{f.value}</div>
            </div>
            <button className="text-[11px] text-[#9E9A95] border border-[#E5E1D9] px-3 py-1.5 hover:border-[#C8C0B5] transition-colors shrink-0">
              Edit
            </button>
          </div>
        ))}
        <div className="bg-white border border-[#E5E1D9] p-5">
          <div className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest mb-3">Danger Zone</div>
          <button className="text-[12px] font-medium text-[#B54848] border border-[#EDD5D5] px-3 py-1.5 hover:bg-[#FDF5F5] transition-colors">
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App({ serverState, initialScreen }: { serverState?: any, initialScreen?: Screen }) {
  const [appState, setAppState] = useState<AppState>('app')
  const [screen, setScreen] = useState<Screen>(initialScreen || 'dashboard')
  const [org, setOrg] = useState<OrgId>('acme')
  const [wonState, setWonState] = useState(serverState?.wonState || false)
  const [expenses, setExpenses] = useState<Expense[]>(serverState?.expenses || INITIAL_EXPENSES)
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS)
  const [orgSwitcher, setOrgSwitcher] = useState(false)
  const [notifPanel, setNotifPanel] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const unread = notifs.filter(n => !n.read).length

  const handleOrgSwitch = (newOrg: OrgId) => {
    setOrg(newOrg)
    const blocked: Screen[] = ['crm', 'crm-detail', 'accounts']
    if (newOrg === 'small' && blocked.includes(screen)) setScreen('dashboard')
  }

  const addExpense = async (e: Omit<Expense, 'id'>) => {
    // Generate optimistic ID for UI speed
    const newId = Date.now()
    setExpenses(p => [...p, { ...e, id: newId }])
    
    if (serverState?.opportunity?.id) {
      // Find the project created from opportunity
      const projId = serverState.projects?.find((p: any) => p.sourceOpportunityId === serverState.opportunity.id)?.id;
      if (projId) {
        await submitExpense({
          projectId: projId,
          category: e.category,
          description: e.description,
          amount: e.amount
        });
      }
    }
  }

  const handleWon = async () => {
    setWonState(true);
    if (serverState?.opportunity?.id) {
      await submitWon(serverState.opportunity.id);
    }
  }

  const readAllNotifs = () => setNotifs(n => n.map(x => ({ ...x, read: true })))

  const navigate = (s: Screen) => {
    setScreen(s)
    setSidebarOpen(false)
  }

  if (appState === 'login') {
    return <LoginScreen onLogin={() => setAppState('app')} />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard org={org} onNavigate={navigate} wonState={wonState} user={serverState?.user} />
      case 'crm': return <CRMScreen onNavigate={navigate} wonState={wonState} />
      case 'crm-detail': return <CRMDetail wonState={wonState} onWon={handleWon} onNavigate={navigate} />
      case 'projects': return <ProjectsScreen onNavigate={navigate} />
      case 'project-detail': return <ProjectDetail onNavigate={navigate} wonState={wonState} expenses={expenses} />
      case 'accounts': return <AccountsScreen expenses={expenses} onAdd={addExpense} serverState={serverState} />
      case 'activity': return <ActivityScreen wonState={wonState} expenses={expenses} />
      case 'applications': return <ApplicationsScreen org={org} onOrgSwitch={handleOrgSwitch} />
      case 'contacts': return <ContactsScreen onNavigate={navigate} expenses={expenses} />
      case 'files': return <FilesScreen />
      case 'notifications': return <NotificationsScreen notifs={notifs} onReadAll={readAllNotifs} />
      case 'users': return <UsersScreen serverState={serverState} />
      case 'settings': return <SettingsScreen org={org} />
    }
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {orgSwitcher && <OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} />}
      {notifPanel && (
        <NotifPanel notifs={notifs} onClose={() => setNotifPanel(false)}
          onReadAll={readAllNotifs} onNavigate={navigate} />
      )}

      <Sidebar screen={screen} org={org} open={sidebarOpen} user={serverState?.user}
        onNavigate={navigate}
        onOrgClick={() => { setOrgSwitcher(true); setSidebarOpen(false) }}
        onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F3EF]">
        <TopBar org={org} unreadCount={unread} user={serverState?.user}
          onOrgClick={() => setOrgSwitcher(true)}
          onNotifClick={() => setNotifPanel(p => !p)}
          onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {renderScreen()}
        </div>
      </div>
    </div>
  )
}
