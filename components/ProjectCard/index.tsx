import React from 'react';

import { Project } from '@/types/Project';
import styles from './project-card.module.scss';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const ProjectCard = ({ project }: { project: Project }) => {
  const { name } = project;
  return (
    <Link
      className={styles.item}
      passHref
      href={`${ROUTES.projects}/${project.slug}`}>
      <div className={`${styles.square} ${styles.squareBox}`}>
        <div className={styles.boxContent}>
          <h3>{name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
