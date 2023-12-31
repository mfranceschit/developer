import React from 'react';
import { Metadata } from 'next';

import { ProjectsGrid } from '@/components/ProjectsGrid';
import en from '@/locales/en';
import Title from '@/components/Title';

import { getProjects } from '@/sanity/sanity-utils';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.projects;

  return {
    title,
    description,
  };
}

const Projects = async () => {
  const { title } = en.projects;
  const projects = await getProjects();

  return (
    <section className="wrapper">
      <Title>{title}</Title>
      <ProjectsGrid projects={projects} />
    </section>
  );
};

export default Projects;
