import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { FaX } from 'react-icons/fa6';
import Image from 'next/image';

import { Project } from '@/types';
import { useImageSize } from '@/hooks/useImageSize';
import en from '@/locales/en';
import styles from './project-details.module.scss';

const ProjectDetails = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { width, height } = useImageSize();

  const { stack, summary } = en.projects;
  const { title, url, description, img, technologies } = project;
  const imageSrc = `/images/${img}`;

  useEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <>
      <div className={styles.cardHeader}>
        <button onClick={() => setSelectedProject(undefined)}>
          <FaX size={30} />
        </button>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.imageContainer}>
          <a rel="noopener noreferrer" target="_blank" href={url}>
            <Image
              src={imageSrc}
              height={height}
              width={width}
              className={styles.cardImgPlaceholder}
              alt={`${title} project image`}
            />
          </a>
        </div>
        <div className={styles.projectInformation}>
          <div className={styles.cardTextPlaceholder}>
            <h2>{title}</h2>
            <h4>{stack}:</h4>
            <div className={styles.technologiesContainer}>
              {technologies.map((t: string, index: number) => (
                <span key={index}>{t}</span>
              ))}
            </div>
            <h4>{summary}:</h4>
            {description.map((p, i) => (
              <p key={i} className={styles.projectTextParagraph}>
                {p}
              </p>
            ))}
            <div className={styles.textBottomSpace} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
