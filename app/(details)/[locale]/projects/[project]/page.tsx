import { Metadata } from 'next';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { getProject } from '@/sanity/sanity-utils';

import styles from './project-details.module.scss';
import { ROUTES } from '@/constants/routes';
import DynamicSizeImage from '@/components/DynamicSizeImage';
import { ServerComponentProps } from '@/types';

export async function generateMetadata(
  props: ServerComponentProps,
): Promise<Metadata> {
  const params = await props.params;

  const { locale, project: slug } = params;

  const project = await getProject(slug, locale);
  const { name } = project;

  return {
    title: `Project - ${name}`,
  };
}

const Project: React.FC<ServerComponentProps> = async props => {
  const params = await props.params;
  const slug = params.project;
  const project = await getProject(slug, params.locale);

  const { name, url, description, image, technologies } = project;

  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${params.locale}.ts`)).default;
  const { title, stack, summary } = content.projects;

  return (
    <section className="wrapper">
      <nav className={styles.cardHeader}>
        <ul>
          <li>
            <Link passHref href={ROUTES.projects}>
              {title}
            </Link>
          </li>
          <li>{name}</li>
        </ul>
      </nav>

      <div className={styles.cardContent}>
        <div className={styles.projectInformation}>
          <h1>{name}</h1>
          <div className={styles.cardTextPlaceholder}>
            <h4>{stack}:</h4>
            <div className={styles.technologiesContainer}>
              {technologies.map((t: string, index: number) => (
                <span key={index}>{t}</span>
              ))}
            </div>
            <h4>{summary}:</h4>
            <PortableText value={description} />
          </div>
        </div>
        <DynamicSizeImage image={image} name={name} url={url} />
      </div>
    </section>
  );
};

export default Project;
