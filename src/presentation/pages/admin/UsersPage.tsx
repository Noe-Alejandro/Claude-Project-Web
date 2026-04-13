import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react'
import {
  useUsers,
  useCreateUserMutation,
  useDeleteUserMutation,
} from '@application/users/useUserQueries'
import type { UserSummaryDto } from '@infrastructure/api/users.api'
import type { UserRole } from '@domain/models/User'
import { Card } from '@presentation/components/ui/Card'
import { Button } from '@presentation/components/ui/Button'
import { RoleBadge } from '@presentation/components/ui/Badge'
import { Spinner } from '@presentation/components/ui/Spinner'
import { cn } from '@shared/utils/cn'

// ─── Create user form schema ──────────────────────────────────────────────────

const createSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['viewer', 'user', 'manager', 'admin'] as const),
})

type CreateFormValues = z.infer<typeof createSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserSummaryDto | null>(null)

  const { data, isLoading, isError } = useUsers(page, 10)
  const createMutation = useCreateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'user' },
  })

  const onCreateSubmit = async (values: CreateFormValues) => {
    await createMutation.mutateAsync(values)
    reset()
    setShowCreate(false)
  }

  const onDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            {data ? `${data.total} total users` : 'Manage your team members'}
          </p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
          Add user
        </Button>
      </div>

      {/* Users table */}
      <Card padding="none">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-brand-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-slate-400">Failed to load users. Please try again.</p>
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* Desktop table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.items.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onDelete={() => setDeleteTarget(user)}
                      isDeleting={deleteMutation.isPending && deleteTarget?.id === user.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/8">
                <p className="text-xs text-slate-500">
                  Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.hasPreviousPage}
                    onClick={() => setPage((p) => p - 1)}
                    leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                    rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create user modal */}
      {showCreate && (
        <Modal title="Add user" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={errors.firstName?.message}>
                <input {...register('firstName')} placeholder="Alex" className={inputClass} />
              </Field>
              <Field label="Last name" error={errors.lastName?.message}>
                <input {...register('lastName')} placeholder="Morgan" className={inputClass} />
              </Field>
            </div>
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="alex@company.com"
                className={inputClass}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
            </Field>
            <Field label="Role" error={errors.role?.message}>
              <select {...register('role')} className={cn(inputClass, 'cursor-pointer')}>
                <option value="viewer">Viewer</option>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            {createMutation.isError && (
              <p className="text-xs text-red-400">
                Failed to create user. The email may already be in use.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Create user
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal title="Delete user" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-100">{deleteTarget.fullName}</span>? This
              action cannot be undone.
            </p>
            {deleteMutation.isError && (
              <p className="text-xs text-red-400">Failed to delete user. Please try again.</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={onDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const UserRow: React.FC<{
  user: UserSummaryDto
  onDelete: () => void
  isDeleting: boolean
}> = ({ user, onDelete, isDeleting }) => (
  <tr className="hover:bg-white/3 transition-colors group">
    <td className="px-5 py-3.5 font-medium text-slate-200">{user.fullName}</td>
    <td className="px-5 py-3.5 text-slate-400">{user.email}</td>
    <td className="px-5 py-3.5">
      <RoleBadge role={user.role} />
    </td>
    <td className="px-5 py-3.5 text-slate-500">
      {new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </td>
    <td className="px-5 py-3.5 text-right">
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg
          text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed"
        aria-label={`Delete ${user.fullName}`}
      >
        {isDeleting ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </td>
  </tr>
)

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <>
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  </>
)

const inputClass =
  'w-full bg-white/5 border border-white/10 text-slate-200 text-sm rounded-lg px-3 py-2 ' +
  'placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ' +
  'focus:border-brand-500/50 transition-colors'

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-400">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

export default UsersPage
