import { createClient, groq } from 'next-sanity';

import { Badge } from '@/types';
import { Project, ProjectDetail } from '@/types/Project';
import clientConfig from '@/sanity/config/client-config';

export const getProjects = async (): Promise<Project[]> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project"]{
    _id,
    _createdAt,
    name,
    "slug": slug.current
  }`,
  );
};

export const getProjectName = async (
  slug: string,
): Promise<{ name: string }> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
    name
  }`,
    { slug },
  );
};

export const getProject = async (
  slug: string,
  locale = 'en',
): Promise<ProjectDetail> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
    _id,
    _createdAt,
    name,
    "slug": slug.current,
    "image": image.asset->url,
    repository,
    url,
    "description": description[$locale],
    technologies
  }`,
    { slug, locale },
  );
};

export const getCertifications = async (
  slug: string,
  locale = 'en',
): Promise<Badge[]> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "certification"]{
      _id,
      _createdAt,
      name,
      "image": image.asset->url,
      date,
      issued,
      url,
      "issued": issued[$locale],
    }  | order(date desc)`,
    { slug, locale },
  );
};

export const getDegrees = async (
  slug: string,
  locale = 'en',
): Promise<Badge[]> => {
  const client = createClient(clientConfig);

  return client.fetch(
    groq`*[_type == "degree"]{
      _id,
      _createdAt,
      "name": name[$locale],
      "image": image.asset->url,
      issued,
      "issued": issued[$locale],
    }`,
    { slug, locale },
  );
};
