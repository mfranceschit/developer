import { Button, FormField, Input, NumberInput, Select } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '../../features/content/queries';
import type { Client, DocumentStatus } from '../../shared/types';
import { DocumentToolbar } from '../../widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/clients/$id')({
  component: ClientEditPage,
});

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  phone: z.string(),
  address: z.string(),
  taxId: z.string(),
  currency: z.string().min(1, 'Currency is required'),
  defaultRate: z.string(),
});

type ClientFormValues = z.infer<typeof formSchema>;

function toFormValues(client?: Client | null): ClientFormValues {
  return {
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    taxId: client?.taxId ?? '',
    currency: client?.currency ?? 'USD',
    defaultRate: client?.defaultRate !== undefined ? String(client.defaultRate) : '',
  };
}

function ClientEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: client } = useDocument<Client & { _status: DocumentStatus }>(
    'client',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Client>('client');
  const patchDraft = usePatchDraft<Client>();
  const publish = usePublish();
  const discard = useDiscard();

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ClientFormValues>({
    values: toFormValues(client),
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: ClientFormValues) {
    const doc = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      taxId: values.taxId || undefined,
      currency: values.currency,
      defaultRate: values.defaultRate ? Number(values.defaultRate) : undefined,
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/clients/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New client' : client?.name}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={client?._status ?? 'draft'}
            dirty={isDirty}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )}
      </div>

      <FormField label="Name" required error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Email" required error={errors.email?.message}>
        <Input {...register('email')} />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>

      <FormField label="Address" error={errors.address?.message}>
        <Input as="textarea" {...register('address')} />
      </FormField>

      <FormField label="Tax ID" error={errors.taxId?.message}>
        <Input {...register('taxId')} />
      </FormField>

      <FormField label="Currency" required error={errors.currency?.message}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select
              items={CURRENCIES}
              itemToString={(item: string) => item}
              itemToValue={(item: string) => item}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0] ?? '')}
            />
          )}
        />
      </FormField>

      <FormField
        label="Default rate"
        hint="Optional, per-hour or per-project"
        error={errors.defaultRate?.message}
      >
        <Controller
          control={control}
          name="defaultRate"
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
              min={0}
              step={0.01}
            />
          )}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
