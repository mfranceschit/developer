import React from 'react';

import Title from '@/components/Title';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { useLanguage } from '@/hooks/useLanguage';
import { Project } from '@/types';
import Head from 'next/head';

const Projects = () => {
  const { projects } = useLanguage();
  const { title, items } = projects;

  return (
    <section className="projects-container">
      <Head>
        <title>{`Marco Franceschi 🧑🏾‍💻 ${title}`}</title>
      </Head>
      <Title>{title}</Title>
      <div className="text-wrapper">
        <ProjectsGrid projects={items as Project[]} />
      </div>
    </section>
  );
};

export default Projects;
