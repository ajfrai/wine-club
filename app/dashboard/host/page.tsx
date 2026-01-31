import { redirect } from 'next/navigation';

export default function HostDashboardPage() {
  // Redirect to club management since hosts and clubs are one-to-one
  redirect('/dashboard/host/club');
}
