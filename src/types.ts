export interface Project {
  id: string;
  img: string;
  title: string;
  description: string[];
  url: string;
  repo: string;
  technologies: string[];
}

export enum LOCALES {
  en = 'en',
  es = 'es',
  pt = 'pt',
}
