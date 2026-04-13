import React from 'react'
import { Mail, Calendar, Clock, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { getUserFullName, getUserInitials } from '@domain/models/User'
import { formatRelativeTime } from '@shared/utils/format'
import { Card } from '@presentation/components/ui/Card'
import { RoleBadge } from '@presentation/components/ui/Badge'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  if (!user) return null

  const initials = getUserInitials(user)
  const fullName = getUserFullName(user)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Your account information</p>
      </div>

      {/* Avatar + name card */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-brand-900/40">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold text-slate-100">{fullName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          <div className="mt-3">
            <RoleBadge role={user.role} />
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-slate-200">Account Details</h3>
        </div>
        <div className="divide-y divide-white/5">
          <DetailRow icon={<User className="h-4 w-4" />} label="Full Name" value={fullName} />
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <DetailRow
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Role"
            value={<RoleBadge role={user.role} />}
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Member Since"
            value={new Date(user.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Last Login"
            value={user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'First session'}
          />
        </div>
      </Card>

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-400">Account secured</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your account is protected with password authentication. Contact your administrator to
            update your credentials.
          </p>
        </div>
      </div>
    </div>
  )
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <div className="flex items-center gap-3 text-slate-500 shrink-0">
      {icon}
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
    <span className="text-sm text-slate-200 text-right">{value}</span>
  </div>
)

export default ProfilePage
