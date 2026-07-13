import { Button, DatePicker, FormField, ImageUploader, Input, LocaleField } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '@/features/content/queries';
import { uploadImageAssetFn } from '@/server/functions/upload';
import { sanityImageUrl } from '@/shared/lib/sanityImage';
import type { Certification, DocumentStatus } from '@/shared/types';
import { DocumentToolbar } from '@/widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/certifications/$id')({
  component: CertificationEditPage,
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  issuedEn: z.string(),
  issuedEs: z.string(),
  issuedPt: z.string(),
  imageAlt: z.string(),
});

type CertificationFormValues = z.infer<typeof formSchema>;

function toFormValues(certification?: Certification | null): CertificationFormValues {
  return {
    name: certification?.name ?? '',
    date: certification?.date ?? '',
    url: certification?.url ?? '',
    issuedEn: certification?.issued.en ?? '',
    issuedEs: certification?.issued.es ?? '',
    issuedPt: certification?.issued.pt ?? '',
    imageAlt: certification?.image.alt ?? '',
  };
}

function CertificationEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: certification } = useDocument<Certification & { _status: DocumentStatus }>(
    'certification',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Certification>('certification');
  const patchDraft = usePatchDraft<Certification>();
  const publish = usePublish();
  const discard = useDiscard();
  const [uploadedAsset, setUploadedAsset] = useState<Certification['image']['asset'] | undefined>(
    undefined,
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<CertificationFormValues>({
    values: toFormValues(certification),
    resolver: zodResolver(formSchema),
  });

  const [issuedEn, issuedEs, issuedPt] = useWatch({
    control,
    name: ['issuedEn', 'issuedEs', 'issuedPt'],
  });

  async function onSubmit(values: CertificationFormValues) {
    const doc = {
      name: values.name,
      date: values.date,
      url: values.url,
      issued: { en: values.issuedEn, es: values.issuedEs, pt: values.issuedPt },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ??
          certification?.image.asset ?? { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/certifications/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  async function handleUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    const asset = await uploadImageAssetFn({ data: formData });
    setUploadedAsset(asset);
    return sanityImageUrl(asset._ref);
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New certification' : certification?.name}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={certification?._status ?? 'draft'}
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

      <FormField label="Date" required error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker value={field.value} onValueChange={field.onChange} />
          )}
        />
      </FormField>

      <FormField label="URL" error={errors.url?.message}>
        <Input {...register('url')} />
      </FormField>

      <FormField label="Image">
        <Controller
          control={control}
          name="imageAlt"
          render={({ field }) => (
            <ImageUploader
              imageUrl={
                certification?.image.asset._ref
                  ? sanityImageUrl(certification.image.asset._ref)
                  : undefined
              }
              alt={field.value}
              onAltChange={field.onChange}
              onUpload={handleUpload}
            />
          )}
        />
      </FormField>

      <FormField label="Issued">
        <LocaleField
          value={{ en: issuedEn, es: issuedEs, pt: issuedPt }}
          onValueChange={(locale, value) => {
            setValue(
              `issued${locale[0].toUpperCase()}${locale.slice(1)}` as
                | 'issuedEn'
                | 'issuedEs'
                | 'issuedPt',
              value,
              { shouldDirty: true },
            );
          }}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
