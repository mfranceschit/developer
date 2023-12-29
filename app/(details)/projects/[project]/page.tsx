import Link from 'next/link';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { getProject } from '@/sanity/sanity-utils';

import en from '@/locales/en';
import styles from './project-details.module.scss';
import { ROUTES } from '@/constants/routes';

type Props = {
  params: { project: string };
};

const Project: React.FC<Props> = async ({ params }) => {
  const slug = params.project;
  const project = await getProject(slug);
  const { name, url, description, image, technologies } = project;

  const { stack, summary } = en.projects;

  return (
    <section className="wrapper">
      <nav className={styles.cardHeader}>
        <ul>
          <li>
            <Link passHref href={ROUTES.projects}>
              Projects
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
            <div className={styles.textBottomSpace} />
          </div>
        </div>
        <div className={styles.imageContainer}>
          <a rel="noopener noreferrer" target="_blank" href={url}>
            <Image
              src={image}
              height={300}
              width={300}
              className={styles.cardImgPlaceholder}
              alt={`${name} project image`}
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Project;
