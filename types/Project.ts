import { PortableTextBlock } from 'sanity';

export type Project = {
  _id: string;
  _createdAt: string;
  name: string;
  slug: string;
};

export type ProjectDetail = {
  _id: string;
  _createdAt: string;
  image: string;
  name: string;
  slug: string;
  url: string;
  repository: string;
  description: PortableTextBlock;
  technologies: string[];
};
