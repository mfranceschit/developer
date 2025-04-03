export interface Badge {
  _id: string;
  image: string;
  name: string;
  issued: string;
  url?: string;
  date?: string;
}

export enum LOCALES {
  en = 'en',
  es = 'es',
  pt = 'pt',
}

type Params = Promise<{ locale: string; project: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export interface ServerComponentProps {
  searchParams: SearchParams;
  params: Params;
}
