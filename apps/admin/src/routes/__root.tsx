import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { createToaster, Toaster } from '@mfranceschit/ui';
import { NavShell } from '@/widgets/NavShell/NavShell';
import '@/styles/global.css';

interface RouterContext {
  queryClient: QueryClient;
  toaster: ReturnType<typeof createToaster>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Not found.</p>
  ),
});

function RootComponent() {
  const { queryClient, toaster } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Admin</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <NavShell>
            <Outlet />
          </NavShell>
          <Toaster toaster={toaster} />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
