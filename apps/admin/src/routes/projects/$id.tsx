import {
  Button,
  Card,
  FormField,
  ImageUploader,
  Input,
  RichTextEditor,
  type RichTextEditorProps,
  SegmentedControl,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import type { DocumentStatus, Project } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { PublishingCard } from '@/widgets/PublishingCard/PublishingCard';

export const Route = createFileRoute('/projects/$id')({
  component: ProjectEditPage,
});

// `RichTextEditor`'s value type, re-derived from its exported props rather than importing
// `@portabletext/editor` directly (which isn't a direct dependency of this app).
type PortableTextValue = RichTextEditorProps['value'];

// Form-level shape, distinct from `projectSchema` (shared/schemas.ts): `projectSchema`
// validates the Sanity document (including `_id`/`_type`), this validates what the user
// typed into the flat form fields before it's assembled into a document patch.
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  technologies: z.string(),
  descriptionEn: z.custom<PortableTextValue>(),
  descriptionEs: z.custom<PortableTextValue>(),
  descriptionPt: z.custom<PortableTextValue>(),
  imageAlt: z.string(),
});

type ProjectFormValues = z.infer<typeof formSchema>;

function toFormValues(project?: Project | null): ProjectFormValues {
  return {
    name: project?.name ?? '',
    slug: project?.slug ?? '',
    url: project?.url ?? '',
    repository: project?.repository ?? '',
    technologies: project?.technologies?.join(', ') ?? '',
    descriptionEn: (project?.description.en as PortableTextValue | undefined) ?? [],
    descriptionEs: (project?.description.es as PortableTextValue | undefined) ?? [],
    descriptionPt: (project?.description.pt as PortableTextValue | undefined) ?? [],
    imageAlt: project?.image.alt ?? '',
  };
}

function ProjectEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: project } = useDocument<Project & { _status: DocumentStatus }>(
    'project',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Project>('project');
  const patchDraft = usePatchDraft<Project>();
  const publish = usePublish();
  const discard = useDiscard();
  const [uploadedAsset, setUploadedAsset] = useState<Project['image']['asset'] | undefined>(
    undefined,
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ProjectFormValues>({
    values: toFormValues(project),
    resolver: zodResolver(formSchema),
  });

  const [descLocale, setDescLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;

  async function onSubmit(values: ProjectFormValues) {
    const doc = {
      name: values.name,
      slug: values.slug,
      url: values.url,
      repository: values.repository,
      technologies: values.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: {
        en: values.descriptionEn,
        es: values.descriptionEs,
        pt: values.descriptionPt,
      },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ?? project?.image.asset ?? { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/projects/$id', params: { id: created._id } });
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
        eyebrow: 'Work · Project',
        title: isNew ? 'New project' : (project?.name ?? 'Project'),
        backLink: { label: 'Projects', onClick: () => navigate({ to: '/projects' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={project?._status ?? 'draft'}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Slug" required error={errors.slug?.message}>
              <Input {...register('slug')} />
            </FormField>
            <FormField label="URL" error={errors.url?.message}>
              <Input {...register('url')} />
            </FormField>
            <FormField label="Repository" error={errors.repository?.message}>
              <Input {...register('repository')} />
            </FormField>
          </div>
          <FormField label="Technologies" hint="Comma-separated" error={errors.technologies?.message}>
            <Input {...register('technologies')} />
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
                    project?.image.asset._ref ? sanityImageUrl(project.image.asset._ref) : undefined
                  }
                  alt={field.value}
                  onAltChange={field.onChange}
                  onUpload={handleUpload}
                />
              )}
            />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Description
            </h2>
            <SegmentedControl
              size="sm"
              aria-label="Description locale"
              value={descLocale}
              onValueChange={setDescLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          {descLocale === 'en' && (
            <Controller
              control={control}
              name="descriptionEn"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {descLocale === 'es' && (
            <Controller
              control={control}
              name="descriptionEs"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {descLocale === 'pt' && (
            <Controller
              control={control}
              name="descriptionPt"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
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
