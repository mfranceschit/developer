import {
  Button,
  FormField,
  Input,
  LocaleField,
  RichTextEditor,
  type RichTextEditorProps,
  Tabs,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  useAbout,
  useDiscard,
  usePublish,
  useUpsertAboutDraft,
} from '@/features/content/queries';
import type { About } from '@/shared/types';
import { DocumentToolbar } from '@/widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/about')({
  component: AboutEditPage,
});

type PortableTextValue = RichTextEditorProps['value'];

const formSchema = z.object({
  eyebrowEn: z.string(),
  eyebrowEs: z.string(),
  eyebrowPt: z.string(),
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
    eyebrowEn: about?.eyebrow.en ?? '',
    eyebrowEs: about?.eyebrow.es ?? '',
    eyebrowPt: about?.eyebrow.pt ?? '',
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

  const [eyebrowEn, eyebrowEs, eyebrowPt, titleEn, titleEs, titlePt] = useWatch({
    control,
    name: ['eyebrowEn', 'eyebrowEs', 'eyebrowPt', 'titleEn', 'titleEs', 'titlePt'],
  });

  async function onSubmit(values: AboutFormValues) {
    await upsert.mutateAsync({
      eyebrow: { en: values.eyebrowEn, es: values.eyebrowEs, pt: values.eyebrowPt },
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
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">About</h1>
        <DocumentToolbar
          status={about?._status ?? 'draft'}
          dirty={isDirty}
          onPublish={async () => {
            await publish.mutateAsync({ id: 'about' });
          }}
          onDiscard={async () => {
            await discard.mutateAsync({ id: 'about' });
          }}
          toaster={toaster}
        />
      </div>

      <FormField label="Eyebrow">
        <LocaleField
          value={{ en: eyebrowEn, es: eyebrowEs, pt: eyebrowPt }}
          onValueChange={(locale, value) => {
            setValue(
              `eyebrow${locale[0].toUpperCase()}${locale.slice(1)}` as
                | 'eyebrowEn'
                | 'eyebrowEs'
                | 'eyebrowPt',
              value,
              { shouldDirty: true },
            );
          }}
        />
      </FormField>

      <FormField label="Title" required error={errors.titleEn?.message}>
        <LocaleField
          value={{ en: titleEn, es: titleEs, pt: titlePt }}
          onValueChange={(locale, value) => {
            setValue(
              `title${locale[0].toUpperCase()}${locale.slice(1)}` as
                | 'titleEn'
                | 'titleEs'
                | 'titlePt',
              value,
              { shouldDirty: true },
            );
          }}
        />
      </FormField>

      <FormField label="Stack" hint="Comma-separated" error={errors.stack?.message}>
        <Input {...register('stack')} />
      </FormField>

      <FormField label="Body">
        <Tabs
          items={[
            {
              value: 'en',
              label: 'English',
              content: (
                <Controller
                  control={control}
                  name="bodyEn"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
            {
              value: 'es',
              label: 'Español',
              content: (
                <Controller
                  control={control}
                  name="bodyEs"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
            {
              value: 'pt',
              label: 'Português',
              content: (
                <Controller
                  control={control}
                  name="bodyPt"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
          ]}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
