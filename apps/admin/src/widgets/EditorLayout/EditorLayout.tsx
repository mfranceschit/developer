import type { ReactNode } from 'react';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export type EditorLayoutProps = {
  header: {
    eyebrow: string;
    title: string;
    backLink: { label: string; onClick: () => void };
  };
  children: ReactNode;
  aside: ReactNode;
};

export function EditorLayout({ header, children, aside }: EditorLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={header.eyebrow} title={header.title} backLink={header.backLink} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">{aside}</div>
      </div>
    </div>
  );
}
