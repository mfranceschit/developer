import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { createToaster } from '@mfranceschit/ui';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient();
  const toaster = createToaster({ placement: 'bottom-end' });
  return createRouter({
    routeTree,
    context: { queryClient, toaster },
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
