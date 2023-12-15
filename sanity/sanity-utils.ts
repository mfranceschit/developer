import { createClient, groq } from 'next-sanity';

import { Project } from '@/types/Project';
import clientConfig from '@/sanity/config/client-config';

export const getProjects = async (): Promise<Project[]> => {
  const client = createClient(clientConfig);

  return client.fetch(groq`*[_type == "project"]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": asset->url,
    url,
    content

  }`);
};

export const getProject = async (slug: string): Promise<Project> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": asset->url,
    url,
    content

  }`,
    { slug },
  );
};
