import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { eventsAPI } from '../services/api'

const EventCard = ({ event, onUpdate, canManage = false }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const isRSVP = event.rsvps?.some(rsvp => rsvp._id === user?.id)
  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()

  const handleRSVP = async () => {
    try {
      setLoading(true)
      if (isRSVP) {
        await eventsAPI.unrsvp(event._id)
      } else {
        await eventsAPI.rsvp(event._id)
      }
      onUpdate()
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
          <p className="text-gray-600 text-sm">{event.description}</p>
        </div>
        
        {isRSVP && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            RSVP'd
          </span>
        )}
      </div>

      {/* Event Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(eventDate)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(eventDate)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>{event.rsvps?.length || 0} attendees</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isUpcoming && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Past Event
            </span>
          )}
        </div>

        {isUpcoming && (
          <button
            onClick={handleRSVP}
            disabled={loading}
            className={`inline-flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRSVP
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : isRSVP ? (
              <>
                <XCircle className="h-4 w-4" />
                <span>Cancel RSVP</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>RSVP</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default EventCard
