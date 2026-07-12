import { Button, FormField, Input } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBusinessProfile, useUpsertBusinessProfile } from '../../features/invoices/queries';
import type { BusinessProfile } from '../../shared/types';

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
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
        Business Profile
      </h1>
      <p className="font-sans text-sm text-[var(--text-muted)]">
        Reused as the issuer on every new invoice.
      </p>

      <FormField label="Name" required error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>
      <FormField label="Tax ID" error={errors.taxId?.message}>
        <Input {...register('taxId')} />
      </FormField>
      <FormField label="Address" error={errors.address?.message}>
        <Input as="textarea" {...register('address')} />
      </FormField>
      <FormField label="Phone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>
      <FormField label="Email" required error={errors.email?.message}>
        <Input {...register('email')} />
      </FormField>

      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
