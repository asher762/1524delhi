import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { NewsletterSignupForm } from '@/components/NewsletterSignupForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { EnquireLink } from './EnquireLink'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const enquireUrl = (footerData as any)?.enquireUrl || 'mailto:sales@1524delhi.com'
  const privacyPolicyUrl = (footerData as any)?.privacyPolicyUrl || '/privacy-policy'
  const copyright = (footerData as any)?.copyright || 'Copyright © 1524 Delhi 2020'
  const facebookUrl = (footerData as any)?.facebookUrl || 'https://facebook.com'
  const instagramUrl = (footerData as any)?.instagramUrl || 'https://instagram.com'

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground min-h-[33vh] flex flex-col">
      {/* Top section – grows to fill available height */}
      <div className="flex-1 w-full container flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 py-10 md:py-0">
        {/* Left: envelope icon + enquire text */}
        <EnquireLink href={enquireUrl} />

        {/* Right: newsletter signup */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-base md:text-lg tracking-wide hover:opacity-80 transition-opacity duration-200 text-center md:text-right"
            >
              <span className="font-semibold text-foreground">Signup</span>
              <span className="text-foreground/60"> to our newsletter</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Newsletter Signup</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              <NewsletterSignupForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Bottom row – copyright, nav links, social icons */}
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright + nav links */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-foreground/55 text-center md:text-left">
          <span>{copyright}</span>
          <Link
            href={privacyPolicyUrl}
            className="hover:text-foreground transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Theme selector + social icons */}
        <div className="flex items-center gap-5 md:gap-4">
          <ThemeSelector />
          {/* Facebook */}
          <Link
            href={facebookUrl}
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 hover:text-foreground transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </Link>

          {/* Instagram */}
          <Link
            href={instagramUrl}
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 hover:text-foreground transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  )
}
