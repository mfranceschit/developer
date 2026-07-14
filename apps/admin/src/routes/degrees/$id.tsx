import { Button, Card, FormField, ImageUploader, Input, SegmentedControl } from '@mfranceschit/ui';
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
import type { Degree, DocumentStatus } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { PublishingCard } from '@/widgets/PublishingCard/PublishingCard';

export const Route = createFileRoute('/degrees/$id')({
  component: DegreeEditPage,
});

const formSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameEs: z.string(),
  namePt: z.string(),
  issuedEn: z.string(),
  issuedEs: z.string(),
  issuedPt: z.string(),
  imageAlt: z.string(),
});

type DegreeFormValues = z.infer<typeof formSchema>;

function toFormValues(degree?: Degree | null): DegreeFormValues {
  return {
    nameEn: degree?.name.en ?? '',
    nameEs: degree?.name.es ?? '',
    namePt: degree?.name.pt ?? '',
    issuedEn: degree?.issued.en ?? '',
    issuedEs: degree?.issued.es ?? '',
    issuedPt: degree?.issued.pt ?? '',
    imageAlt: degree?.image.alt ?? '',
  };
}

function DegreeEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: degree } = useDocument<Degree & { _status: DocumentStatus }>(
    'degree',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Degree>('degree');
  const patchDraft = usePatchDraft<Degree>();
  const publish = usePublish();
  const discard = useDiscard();
  const [uploadedAsset, setUploadedAsset] = useState<Degree['image']['asset'] | undefined>(
    undefined,
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<DegreeFormValues>({
    values: toFormValues(degree),
    resolver: zodResolver(formSchema),
  });

  const [nameEn, nameEs, namePt] = useWatch({ control, name: ['nameEn', 'nameEs', 'namePt'] });
  const [issuedEn, issuedEs, issuedPt] = useWatch({
    control,
    name: ['issuedEn', 'issuedEs', 'issuedPt'],
  });

  const [locale, setLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;
  const nameValues = { en: nameEn, es: nameEs, pt: namePt };
  const nameFields = { en: 'nameEn', es: 'nameEs', pt: 'namePt' } as const;
  const issuedValues = { en: issuedEn, es: issuedEs, pt: issuedPt };
  const issuedFields = { en: 'issuedEn', es: 'issuedEs', pt: 'issuedPt' } as const;

  async function onSubmit(values: DegreeFormValues) {
    const doc = {
      name: { en: values.nameEn, es: values.nameEs, pt: values.namePt },
      issued: { en: values.issuedEn, es: values.issuedEs, pt: values.issuedPt },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ?? degree?.image.asset ?? { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/degrees/$id', params: { id: created._id } });
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
        eyebrow: 'Certifications · Degree',
        title: isNew ? 'New degree' : (degree?.name.en ?? 'Degree'),
        backLink: { label: 'Degrees', onClick: () => navigate({ to: '/degrees' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={degree?._status ?? 'draft'}
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
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Details</h2>
            <SegmentedControl
              size="sm"
              aria-label="Locale"
              value={locale}
              onValueChange={setLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          <FormField label="Name" required error={errors.nameEn?.message}>
            <Input
              value={nameValues[locale]}
              onChange={(event) =>
                setValue(nameFields[locale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
          <FormField label="Issued by" hint="Name and issuer follow the selected language">
            <Input
              value={issuedValues[locale]}
              onChange={(event) =>
                setValue(issuedFields[locale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
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
                    degree?.image.asset._ref ? sanityImageUrl(degree.image.asset._ref) : undefined
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
