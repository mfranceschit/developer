import React from 'react';
import Head from 'next/head';

import Title from '@/components/Title';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { useLanguage } from '@/hooks/useLanguage';
import { Project } from '@/types';

const Projects = () => {
  const {
    content: { projects },
  } = useLanguage();
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
