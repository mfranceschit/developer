export interface Badge {
  id: string;
  img: string;
  name: string;
  issued: string;
  url: string;
}

export enum LOCALES {
  en = 'en',
  es = 'es',
  pt = 'pt',
}

export interface ServerComponentProps {
  params: { locale: string };
}
