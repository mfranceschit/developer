import {
  Button,
  Card,
  Combobox,
  DatePicker,
  FormField,
  Input,
  NumberInput,
  Select,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useDocumentList } from '@/features/content/queries';
import {
  useBusinessProfile,
  useCreateInvoice,
  useInvoice,
  usePatchInvoice,
} from '@/features/invoices/queries';
import { formatInvoiceNumber } from '@/shared/lib/format';
import { calculateInvoiceTotals } from '@/shared/lib/invoiceTotals';
import type { Client, DocumentStatus, Invoice } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { InvoiceSummaryCard } from '@/widgets/InvoiceSummaryCard/InvoiceSummaryCard';

export const Route = createFileRoute('/invoices/$id')({
  component: InvoiceEditPage,
});

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const lineItemSchema = z.object({
  quantity: z.string().min(1),
  description: z.string().min(1),
  unitPrice: z.string().min(1),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string(),
  currency: z.string().min(1),
  taxRate: z.string(),
  lineItems: z.array(lineItemSchema),
  notes: z.string(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

function toFormValues(invoice?: Invoice | null): InvoiceFormValues {
  return {
    clientId: invoice?.client._ref ?? '',
    issueDate: invoice?.issueDate ?? new Date().toISOString().slice(0, 10),
    dueDate: invoice?.dueDate ?? '',
    currency: invoice?.currency ?? 'USD',
    taxRate: invoice?.taxRate !== undefined ? String(invoice.taxRate) : '0',
    lineItems: invoice?.lineItems.map((item) => ({
      quantity: String(item.quantity),
      description: item.description,
      unitPrice: String(item.unitPrice),
    })) ?? [{ quantity: '1', description: '', unitPrice: '0' }],
    notes: invoice?.notes ?? '',
  };
}

function InvoiceEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: invoice } = useInvoice(isNew ? '' : id);
  const { data: clients } = useDocumentList<Client & { _status: DocumentStatus }>('client');
  const { data: businessProfile } = useBusinessProfile();
  const createInvoice = useCreateInvoice();
  const patchInvoice = usePatchInvoice();

  const locked = !isNew && invoice?.status !== 'draft' && invoice !== undefined;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    values: toFormValues(invoice),
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  const watchedLineItems = useWatch({ control, name: 'lineItems' }) ?? [];
  const watchedTaxRate = useWatch({ control, name: 'taxRate' });
  const watchedCurrency = useWatch({ control, name: 'currency' });
  const liveTotals = calculateInvoiceTotals(
    watchedLineItems.map((item) => ({
      quantity: Number(item.quantity) || 0,
      description: item.description,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    Number(watchedTaxRate) || 0,
  );

  const saving = createInvoice.isPending || patchInvoice.isPending;

  async function onSubmit(values: InvoiceFormValues) {
    if (locked) return;

    const client = clients?.find((c) => c._id === values.clientId);
    if (!client || !businessProfile) return;

    const lineItems = values.lineItems.map((item) => ({
      quantity: Number(item.quantity),
      description: item.description,
      unitPrice: Number(item.unitPrice),
    }));
    const taxRate = Number(values.taxRate);
    const totals = calculateInvoiceTotals(lineItems, taxRate);

    const doc = {
      issuerSnapshot: {
        name: businessProfile.name,
        taxId: businessProfile.taxId,
        address: businessProfile.address,
        phone: businessProfile.phone,
        email: businessProfile.email,
      },
      client: { _ref: client._id, _type: 'reference' as const },
      clientSnapshot: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        currency: client.currency,
      },
      issueDate: values.issueDate,
      dueDate: values.dueDate || undefined,
      currency: values.currency,
      lineItems,
      taxRate,
      notes: values.notes || undefined,
      status: 'draft' as const,
      totals,
    };

    if (isNew) {
      const created = await createInvoice.mutateAsync(doc);
      navigate({ to: '/invoices/$id', params: { id: created._id } });
    } else {
      await patchInvoice.mutateAsync({ id, patch: doc });
    }
  }

  async function markAs(status: 'sent' | 'paid') {
    if (isNew) return;
    await patchInvoice.mutateAsync({ id, patch: { status } });
  }

  return (
    <EditorLayout
      header={{
        eyebrow: 'Billing · Invoice',
        title: isNew ? 'New invoice' : invoice ? formatInvoiceNumber(invoice) : 'Invoice',
        backLink: { label: 'Invoices', onClick: () => navigate({ to: '/invoices' }) },
      }}
      aside={
        <InvoiceSummaryCard
          status={invoice?.status ?? 'draft'}
          currency={watchedCurrency || 'USD'}
          subtotal={liveTotals.subtotal}
          vat={liveTotals.vat}
          total={liveTotals.total}
          taxRate={Number(watchedTaxRate) || 0}
          locked={locked}
          saving={saving}
          onSave={handleSubmit(onSubmit)}
          onMarkSent={() => markAs('sent')}
          issuer={
            businessProfile
              ? {
                  name: businessProfile.name,
                  email: businessProfile.email,
                  taxId: businessProfile.taxId,
                }
              : undefined
          }
          onEditIssuer={() => navigate({ to: '/settings/business-profile' })}
        />
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Billing</h2>
          <FormField label="Client" required error={errors.clientId?.message}>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Combobox
                  items={clients ?? []}
                  itemToString={(item: Client) => item.name}
                  itemToValue={(item: Client) => item._id}
                  value={field.value ? [field.value] : []}
                  onValueChange={(value) => field.onChange(value[0] ?? '')}
                  disabled={locked}
                />
              )}
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Issue date" required error={errors.issueDate?.message}>
              <Controller
                control={control}
                name="issueDate"
                render={({ field }) => (
                  <DatePicker value={field.value} onValueChange={field.onChange} disabled={locked} />
                )}
              />
            </FormField>
            <FormField label="Due date" error={errors.dueDate?.message}>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker value={field.value} onValueChange={field.onChange} disabled={locked} />
                )}
              />
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
                    disabled={locked}
                  />
                )}
              />
            </FormField>
            <FormField label="Tax rate (%)" error={errors.taxRate?.message}>
              <Controller
                control={control}
                name="taxRate"
                render={({ field }) => (
                  <NumberInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                    min={0}
                    disabled={locked}
                  />
                )}
              />
            </FormField>
          </div>
        </Card>

        <Card padding="24px" className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Line items</h2>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="w-20">
                <Controller
                  control={control}
                  name={`lineItems.${index}.quantity`}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                      min={0}
                      disabled={locked}
                    />
                  )}
                />
              </div>
              <Input
                {...register(`lineItems.${index}.description`)}
                className="flex-1"
                placeholder="Description"
                disabled={locked}
              />
              <div className="w-28">
                <Controller
                  control={control}
                  name={`lineItems.${index}.unitPrice`}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                      min={0}
                      step={0.01}
                      disabled={locked}
                    />
                  )}
                />
              </div>
              {!locked && (
                <Button variant="outline" size="sm" type="button" onClick={() => remove(index)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          {!locked && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => append({ quantity: '1', description: '', unitPrice: '0' })}
              className="self-start"
            >
              + Add line item
            </Button>
          )}
        </Card>

        <Card padding="24px" className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Notes</h2>
          <FormField label="Notes" error={errors.notes?.message}>
            <Input as="textarea" {...register('notes')} disabled={locked} />
          </FormField>
        </Card>
      </form>
    </EditorLayout>
  );
}
