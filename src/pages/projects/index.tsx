import React, { useContext, useEffect, useMemo, useState } from 'react';

import Title from '@/components/Title';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { LOCALES } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

const Projects = () => {
  const { projects } = useLanguage();
  const { title, items } = projects;

  return (
    <section className="projects-container">
      <Title>{title}</Title>
      <div className="text-wrapper">
        <ProjectsGrid projects={items as any[]} />
      </div>
    </section>
  );
};

export default Projects;
