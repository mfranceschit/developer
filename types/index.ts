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

export interface ServerComponentProps {
  params: { locale: string; project: string };
}
