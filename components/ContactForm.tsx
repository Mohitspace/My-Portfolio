'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('website')) return // honeypot
    setState('sending')
    const { error } = await createClient().from('messages').insert({
      name: String(f.get('name')).trim(),
      email: String(f.get('email')).trim(),
      subject: String(f.get('subject') || '').trim() || null,
      body: String(f.get('body')).trim(),
    })
    if (error) return setState('err')
    form.reset()
    setState('ok')
  }

  return (
    <form className="cform" onSubmit={submit}>
      <div className="two">
        <label className="f">
          Your Name *
          <input
            name="name"
            placeholder="e.g. John Doe"
            required
            maxLength={120}
            autoComplete="name"
          />
        </label>
        <label className="f">
          Your Email *
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
      </div>

      <label className="f">
        Subject
        <input
          name="subject"
          placeholder="Resource question, video suggestion, collaboration..."
          maxLength={200}
        />
      </label>

      <label className="f">
        Your Message *
        <textarea
          name="body"
          placeholder="How can we help or what topic would you like to see covered?"
          required
          maxLength={5000}
          rows={5}
        />
      </label>

      {/* Honeypot field for anti-spam */}
      <input
        name="website"
        className="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <button
          className="btn pri"
          disabled={state === 'sending'}
          style={{ minWidth: 180 }}
        >
          {state === 'sending' ? (
            <>
              <span className="spinner" /> Sending message...
            </>
          ) : (
            <>
              <span>✦</span> Send Message
            </>
          )}
        </button>
      </div>

      {state === 'ok' && (
        <div className="msg ok" role="status" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>✓</span>
          <div>
            <strong>Message received!</strong>
            <p style={{ fontSize: '0.86rem', marginTop: 2 }}>
              Thank you for reaching out. We will get back to you as soon as possible.
            </p>
          </div>
        </div>
      )}

      {state === 'err' && (
        <div className="msg" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>✕</span>
          <div>
            <strong>Message could not be sent.</strong>
            <p style={{ fontSize: '0.86rem', marginTop: 2 }}>
              Please check your connection and try again in a moment.
            </p>
          </div>
        </div>
      )}
    </form>
  )
}
