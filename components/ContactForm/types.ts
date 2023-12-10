export interface CustomElements extends HTMLFormControlsCollection {
  subject: HTMLInputElement;
  message: HTMLTextAreaElement;
}

export interface ContactFormPayload extends HTMLFormElement {
  readonly elements: CustomElements;
}

export interface ContactFormProps {
  title: string;
  placeholderSubject: string;
  placeholderMessage: string;
  cta: string;
}
