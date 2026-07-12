"use client";

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import BookingForm from './BookingForm';
import { Booking } from '@/store/bookingStore';
import { toast } from 'sonner';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ResourceCalendar({ bookings }: { bookings: Booking[] }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();

  const events = bookings.map(b => ({
    title: b.purpose || 'Booked',
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    resource: b.resourceAssetId,
    status: b.status
  }));

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlot(start);
    setShowForm(true);
  };

  const handleSelectEvent = (event: any) => {
    toast(`Booking: ${event.title} (${event.status})`);
  };

  const eventPropGetter = (event: any) => {
    let backgroundColor = '#312e81'; // Upcoming - Indigo 900
    if (event.status === 'Ongoing') backgroundColor = '#065f46'; // Emerald 900
    if (event.status === 'Completed') backgroundColor = '#334155'; // Slate 700
    if (event.status === 'Cancelled') backgroundColor = '#7f1d1d'; // Red 900

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0',
        fontSize: '0.8rem',
      }
    };
  };

  return (
    <div className="h-[600px] bg-transparent rounded-lg p-2 custom-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={['week', 'day']}
        step={30}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        className="text-slate-200"
      />
      
      {showForm && (
        <BookingForm selectedDate={selectedSlot} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
