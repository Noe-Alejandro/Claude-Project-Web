import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Camera,
  X,
  Check,
  Loader2,
  Sparkles,
  Star,
  BadgeCheck,
  WandSparkles,
  Shield,
  Activity,
} from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { getUserFullName, getUserInitials } from '@domain/models/User'
import { formatDate, formatRelativeTime } from '@shared/utils/format'
import { Card } from '@presentation/components/ui/Card'
import { RoleBadge } from '@presentation/components/ui/Badge'
import { useUpdateAvatarMutation } from '@application/users/useUserQueries'
import { cn } from '@shared/utils/cn'

interface AvatarModalProps {
  userId: string
  currentUrl: string | null
  onSaved: (newUrl: string | null) => void
  onClose: () => void
}

const AvatarModal: React.FC<AvatarModalProps> = ({ userId, currentUrl, onSaved, onClose }) => {
  const [urlValue, setUrlValue] = useState(currentUrl ?? '')
  const [previewError, setPreviewError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mutation = useUpdateAvatarMutation()

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 50)
  }, [])

  const showPreview = urlValue.trim() !== '' && !previewError

  const save = async (): Promise<void> => {
    const finalUrl = urlValue.trim() === '' ? null : urlValue.trim()
    await mutation.mutateAsync({ id: userId, avatarUrl: finalUrl })
    onSaved(finalUrl)
    onClose()
  }

  const modal = (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md"
        onClick={() => {
          onClose()
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-[28px] border border-fuchsia-200/15 bg-slate-950/95 shadow-2xl animate-fade-in"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Change avatar</h2>
            <button
              onClick={() => {
                onClose()
              }}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <p className="text-xs text-slate-400">
              Paste a public image URL. It will be used across your profile, navigation, and team
              areas.
            </p>

            {showPreview && (
              <div className="flex justify-center">
                <img
                  src={urlValue.trim()}
                  alt="Preview"
                  onError={() => {
                    setPreviewError(true)
                  }}
                  className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                />
              </div>
            )}

            {urlValue.trim() !== '' && previewError && (
              <p className="text-center text-xs text-rose-400">
                Could not load image from this URL
              </p>
            )}

            <input
              ref={inputRef}
              type="url"
              value={urlValue}
              onChange={(e) => {
                setUrlValue(e.target.value)
                setPreviewError(false)
              }}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-xl border border-white/[0.05] bg-slate-800/88 px-3 py-2.5 text-sm text-slate-400 transition-colors placeholder-slate-500 focus:border-fuchsia-400/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
            />

            {urlValue.trim() !== '' && (
              <button
                type="button"
                onClick={() => {
                  setUrlValue('')
                  setPreviewError(false)
                }}
                className="text-xs text-slate-500 transition-colors hover:text-rose-400"
              >
                Remove avatar
              </button>
            )}

            {mutation.isError && (
              <p className="text-xs text-rose-400">Failed to save. Please try again.</p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose()
                }}
                className="rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void save()
                }}
                disabled={mutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-500 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modal, document.body)
}

interface AvatarButtonProps {
  currentUrl: string | null
  initials: string
  fullName: string
  onClick: () => void
}

const AvatarButton: React.FC<AvatarButtonProps> = ({ currentUrl, initials, fullName, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] border border-white/15 bg-slate-900/60 shadow-[0_24px_80px_-28px_rgba(124,58,237,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
    aria-label="Change avatar"
  >
    {currentUrl ? (
      <img src={currentUrl} alt={fullName} className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.55),_rgba(124,58,237,0.7)_45%,_rgba(15,23,42,1)_100%)] text-3xl font-black tracking-[0.18em] text-white">
        {initials}
      </div>
    )}
    <div className="absolute inset-0 bg-slate-950/50 opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-white/10 p-2 text-white backdrop-blur-md">
      <Camera className="h-4 w-4" />
    </div>
  </button>
)

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  if (!user) return null

  const initials = getUserInitials(user)
  const fullName = getUserFullName(user)
  const joinedLabel = formatDate(user.createdAt, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const lastSeenLabel = user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'First session'
  const accentWord =
    user.role === 'admin' ? 'Command' : user.role === 'manager' ? 'Control' : 'Presence'
  const profileScore = user.role === 'admin' ? 108 : user.role === 'manager' ? 94 : 76
  const auraLevel = user.role === 'admin' ? 'Executive signal' : 'Trusted operator'
  const collection = [
    { label: 'Profile score', value: String(profileScore), icon: <Sparkles className="h-4 w-4" /> },
    {
      label: 'Trust badges',
      value: user.role === 'admin' ? '12' : '7',
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    {
      label: 'Active streak',
      value: user.lastLoginAt ? 'Daily' : 'New',
      icon: <Activity className="h-4 w-4" />,
    },
    { label: 'Security tier', value: 'Protected', icon: <Shield className="h-4 w-4" /> },
  ]
  const highlightCards = [
    {
      title: 'Identity signature',
      body: `${fullName} is presenting as ${accentWord.toLowerCase()} mode with a verified ${user.role} profile.`,
      icon: <Star className="h-4 w-4" />,
    },
    {
      title: 'Current rhythm',
      body: user.lastLoginAt
        ? `Last activity was ${lastSeenLabel}, keeping this account visibly active.`
        : 'No recent login history yet, which makes this the perfect moment to define the profile vibe.',
      icon: <WandSparkles className="h-4 w-4" />,
    },
  ]

  const handleAvatarSaved = (newUrl: string | null): void => {
    updateUser({ avatarUrl: newUrl })
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(192,38,211,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(99,102,241,0.18),_transparent_26%),linear-gradient(180deg,_rgba(8,15,32,0.96),_rgba(3,7,18,1))] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div className="overflow-hidden rounded-[32px] border border-fuchsia-200/10 bg-slate-950/60 shadow-[0_30px_120px_-40px_rgba(147,51,234,0.85)] backdrop-blur-xl">
          <div className="relative overflow-hidden px-5 pb-6 pt-5 sm:px-8 sm:pt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(244,114,182,0.24),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(129,140,248,0.24),_transparent_18%),radial-gradient(circle_at_50%_60%,_rgba(147,51,234,0.18),_transparent_30%)]" />
            <div className="absolute -left-12 top-12 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_320px]">
              <div className="space-y-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <AvatarButton
                    currentUrl={user.avatarUrl ?? null}
                    initials={initials}
                    fullName={fullName}
                    onClick={() => {
                      setShowAvatarModal(true)
                    }}
                  />

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.34em] text-fuchsia-200/70">
                          Profile Showcase
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            {fullName}
                          </h1>
                          <RoleBadge role={user.role} />
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-slate-300">
                          A more expressive identity view for the account, with strong presence,
                          useful details, and a profile surface that feels curated instead of purely
                          administrative.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-sm">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-100/60">
                          Level
                        </p>
                        <p className="mt-1 text-2xl font-black text-white">{profileScore}</p>
                        <p className="text-xs text-slate-400">{auraLevel}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                        Currently online
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1">
                        {user.email}
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1">
                        Joined {joinedLabel}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {collection.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 text-fuchsia-200">
                            {item.icon}
                            <span className="text-[11px] uppercase tracking-[0.26em] text-fuchsia-100/60">
                              {item.label}
                            </span>
                          </div>
                          <p className="mt-3 text-xl font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/55">
                  <div className="relative h-64 overflow-hidden sm:h-72">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={fullName}
                        className="h-full w-full object-cover opacity-75"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_50%_45%,_rgba(244,114,182,0.65),_rgba(124,58,237,0.7)_26%,_rgba(30,41,59,0.92)_56%,_rgba(2,6,23,1)_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.08),_rgba(2,6,23,0.82))]" />
                    <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18)_0,_rgba(255,255,255,0.03)_20%,_transparent_42%)]" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      <div className="max-w-xl space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">
                          Signature Banner
                        </p>
                        <h2 className="text-2xl font-black text-white sm:text-3xl">
                          Built for a stronger first impression
                        </h2>
                        <p className="text-sm leading-6 text-slate-200/90">
                          This panel turns the profile into a visual identity surface, with room for
                          status, recognition, and the kind of atmosphere your current page is
                          missing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {highlightCards.map((card) => (
                    <Card
                      key={card.title}
                      className="rounded-[26px] border-fuchsia-200/10 bg-white/[0.04] shadow-none"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-fuchsia-500/10 p-3 text-fuchsia-200">
                          {card.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{card.body}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Card className="rounded-[28px] border-fuchsia-200/10 bg-white/[0.04] shadow-none">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/60">
                        Live Status
                      </p>
                      <h2 className="mt-2 text-xl font-black text-white">Current profile signal</h2>
                    </div>

                    <div className="space-y-3">
                      <SideMetric label="Role" value={user.role} />
                      <SideMetric label="Last login" value={lastSeenLabel} />
                      <SideMetric label="Member since" value={joinedLabel} />
                      <SideMetric label="Security" value="Password protected" />
                    </div>
                  </div>
                </Card>

                <Card
                  padding="none"
                  className="overflow-hidden rounded-[28px] border-fuchsia-200/10 bg-white/[0.04] shadow-none"
                >
                  <div className="border-b border-white/8 px-5 py-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                      Account details
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    <DetailRow
                      icon={<User className="h-4 w-4" />}
                      label="Full name"
                      value={fullName}
                    />
                    <DetailRow
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={user.email}
                    />
                    <DetailRow
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label="Role"
                      value={<RoleBadge role={user.role} />}
                    />
                    <DetailRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Created"
                      value={joinedLabel}
                    />
                    <DetailRow
                      icon={<Clock className="h-4 w-4" />}
                      label="Recent activity"
                      value={lastSeenLabel}
                    />
                  </div>
                </Card>

                <Card className="rounded-[28px] border-emerald-400/15 bg-emerald-500/5 shadow-none">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
                        Account secured
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Your account is protected with password authentication. Contact your
                        administrator if you want to add more advanced profile actions later.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {showAvatarModal && (
          <AvatarModal
            userId={user.id}
            currentUrl={user.avatarUrl ?? null}
            onSaved={handleAvatarSaved}
            onClose={() => {
              setShowAvatarModal(false)
            }}
          />
        )}
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
    <div className="flex shrink-0 items-center gap-3 text-slate-500">
      {icon}
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
    </div>
    <span className="text-right text-sm text-slate-200">{value}</span>
  </div>
)

const SideMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3">
    <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</span>
    <span className={cn('text-sm font-semibold text-slate-100', value === 'admin' && 'capitalize')}>
      {value}
    </span>
  </div>
)

export default ProfilePage
