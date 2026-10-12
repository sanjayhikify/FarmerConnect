import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useApp } from '../../context/AppContext'
import API from '../../api'

export default function Queue() {
  const navigate = useNavigate()

  const {
    activeSlot,
    activeToken,
    farmer,
    isOnline,
    lastSync,
  } = useApp()

  const [queueInfo, setQueueInfo] = useState({
    status: 'In Line',
    aheadInQueue: 0,
    estimatedWait: 'Calculating...',
  })

  const [backendToken, setBackendToken] = useState('')
  const [updatedAt, setUpdatedAt] = useState(new Date())
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [queueError, setQueueError] = useState('')

  useEffect(() => {
    if (!farmer?.id) {
      setLoadingQueue(false)
      return
    }

    const loadQueue = async () => {
      try {
        setQueueError('')

        const response = await API.get(
          `/queue/${farmer.id}`
        )

        const data = response.data

        setBackendToken(data.booking_token || '')

        setQueueInfo({
          status: data.status || 'In Line',
          aheadInQueue: data.farmers_ahead ?? 0,
          estimatedWait:
            data.estimated_wait_minutes === 0
              ? 'Your turn'
              : `${data.estimated_wait_minutes} mins`,
        })

        setUpdatedAt(new Date())
      } catch (error) {
        console.error(
          'Could not load queue:',
          error
        )

        setQueueError(
          error.response?.data?.detail ||
          'Could not load live queue information.'
        )
      } finally {
        setLoadingQueue(false)
      }
    }

    loadQueue()

    // Refresh queue every 15 seconds
    const timer = setInterval(() => {
      loadQueue()
    }, 15000)

    return () => clearInterval(timer)
  }, [farmer?.id])

  const tokenNumber =
    backendToken ||
    activeToken?.tokenNumber ||
    activeSlot?.tokenNumber ||
    'AG-104'

  return (
    <DashboardLayout
      title="Token Queue"
      subtitle="Your live arrival position at Jaipur Central Mandi."
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

        {/* Digital Token */}

        <section className="relative overflow-hidden rounded-xl bg-[#0d3d34] p-7 text-white shadow-[0_12px_30px_rgba(13,61,52,0.16)] sm:p-9">

          <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-[22px] border-white/5" />

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9bd7c7]">
            Your digital token
          </p>

          <p className="mt-6 text-5xl font-black tracking-tight">
            {tokenNumber}
          </p>

          <p className="mt-3 text-sm text-[#b8d5ce]">
            Keep this token ready at the gate for verification.
          </p>

          <div className="mt-7 flex items-center gap-2 text-xs font-bold text-[#bce9dc]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#19d294]" />

            {queueInfo.status}
          </div>

        </section>

        {/* Queue Information */}

        <section className="rounded-xl border border-[#dfe8e5] bg-white p-6 shadow-[0_5px_18px_rgba(25,55,48,0.04)] sm:p-8">

          <div className="flex items-start justify-between gap-3">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
                Live estimate
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#142a24]">
                {loadingQueue
                  ? 'Loading your queue...'
                  : 'Your current queue position'}
              </h2>

            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                isOnline
                  ? 'bg-[#e8f8f2] text-[#138b69]'
                  : 'bg-[#fff0e8] text-[#a55025]'
              }`}
            >
              ● {isOnline ? 'Live' : 'Saved'}
            </span>

          </div>

          {/* Error */}

          {queueError && (
            <div className="mt-5 rounded-lg bg-[#fff0e8] p-4 text-sm font-semibold text-[#a55025]">
              {queueError}
            </div>
          )}

          {/* Queue Stats */}

          {!queueError && (
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">

              <div className="rounded-lg bg-[#f5f9f7] p-4">

                <p className="text-xs text-[#8a9b98]">
                  Farmers ahead
                </p>

                <strong className="mt-2 block text-2xl font-black text-[#16352c]">
                  {loadingQueue
                    ? '...'
                    : queueInfo.aheadInQueue}
                </strong>

              </div>

              <div className="rounded-lg bg-[#f5f9f7] p-4">

                <p className="text-xs text-[#8a9b98]">
                  Est. wait
                </p>

                <strong className="mt-2 block text-2xl font-black text-[#16352c]">
                  {loadingQueue
                    ? '...'
                    : queueInfo.estimatedWait}
                </strong>

              </div>

              <div className="col-span-2 rounded-lg bg-[#edf8f3] p-4 sm:col-span-1">

                <p className="text-xs text-[#6e9b8d]">
                  Next step
                </p>

                <strong className="mt-2 block text-sm font-black text-[#147557]">
                  Gate verification
                </strong>

              </div>

            </div>
          )}

          {/* Last updated */}

          <p className="mt-5 text-[11px] text-[#94a5a1]">

            Last updated{' '}

            {updatedAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}

            . Saved snapshot:{' '}

            {lastSync.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}

            .

          </p>

          {/* Status Button */}

          <button
            onClick={() => navigate('/status')}
            className="mt-5 rounded-lg bg-[#08a979] px-4 py-3 text-sm font-bold text-white hover:bg-[#078e67]"
          >
            View payment & order status

            <span className="ml-2">
              →
            </span>

          </button>

        </section>

      </div>
    </DashboardLayout>
  )
}