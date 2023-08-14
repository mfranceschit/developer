import React from 'react';
import Head from 'next/head';

import { ProjectsGrid } from '@/components/ProjectsGrid';
import { useLanguage } from '@/hooks/useLanguage';
import { Project } from '@/types';

const Projects = () => {
  const {
    content: { projects },
  } = useLanguage();
  const { title, items } = projects;

  return (
    <div className="text-wrapper">
      <Head>
        <title>{`Marco Franceschi 🧑🏾‍💻 ${title}`}</title>
      </Head>
      <ProjectsGrid projects={items as Project[]} />
    </div>
  );
};

export default Projects;
