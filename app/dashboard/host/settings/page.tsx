import { redirect } from 'next/navigation';

// Redirect old host settings to new club management page
export default function HostSettingsPage() {
  redirect('/dashboard/host/club');
}
