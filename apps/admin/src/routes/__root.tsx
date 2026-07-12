import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Admin</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
