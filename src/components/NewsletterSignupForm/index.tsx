'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import { getClientSideURL } from '@/utilities/getURL'

type Status = 'idle' | 'loading' | 'success' | 'error'

export const NewsletterSignupForm: React.FC<{ className?: string }> = ({ className }) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  // Honeypot: left blank by real visitors, filled in by bots that autofill every field.
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const req = await fetch(`${getClientSideURL()}/api/newsletter-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, companyWebsite }),
      })

      const res = await req.json().catch(() => ({}))

      if (!req.ok) {
        setError(res?.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch (err) {
      console.warn(err)
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className={cn('text-sm text-foreground', className)}>
        You&apos;re subscribed — thanks for signing up.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn('space-y-3', className)} noValidate>
      <div>
        <label htmlFor="newsletter-first-name" className="sr-only">
          First name
        </label>
        <Input
          id="newsletter-first-name"
          name="firstName"
          type="text"
          placeholder="First name (optional)"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-company-website">Website</label>
        <input
          id="newsletter-company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  )
}
