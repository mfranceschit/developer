import {
  Card,
  FormField,
  Input,
  RichTextEditor,
  type RichTextEditorProps,
  SegmentedControl,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  useAbout,
  useDiscard,
  usePublish,
  useUpsertAboutDraft,
} from '@/features/content/queries';
import type { About } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { PublishingCard } from '@/widgets/PublishingCard/PublishingCard';

export const Route = createFileRoute('/about')({
  component: AboutEditPage,
});

type PortableTextValue = RichTextEditorProps['value'];

const formSchema = z.object({
  titleEn: z.string().min(1, 'Title is required'),
  titleEs: z.string(),
  titlePt: z.string(),
  bodyEn: z.custom<PortableTextValue>(),
  bodyEs: z.custom<PortableTextValue>(),
  bodyPt: z.custom<PortableTextValue>(),
  stack: z.string(),
});

type AboutFormValues = z.infer<typeof formSchema>;

function toFormValues(about?: About | null): AboutFormValues {
  return {
    titleEn: about?.title.en ?? '',
    titleEs: about?.title.es ?? '',
    titlePt: about?.title.pt ?? '',
    bodyEn: (about?.body.en as PortableTextValue | undefined) ?? [],
    bodyEs: (about?.body.es as PortableTextValue | undefined) ?? [],
    bodyPt: (about?.body.pt as PortableTextValue | undefined) ?? [],
    stack: about?.stack?.join(', ') ?? '',
  };
}

function AboutEditPage() {
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: about } = useAbout();
  const upsert = useUpsertAboutDraft();
  const publish = usePublish();
  const discard = useDiscard();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<AboutFormValues>({
    values: toFormValues(about),
    resolver: zodResolver(formSchema),
  });

  const [titleEn, titleEs, titlePt] = useWatch({
    control,
    name: ['titleEn', 'titleEs', 'titlePt'],
  });

  const [titleLocale, setTitleLocale] = useState<'en' | 'es' | 'pt'>('en');
  const [bodyLocale, setBodyLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = upsert.isPending;
  const titleValues = { en: titleEn, es: titleEs, pt: titlePt };
  const titleFields = { en: 'titleEn', es: 'titleEs', pt: 'titlePt' } as const;

  async function onSubmit(values: AboutFormValues) {
    await upsert.mutateAsync({
      title: { en: values.titleEn, es: values.titleEs, pt: values.titlePt },
      body: { en: values.bodyEn, es: values.bodyEs, pt: values.bodyPt },
      stack: values.stack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    toaster.create({ title: 'About saved', type: 'success' });
  }

  return (
    <EditorLayout
      header={{
        eyebrow: 'Site',
        title: 'About',
        backLink: { label: 'Dashboard', onClick: () => navigate({ to: '/' }) },
      }}
      aside={
        <PublishingCard
          status={about?._status ?? 'draft'}
          dirty={isDirty}
          saving={saving}
          onSave={handleSubmit(onSubmit)}
          onPublish={async () => {
            await publish.mutateAsync({ id: 'about' });
          }}
          onDiscard={async () => {
            await discard.mutateAsync({ id: 'about' });
          }}
          toaster={toaster}
        />
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Title &amp; stack
            </h2>
            <SegmentedControl
              size="sm"
              aria-label="Title locale"
              value={titleLocale}
              onValueChange={setTitleLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          <FormField label="Title" required error={errors.titleEn?.message}>
            <Input
              value={titleValues[titleLocale]}
              onChange={(event) =>
                setValue(titleFields[titleLocale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
          <FormField label="Stack" hint="Comma-separated" error={errors.stack?.message}>
            <Input {...register('stack')} />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Body</h2>
            <SegmentedControl
              size="sm"
              aria-label="Body locale"
              value={bodyLocale}
              onValueChange={setBodyLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          {bodyLocale === 'en' && (
            <Controller
              control={control}
              name="bodyEn"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {bodyLocale === 'es' && (
            <Controller
              control={control}
              name="bodyEs"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {bodyLocale === 'pt' && (
            <Controller
              control={control}
              name="bodyPt"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
        </Card>
      </form>
    </EditorLayout>
  );
}
