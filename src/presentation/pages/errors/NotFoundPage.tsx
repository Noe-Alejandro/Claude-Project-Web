import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { ROUTES } from '@shared/constants/routes'

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20">
          <Compass className="h-10 w-10 text-brand-400" />
        </span>
      </div>

      <div>
        <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 tabular-nums">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-200">Page not found</h1>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-2 h-12 px-6 text-base font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  </div>
)

export default NotFoundPage
