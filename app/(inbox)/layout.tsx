import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {children}
    </div>
  )
}
