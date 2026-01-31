import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MemberDuesView from '@/components/member/MemberDuesView';

export default async function MemberDuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <MemberDuesView />;
}
