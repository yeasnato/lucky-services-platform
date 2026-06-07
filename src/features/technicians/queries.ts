import { hasSupabaseConfig } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface TechnicianRow {
  id: string;
  display_name: string;
  phone: string;
  availability_status: string;
  rating: number | null;
}

const mockTechnicians: TechnicianRow[] = [
  { id: 'mock-tech-1', display_name: 'Hasan Ali', phone: '01711111111', availability_status: 'available', rating: 4.8 },
  { id: 'mock-tech-2', display_name: 'Mizan Rahman', phone: '01822222222', availability_status: 'on_job', rating: 4.7 },
  { id: 'mock-tech-3', display_name: 'Rafiq Islam', phone: '01933333333', availability_status: 'available', rating: 4.9 }
];

export async function getTechnicians() {
  if (!hasSupabaseConfig()) return mockTechnicians;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('technician_profiles')
    .select('*')
    .order('display_name', { ascending: true });

  if (error) throw error;
  return (data || []) as TechnicianRow[];
}
