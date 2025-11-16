'use client'

import { useState } from 'react'

export default function ConnectStripeButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/connect/create-link', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create Stripe Connect link')
        setLoading(false)
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Connecting...' : 'Connect with Stripe'}
    </button>
  )
}
