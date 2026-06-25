'use client'

import { Suspense } from 'react'

// Phase 2 (Task 4) implements the smart-list table + contact detail drawer.
function ContactsInner() {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
      Contacts table — coming up next
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsInner />
    </Suspense>
  )
}
