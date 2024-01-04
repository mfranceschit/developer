import { nanoid } from 'nanoid';

const es = {
  menu: {
    about: 'Sobre mí',
    work: 'Proyectos',
    certifications: 'Certificaciones',
    contact: 'Contacto',
  },
  home: {
    title: 'Marco Franceschi',
    subtitle: `Desarrollador Full-Stack Sénior`,
  },
  about: {
    title: 'Yo',
    description: [
      'Soy un desarrollador Full-Stack con más de 6 años de experiencia especializado en JavaScript. Para mí, programar es una forma de arte en la que transformo ideas en realidad a través de la tecnología.',
      'Poseo amplia experiencia en la creación de aplicaciones web y móviles, siguiendo las mejores prácticas y estándares de la industria. Siempre estoy abierto a explorar nuevas tecnologías, manteniéndome actualizado sobre las últimas librerías y frameworks en la comunidad tecnológica.',
      'Hoy en día, es crucial dominar ciertas herramientas que te permitan, compilar, desplegar y monitorear tu aplicación. Me siento cómodo creando y gestionando infraestructura en entornos de nube como AWS, Azure y GCP. Además, tengo experiencia en la configuración de pipelines personalizados para la integración y despliegue continuo. Utilizo herramientas como Terraform, New Relic y Docker para mejorar mi flujo de trabajo.',
      'No podemos olvidar que el desarrollo de software se basa en las personas que lo llevan a cabo. A lo largo de mi carrera, he tenido el privilegio de trabajar y aprender de profesionales excepcionales a quienes admiro. Además, asesorar nuevos desarrolladores ha sido una experiencia gratificante.',
    ],
  },
  projects: {
    title: 'Proyectos',
    stack: 'Tecnologías',
    summary: 'Resumen',
  },
  certifications: {
    title: 'Certificaciones',
    certificatesTitle: 'Certificados',
    degreesTitle: 'Títulos',
    certificates: [
      {
        id: nanoid(),
        img: 'jsnad-openjs-node-js-application-developer.png',
        name: 'JSNAD: OpenJS Node.js Application Developer',
        issued: 'Emitido en Febrero 2023',
        url: 'https://www.credly.com/badges/077b443b-d016-470a-a931-789098a38655',
      },
      {
        id: nanoid(),
        img: 'jsnsd-openjs-node-js-services-developer.png',
        name: 'JSNSD: OpenJS Node.js Services Developer',
        issued: 'Emitido en Enero 2023',
        url: 'https://www.credly.com/badges/3636c6a7-661e-45e2-8d0d-5dd3cddf489b',
      },
      {
        id: nanoid(),
        img: 'lfw211-node-js-application-development.png',
        name: 'LFW211: Node.js Application Development',
        issued: 'Emitido en Septiembre 2022',
        url: 'https://www.credly.com/badges/d44cffa0-19ac-415c-a0ff-ba9fa1860163',
      },
      {
        id: nanoid(),
        img: 'lfw212-node-js-services-development.png',
        name: 'LFW212: Node.js Services Development',
        issued: 'Emitido en Enero 2023',
        url: 'https://www.credly.com/badges/a6c1a3aa-406c-46bd-b738-1a88768a81f4',
      },
    ],
    degrees: [
      {
        id: nanoid(),
        img: 'ucab-logo.jpeg',
        issued: 'Emitido en Noviembre 2017',
        name: 'Ingeniero en informática',
      },
    ],
  },
  contact: {
    title: 'Contacto',
    description: '¿Quieres que trabajemos juntos?',
    cta: '¡Hablemos!',
    placeholderSubject: 'Asunto',
    placeholderMessage: 'Mensaje',
    socials: 'Encuéntrame en las redes sociales como ',
  },
};

export default es;
