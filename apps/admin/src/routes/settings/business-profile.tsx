import { Button, Card, FormField, Input } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBusinessProfile, useUpsertBusinessProfile } from '@/features/invoices/queries';
import type { BusinessProfile } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';

export const Route = createFileRoute('/settings/business-profile')({
  component: BusinessProfilePage,
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  taxId: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email('Must be a valid email'),
});

type BusinessProfileFormValues = z.infer<typeof formSchema>;

function toFormValues(profile?: BusinessProfile | null): BusinessProfileFormValues {
  return {
    name: profile?.name ?? '',
    taxId: profile?.taxId ?? '',
    address: profile?.address ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
  };
}

function BusinessProfilePage() {
  const { data: profile } = useBusinessProfile();
  const upsert = useUpsertBusinessProfile();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessProfileFormValues>({
    values: toFormValues(profile),
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: BusinessProfileFormValues) {
    await upsert.mutateAsync(values);
    toaster.create({ title: 'Business profile saved', type: 'success' });
  }

  return (
    <EditorLayout
      header={{
        eyebrow: 'Billing · Settings',
        title: 'Business Profile',
        backLink: { label: 'Dashboard', onClick: () => navigate({ to: '/' }) },
      }}
      aside={
        <Card padding="20px 24px" className="flex flex-col gap-3.5">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Profile</h2>
          <p className="font-sans text-[13px] text-[var(--text-muted)]">
            Reused as the issuer on every new invoice.
          </p>
          <Button fullWidth onClick={handleSubmit(onSubmit)} disabled={upsert.isPending}>
            {upsert.isPending ? 'Saving…' : 'Save'}
          </Button>
        </Card>
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <div>
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Issuer details
            </h2>
            <p className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">
              Reused as the issuer on every new invoice.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Tax ID" error={errors.taxId?.message}>
              <Input {...register('taxId')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register('email')} />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            <Input as="textarea" {...register('address')} />
          </FormField>
        </Card>
      </form>
    </EditorLayout>
  );
}
