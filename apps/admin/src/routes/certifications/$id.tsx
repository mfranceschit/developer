import {
  Button,
  Card,
  DatePicker,
  FormField,
  ImageUploader,
  Input,
  SegmentedControl,
} from '@mfranceschit/ui';
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
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { PublishingCard } from '@/widgets/PublishingCard/PublishingCard';

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
    issuedEn: certification?.issued?.en ?? '',
    issuedEs: certification?.issued?.es ?? '',
    issuedPt: certification?.issued?.pt ?? '',
    imageAlt: certification?.image?.alt ?? '',
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

  const [issuedLocale, setIssuedLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;
  const issuedValues = { en: issuedEn, es: issuedEs, pt: issuedPt };
  const issuedFields = { en: 'issuedEn', es: 'issuedEs', pt: 'issuedPt' } as const;

  async function onSubmit(values: CertificationFormValues) {
    const doc = {
      name: values.name,
      date: values.date,
      url: values.url,
      issued: { en: values.issuedEn, es: values.issuedEs, pt: values.issuedPt },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ??
          certification?.image?.asset ?? { _ref: '', _type: 'reference' as const },
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
    <EditorLayout
      header={{
        eyebrow: 'Certifications · Certificate',
        title: isNew ? 'New certificate' : (certification?.name ?? 'Certificate'),
        backLink: { label: 'Certificates', onClick: () => navigate({ to: '/certifications' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={certification?._status ?? 'draft'}
            dirty={isDirty}
            saving={saving}
            onSave={handleSubmit(onSubmit)}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Details</h2>
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Date" required error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField label="Credential URL" error={errors.url?.message}>
              <Input {...register('url')} />
            </FormField>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-medium text-[var(--text-body)]">
                Issued by
              </span>
              <SegmentedControl
                size="sm"
                aria-label="Issued-by locale"
                value={issuedLocale}
                onValueChange={setIssuedLocale}
                options={[
                  { value: 'en', label: 'EN' },
                  { value: 'es', label: 'ES' },
                  { value: 'pt', label: 'PT' },
                ]}
              />
            </div>
            <Input
              value={issuedValues[issuedLocale]}
              onChange={(event) =>
                setValue(issuedFields[issuedLocale], event.target.value, { shouldDirty: true })
              }
            />
          </div>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Media</h2>
          <FormField label="Image">
            <Controller
              control={control}
              name="imageAlt"
              render={({ field }) => (
                <ImageUploader
                  imageUrl={
                    certification?.image?.asset._ref
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
          {isNew && (
            <Button type="submit" className="self-start">
              Save draft
            </Button>
          )}
        </Card>
      </form>
    </EditorLayout>
  );
}
