import { useQuery } from '@tanstack/react-query';
import { getDashboardFn } from '@/server/functions/dashboard';
import type { DashboardData } from '@/shared/lib/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardFn() as Promise<DashboardData>,
  });
}
