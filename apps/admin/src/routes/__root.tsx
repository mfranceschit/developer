import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { createToaster, Toaster } from '@mfranceschit/ui';
import { NavShell } from '../widgets/NavShell/NavShell';
import '../styles/global.css';

interface RouterContext {
  queryClient: QueryClient;
  toaster: ReturnType<typeof createToaster>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, toaster } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Admin</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <NavShell>
            <Outlet />
          </NavShell>
          <Toaster toaster={toaster} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
