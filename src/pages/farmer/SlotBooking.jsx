import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { Field } from '../../components/FarmerShell'
import { useApp } from '../../context/AppContext'
import API from '../../api'

function dateOptions() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)

    return {
      value: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString('en-IN', {
        weekday: 'short',
      }),
      number: date.getDate(),
      month: date.toLocaleDateString('en-IN', {
        month: 'short',
      }),
    }
  })
}

function formatTime(time) {
  if (!time) return ''

  const [hours, minutes] = time.split(':')
  const date = new Date()

  date.setHours(Number(hours), Number(minutes), 0)

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SlotBooking() {
  const navigate = useNavigate()

  const {
    saveProduce,
    saveBooking,
    farmer,
    produce,
  } = useApp()

  const dates = dateOptions()

  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [slotError, setSlotError] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const [bookingData, setBookingData] = useState({
    crop: produce?.crop || '',
    quantity: produce?.quantity || '',
    slotId: '',
    date: '',
    timeSlot: '',
  })

  useEffect(() => {
    API.get('/slots')
      .then((response) => {
        setSlots(response.data)
        setSlotError('')
      })
      .catch((error) => {
        console.error('Could not load slots:', error)
        setSlotError('Could not load available procurement slots.')
      })
      .finally(() => {
        setLoadingSlots(false)
      })
  }, [])

  const selectedDateSlots = slots.filter(
    (slot) => slot.slot_date === bookingData.date
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    const selectedSlot = slots.find(
      (slot) => String(slot.id) === String(bookingData.slotId)
    )

    if (!selectedSlot) {
      window.alert('Please select an available slot.')
      return
    }

    if (!farmer?.id) {
      window.alert('Farmer information is missing. Please login again.')
      navigate('/login')
      return
    }

    setIsBooking(true)

    try {
      const response = await API.post('/bookings', {
        farmer_id: farmer.id,
        slot_id: selectedSlot.id,
      })

      console.log('Booking created:', response.data)
      console.log(
        'Digital token:',
        response.data.booking.booking_token
      )
      console.log(
        'Booking ID:',
        response.data.booking.id
      )
      console.log(
        'Booked at:',
        response.data.booking.booked_at
      )

      const batch = {
        crop: bookingData.crop,
        quantity: bookingData.quantity,
      }

      const booking = response.data.booking

      const localBooking = {
        ...bookingData,
        id: booking.id,
        tokenNumber: booking.booking_token,
        bookedAt: booking.booked_at,
        farmerName: farmer.name || 'Farmer',
        createdAt: new Date().toISOString(),
        slot: selectedSlot,
      }

      saveProduce(batch)

      saveBooking({
        ...localBooking,
        batch,
      })

      window.alert('Booking confirmed successfully!')

      navigate('/queue')
    } catch (error) {
      console.error('Booking failed:', error)

      console.error(
        'Backend error:',
        error.response?.data
      )

      window.alert(
        error.response?.data?.detail ||
        'Could not create booking. Please try again.'
      )
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <DashboardLayout
      title="Book Procurement Slot"
      subtitle="Choose where and when your produce will be received."
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-[#dfe8e5] bg-white p-6 shadow-[0_5px_18px_rgba(25,55,48,0.04)] sm:p-8">

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
            Protected booking flow
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#142a24]">
            Book your procurement slot
          </h2>

          <p className="mt-1 text-sm text-[#829490]">
            Add your batch details, then choose an arrival window.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-7">

          {/* Step 1 */}

          <section className="rounded-xl border border-[#dfe8e5] bg-[#fbfdfc] p-5">

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
              Step 1: Batch Details
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">

              <Field label="Crop Type">
                <input
                  className="w-full rounded-lg border border-[#d6e2df] bg-white px-3.5 py-3 text-sm text-[#1c302b] outline-none transition placeholder:text-[#9badab] focus:border-[#12ae80] focus:ring-4 focus:ring-[#12ae80]/10"
                  type="text"
                  placeholder="e.g. Wheat, Paddy, Soybean"
                  value={bookingData.crop}
                  onChange={(event) =>
                    setBookingData({
                      ...bookingData,
                      crop: event.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Estimated Quantity (in Quintals)">
                <input
                  className="w-full rounded-lg border border-[#d6e2df] bg-white px-3.5 py-3 text-sm text-[#1c302b] outline-none transition placeholder:text-[#9badab] focus:border-[#12ae80] focus:ring-4 focus:ring-[#12ae80]/10"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="e.g. 45"
                  value={bookingData.quantity}
                  onChange={(event) =>
                    setBookingData({
                      ...bookingData,
                      quantity: event.target.value,
                    })
                  }
                  required
                />
              </Field>

            </div>
          </section>

          {/* Step 2 */}

          <section className="rounded-xl border border-[#dfe8e5] bg-[#fbfdfc] p-5">

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
              Step 2: Arrival Plan
            </p>

            {loadingSlots && (
              <div className="mt-5 rounded-lg border border-[#d6e2df] bg-white p-5 text-center text-sm text-[#71847f]">
                Loading available slots...
              </div>
            )}

            {slotError && !loadingSlots && (
              <div className="mt-5 rounded-lg bg-[#fff0e8] p-4 text-sm font-semibold text-[#a55025]">
                {slotError}
              </div>
            )}

            {!loadingSlots && !slotError && (
              <>
                <Field label="Select arrival date">

                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">

                    {dates.map((date) => {
                      const hasSlots = slots.some(
                        (slot) => slot.slot_date === date.value
                      )

                      let dateClass =
                        'cursor-not-allowed border-[#e8eeec] bg-[#f5f7f6] text-[#b1bfbb]'

                      if (hasSlots) {
                        dateClass =
                          'border-[#d6e2df] text-[#48625a] hover:border-[#8ccdb8]'
                      }

                      if (bookingData.date === date.value) {
                        dateClass =
                          'border-[#0eaa7a] bg-[#0d3d34] text-white'
                      }

                      return (
                        <button
                          type="button"
                          key={date.value}
                          disabled={!hasSlots}
                          onClick={() =>
                            setBookingData({
                              ...bookingData,
                              date: date.value,
                              slotId: '',
                              timeSlot: '',
                            })
                          }
                          className={`rounded-lg border px-2 py-3 text-center transition ${dateClass}`}
                        >
                          <span className="block text-[10px] font-bold uppercase">
                            {date.day}
                          </span>

                          <strong className="mt-1 block text-lg">
                            {date.number}
                          </strong>

                          <span className="block text-[10px]">
                            {date.month}
                          </span>
                        </button>
                      )
                    })}

                  </div>

                </Field>

                <div className="mt-6">

                  <Field label="Available time slots">

                    {!bookingData.date && (
                      <div className="mt-3 rounded-lg border border-[#d6e2df] bg-white p-4 text-sm text-[#71847f]">
                        Please select an arrival date first.
                      </div>
                    )}

                    {bookingData.date &&
                      selectedDateSlots.length === 0 && (
                        <div className="mt-3 rounded-lg border border-[#d6e2df] bg-white p-4 text-sm text-[#71847f]">
                          No procurement slots are available for this date.
                        </div>
                      )}

                    {bookingData.date &&
                      selectedDateSlots.length > 0 && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">

                          {selectedDateSlots.map((slot) => {
                            const available =
                              slot.max_capacity - slot.booked_count

                            const isFull = available <= 0

                            let slotClass =
                              'border-[#d6e2df] bg-white hover:border-[#8ccdb8]'

                            if (isFull) {
                              slotClass =
                                'cursor-not-allowed border-[#e8eeec] bg-[#f5f7f6]'
                            }

                            if (
                              bookingData.slotId === String(slot.id)
                            ) {
                              slotClass =
                                'border-[#0eaa7a] bg-[#edf9f4] ring-2 ring-[#0eaa7a]/10'
                            }

                            return (
                              <button
                                type="button"
                                key={slot.id}
                                disabled={isFull}
                                onClick={() =>
                                  setBookingData({
                                    ...bookingData,
                                    slotId: String(slot.id),
                                    timeSlot: `${slot.start_time} - ${slot.end_time}`,
                                  })
                                }
                                className={`rounded-lg border p-4 text-left transition ${slotClass}`}
                              >

                                <strong className="block text-sm text-[#234039]">
                                  {formatTime(slot.start_time)} -{' '}
                                  {formatTime(slot.end_time)}
                                </strong>

                                <span
                                  className={`mt-2 block text-xs font-semibold ${
                                    isFull
                                      ? 'text-[#a55025]'
                                      : 'text-[#15946e]'
                                  }`}
                                >
                                  ●{' '}
                                  {isFull
                                    ? 'Fully booked'
                                    : `${available} spots available`}
                                </span>

                              </button>
                            )
                          })}

                        </div>
                      )}

                  </Field>

                </div>
              </>
            )}

          </section>

          {/* Submit */}

          <button
            type="submit"
            disabled={
              !bookingData.crop.trim() ||
              !bookingData.quantity ||
              Number(bookingData.quantity) <= 0 ||
              !bookingData.slotId ||
              loadingSlots ||
              isBooking
            }
            className="w-full rounded-lg bg-[#08a979] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#078e67] disabled:cursor-not-allowed disabled:bg-[#a9c9bf]"
          >
            {isBooking
              ? 'Confirming booking...'
              : 'Confirm & Generate Digital Token'}

            {!isBooking && (
              <span className="ml-2">
                →
              </span>
            )}
          </button>

        </form>
      </div>
    </DashboardLayout>
  )
}