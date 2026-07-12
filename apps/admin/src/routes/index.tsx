import { createFileRoute } from '@tanstack/react-router';
import { Card, Logo } from '@mfranceschit/ui';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <Card>
      <Logo variant="navy" />
      <p>Admin studio scaffold.</p>
    </Card>
  );
}
