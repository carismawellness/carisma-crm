import { redirect } from 'next/navigation'

// Back-compat: the Tasks module was absorbed into Opportunities.
export default function TasksRedirect() {
  redirect('/opportunities')
}
