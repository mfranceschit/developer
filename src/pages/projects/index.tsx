import React, { useContext, useEffect, useMemo, useState } from 'react';

import Title from '@/components/Title';
import styles from './styles.module.css';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { useLanguage } from '@/hooks/useLanguage';

const Projects = () => {
  const { projects } = useLanguage();
  const { title, items } = projects;

  return (
    <section className={styles.projectsContainer}>
      <Title>{title}</Title>
      <div className={styles.textWrapper}>
        <ProjectsGrid projects={items as any[]} />
      </div>
    </section>
  );
};

export default Projects;
