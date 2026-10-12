import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, RotateCcw } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { DetailRow, PageHeader } from '../../components/ui'

export default function Account() {
  const { admin, logout, resetDemo } = useStore()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <PageHeader title="Admin account" />
      <div className="max-w-xl space-y-6">
        <section className="card p-6">
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-2 divide-y divide-slate-100">
            <DetailRow label="Name">{admin?.name}</DetailRow>
            <DetailRow label="Email">{admin?.email}</DetailRow>
            <DetailRow label="Role">Staff</DetailRow>
          </dl>
          <button
            className="btn-secondary mt-4"
            onClick={() => {
              logout()
              navigate('/admin/login')
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold">Demo data</h2>
          <p className="mt-1 text-sm text-slate-600">
            This prototype stores everything in your browser. Reset puts the sample equipment, bookings and rules back.
          </p>
          {confirmReset ? (
            <div className="mt-4 flex gap-2">
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  resetDemo()
                  setConfirmReset(false)
                }}
              >
                Yes, reset everything
              </button>
              <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn-danger mt-4" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </button>
          )}
        </section>
      </div>
    </>
  )
}
