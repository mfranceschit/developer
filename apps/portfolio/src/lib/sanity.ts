import { createClient } from '@sanity/client';
import groq from 'groq';

// import.meta.env is replaced with void 0 by Vite for non-PUBLIC server vars in SSR chunks;
// process.env is the correct runtime source for server-only secrets.
export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION ?? '2023-12-08',
  useCdn: false,
});

export interface Project {
  _id: string;
  name: string;
  slug: string;
}

export interface ProjectDetail {
  _id: string;
  name: string;
  slug: string;
  image: string;
  url: string;
  repository: string;
  description: SanityBlock[];
  technologies: string[];
}

export interface SanityBlock {
  _type: string;
  children?: Array<{ text: string }>;
}

export interface Certificate {
  _id: string;
  name: string;
  image: string;
  date: string;
  issued: string;
  url: string;
}

export interface Degree {
  _id: string;
  name: string;
  image: string;
  issued: string;
}

export function renderBlocks(blocks: SanityBlock[]): string[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => b.children?.map((c) => c.text).join('') ?? '');
}

export async function getProjects(): Promise<Project[]> {
  return sanityClient.fetch(
    groq`*[_type == "project"]{
      _id,
      name,
      "slug": slug.current
    }`,
  );
}

export async function getProject(slug: string, locale = 'en'): Promise<ProjectDetail> {
  return sanityClient.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
      _id,
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
}

export async function getCertifications(locale = 'en'): Promise<Certificate[]> {
  return sanityClient.fetch(
    groq`*[_type == "certification"]{
      _id,
      name,
      "image": image.asset->url,
      date,
      url,
      "issued": issued[$locale]
    } | order(date desc)`,
    { locale },
  );
}

export async function getDegrees(locale = 'en'): Promise<Degree[]> {
  return sanityClient.fetch(
    groq`*[_type == "degree"]{
      _id,
      "name": name[$locale],
      "image": image.asset->url,
      "issued": issued[$locale]
    }`,
    { locale },
  );
}
