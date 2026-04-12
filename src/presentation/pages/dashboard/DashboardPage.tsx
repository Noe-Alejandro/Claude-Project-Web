import React from 'react'
import {
  TrendingUp,
  Users,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { getUserFullName } from '@domain/models/User'
import { formatRelativeTime } from '@shared/utils/format'
import { Card } from '@presentation/components/ui/Card'
import { Badge, RoleBadge } from '@presentation/components/ui/Badge'
import { Avatar } from '@presentation/components/ui/Avatar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}

interface Activity {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

// ─── Mock data (replaced by real API calls in production) ─────────────────────

const stats: Stat[] = [
  {
    label: 'Total Users',
    value: '12,482',
    change: '+12.5%',
    trend: 'up',
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-400',
  },
  {
    label: 'Active Sessions',
    value: '3,241',
    change: '+4.1%',
    trend: 'up',
    icon: <Activity className="h-5 w-5" />,
    color: 'text-emerald-400',
  },
  {
    label: 'Avg. Response',
    value: '48 ms',
    change: '-8.2%',
    trend: 'up', // lower is better
    icon: <Zap className="h-5 w-5" />,
    color: 'text-amber-400',
  },
  {
    label: 'Security Score',
    value: '98 / 100',
    change: '+2 pts',
    trend: 'up',
    icon: <ShieldCheck className="h-5 w-5" />,
    color: 'text-brand-400',
  },
]

const recentActivity: Activity[] = [
  {
    id: '1',
    actor: 'Alex Morgan',
    action: 'updated permissions for',
    target: 'Team Alpha',
    time: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    actor: 'Jordan Lee',
    action: 'exported report',
    target: 'Q4 Analytics',
    time: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    actor: 'System',
    action: 'completed backup of',
    target: 'Production DB',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    actor: 'Alex Morgan',
    action: 'created new workspace',
    target: 'Project Nova',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    actor: 'Jordan Lee',
    action: 'invited 3 members to',
    target: 'Engineering',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Good {getGreeting()}, <span className="text-brand-400">{user.firstName}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here's what's happening with your workspace today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Avatar user={user} size="md" />
          <div>
            <p className="text-sm font-medium text-slate-200">{getUserFullName(user)}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity feed */}
        <Card className="xl:col-span-2" padding="none">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest actions across your workspace</p>
            </div>
            <Badge variant="brand">Live</Badge>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.map((item) => (
              <ActivityRow key={item.id} activity={item} />
            ))}
          </div>
        </Card>

        {/* Quick info panel */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-base font-semibold text-slate-100">Account Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Role" value={<RoleBadge role={user.role} />} />
            <InfoRow
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            />
            <InfoRow
              label="Last login"
              value={user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'First login'}
            />

            <div className="pt-4 border-t border-white/8">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Account secured</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Two-factor authentication is recommended for your role.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance chart placeholder */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">System Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 30 days — API response times (ms)</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Healthy</Badge>
          </div>
        </div>
        <div className="p-6">
          <MiniChart />
        </div>
      </Card>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ stat: Stat }> = ({ stat }) => (
  <Card className="group hover:border-white/15 transition-colors duration-200">
    <div className="flex items-start justify-between mb-4">
      <span className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>{stat.icon}</span>
      <span
        className={`flex items-center gap-1 text-xs font-medium ${
          stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {stat.trend === 'up' ? (
          <ArrowUpRight className="h-3.5 w-3.5" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5" />
        )}
        {stat.change}
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-100 tabular-nums">{stat.value}</p>
    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
  </Card>
)

const ActivityRow: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
      <TrendingUp className="h-3.5 w-3.5 text-brand-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-300">
        <span className="font-medium text-slate-200">{activity.actor}</span> {activity.action}{' '}
        <span className="font-medium text-brand-400">{activity.target}</span>
      </p>
      <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
        <Clock className="h-3 w-3" />
        {formatRelativeTime(activity.time)}
      </p>
    </div>
  </div>
)

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <span className="text-xs text-slate-300 text-right">{value}</span>
  </div>
)

// Mini sparkline chart (pure CSS/SVG — no chart library needed for this)
const MiniChart: React.FC = () => {
  const points = [
    65, 72, 58, 80, 55, 68, 74, 62, 78, 52, 70, 65, 72, 68, 75, 60, 82, 70, 65, 78, 58, 72, 68, 74,
    62, 80, 65, 70, 55, 72,
  ]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const normalize = (v: number) => ((v - min) / (max - min)) * 80 + 10

  const width = 800
  const height = 100
  const step = width / (points.length - 1)

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - normalize(p)}`)
    .join(' ')

  const areaD = `${pathD} L ${(points.length - 1) * step} ${height} L 0 ${height} Z`

  return (
    <div className="w-full h-24 relative">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGrad)" />
        <path
          d={pathD}
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-600 px-1">
        <span>30d ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default DashboardPage
