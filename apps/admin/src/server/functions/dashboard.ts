import { createServerFn } from '@tanstack/react-start';
import { getDashboard } from '@/server/sanity/dashboard';

export const getDashboardFn = createServerFn({ method: 'GET', strict: { output: false } }).handler(
  async () => getDashboard(),
);
