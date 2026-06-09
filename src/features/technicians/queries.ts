import { hasSupabaseConfig } from '@/lib/supabase/config';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server';

export interface TechnicianRow {
  id: string;
  display_name: string;
  phone: string;
  availability_status: string;
  rating: number | null;
}

export interface TechnicianCapabilities {
  skills: string[];
  areas: string[];
}

const mockTechnicians: TechnicianRow[] = [
  { id: 'mock-tech-1', display_name: 'Hasan Ali', phone: '01711111111', availability_status: 'available', rating: 4.8 },
  { id: 'mock-tech-2', display_name: 'Mizan Rahman', phone: '01822222222', availability_status: 'on_job', rating: 4.7 },
  { id: 'mock-tech-3', display_name: 'Rafiq Islam', phone: '01933333333', availability_status: 'available', rating: 4.9 }
];

export async function getTechnicians() {
  if (!hasSupabaseConfig()) return mockTechnicians;

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    supabase = await createServerSupabaseClient();
  }

  const { data, error } = await supabase
    .from('technician_profiles')
    .select('*')
    .order('display_name', { ascending: true });

  if (error) {
    return [];
  }

  return (data || []) as TechnicianRow[];
}

export async function getTechnicianById(id: string) {
  if (!hasSupabaseConfig()) {
    return mockTechnicians.find((technician) => technician.id === id) || null;
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    supabase = await createServerSupabaseClient();
  }

  const { data, error } = await supabase
    .from('technician_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as TechnicianRow;
}

export async function getTechnicianCapabilities(id: string): Promise<TechnicianCapabilities> {
  if (!hasSupabaseConfig()) {
    return {
      skills: ['AC Service', 'Refrigerator Repair', 'Washing Machine'],
      areas: ['Mirpur', 'Banani', 'Gulshan']
    };
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    supabase = await createServerSupabaseClient();
  }

  const [skillsResult, areasResult] = await Promise.all([
    supabase
      .from('technician_skills')
      .select('service_categories(title)')
      .eq('technician_id', id),
    supabase
      .from('technician_service_areas')
      .select('service_areas(name)')
      .eq('technician_id', id)
  ]);

  if (skillsResult.error || areasResult.error) {
    return { skills: [], areas: [] };
  }

  return {
    skills: ((skillsResult.data || []) as CapabilityJoinRow[])
      .map((row) => normalizeJoinValue(row.service_categories, 'title'))
      .filter(Boolean),
    areas: ((areasResult.data || []) as AreaJoinRow[])
      .map((row) => normalizeJoinValue(row.service_areas, 'name'))
      .filter(Boolean)
  };
}

type CapabilityJoinRow = {
  service_categories: { title: string } | { title: string }[] | null;
};

type AreaJoinRow = {
  service_areas: { name: string } | { name: string }[] | null;
};

function normalizeJoinValue<T extends 'title' | 'name'>(
  value: Record<T, string> | Record<T, string>[] | null,
  key: T
) {
  if (!value) return '';
  const row = Array.isArray(value) ? value[0] : value;
  return row?.[key] || '';
}
