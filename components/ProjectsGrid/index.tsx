import React from 'react';

import ProjectCard from '../ProjectCard';
import { Project } from '@/types/Project';
import styles from './project-grid.module.scss';

export const ProjectsGrid: React.FC<{ projects: Project[] }> = ({
  projects = [],
}) => {
  return (
    <div className={`${styles.cpTransition} ${styles.cpTransitionContainer}`}>
      <div className={styles.cpTransitionSquaresWrapper}>
        {projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
};
