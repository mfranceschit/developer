import React from 'react';
import Head from 'next/head';

import { ProjectsGrid } from '@/components/ProjectsGrid';
import { Project } from '@/types';
import en from '@/locales/en';
import Title from '@/components/Title';

const Projects = () => {
  const { title, items } = en.projects;

  return (
    <section className="wrapper">
      <Head>
        <title>{`Marco Franceschi 🧑🏾‍💻 ${title}`}</title>
      </Head>
      <Title>{title}</Title>
      <ProjectsGrid projects={items as Project[]} />
    </section>
  );
};

export default Projects;
