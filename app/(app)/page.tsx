'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/inbox/Sidebar'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ThreadPane } from '@/components/inbox/ThreadPane'
import { ContactPanel } from '@/components/conversations/ContactPanel'
import type { BrandId, Channel } from '@/lib/constants'

function ConversationsInner() {
  const params = useSearchParams()
  const brand = (params.get('brand') as BrandId | null) ?? null
  const deepLinkConv = params.get('c')

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('open')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(deepLinkConv)

  // Honour a ?c= deep-link (e.g. from the Contacts drawer).
  useEffect(() => {
    if (deepLinkConv) setSelectedConversationId(deepLinkConv)
  }, [deepLinkConv])

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        selectedBrand={brand}
        onBrandChange={() => {}}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <ConversationList
        brand={brand}
        channel={selectedChannel}
        status={selectedStatus}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
      />
      <ThreadPane
        conversationId={selectedConversationId}
        onConversationClosed={() => setSelectedConversationId(null)}
      />
      <ContactPanel conversationId={selectedConversationId} />
    </div>
  )
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={null}>
      <ConversationsInner />
    </Suspense>
  )
}
