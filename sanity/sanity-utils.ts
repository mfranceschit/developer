import { createClient, groq } from 'next-sanity';

import { Project, ProjectDetail } from '@/types/Project';
import clientConfig from '@/sanity/config/client-config';

export const getProjects = async (): Promise<Project[]> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project" && language == $language]{
    _id,
    _createdAt,
    name,
    "slug": slug.current
  }`,
    {
      language: 'en',
    },
  );
};

export const getProject = async (slug: string): Promise<ProjectDetail> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug && language == $language][0]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    repository,
    url,
    description,
    technologies
  }`,
    { slug, language: 'en' },
  );
};
