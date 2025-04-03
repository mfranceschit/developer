import React from 'react';
import { Metadata } from 'next';

import { ProjectsGrid } from '@/components/ProjectsGrid';
import en from '@/locales/en';
import Title from '@/components/Title';

import { getProjects } from '@/sanity/sanity-utils';
import { ServerComponentProps } from '@/types';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.projects;

  return {
    title,
    description,
  };
}

const Projects: React.FC<ServerComponentProps> = async props => {
  const params = await props.params;

  const {
    locale
  } = params;

  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { title } = content.projects;
  const projects = await getProjects();

  return (
    <section className="wrapper">
      <Title>{title}</Title>
      <ProjectsGrid projects={projects} />
    </section>
  );
};

export default Projects;
