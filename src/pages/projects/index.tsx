import React from 'react';

import Title from '@/components/Title';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { useLanguage } from '@/hooks/useLanguage';
import { Project } from '@/types';

const Projects = () => {
  const { projects } = useLanguage();
  const { title, items } = projects;

  return (
    <section className="projects-container">
      <Title>{title}</Title>
      <div className="text-wrapper">
        <ProjectsGrid projects={items as Project[]} />
      </div>
    </section>
  );
};

export default Projects;
