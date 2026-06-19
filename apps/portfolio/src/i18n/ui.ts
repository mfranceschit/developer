export const languages = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
} as const;

export const defaultLang = 'en';

export type Locale = keyof typeof languages;

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About Me',
    'nav.projects': 'Projects',
    'nav.certifications': 'Certifications',
    'nav.contact': 'Contact',
    'home.title': 'Marco Franceschi',
    'home.subtitle': 'Senior Full-Stack Developer',
    'about.title': 'Me',
    'projects.title': 'Projects',
    'projects.stack': 'Technologies',
    'projects.summary': 'Summary',
    'certifications.title': 'Certifications',
    'certifications.certificates': 'Certificates',
    'certifications.degrees': 'Degrees',
    'contact.title': 'Contact',
    'contact.description': 'Would you like to work together?',
    'contact.cta': "Let's Talk!",
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'meta.home.title': 'Marco Franceschi',
    'meta.home.description':
      'A seasoned full-stack developer with expertise in building high-performance web applications.',
    'meta.about.title': 'Me',
    'meta.about.description':
      'Full-stack developer with 6+ years of experience building web & mobile apps.',
    'meta.projects.title': 'Projects',
    'meta.projects.description':
      'Explore my diverse portfolio of projects built with cutting-edge technologies.',
    'meta.certifications.title': 'Certifications',
    'meta.certifications.description':
      'Certifications and education that have shaped my skills as a full-stack developer.',
    'meta.contact.title': 'Contact',
    'meta.contact.description':
      "Interested in working together? I'm always open to exciting opportunities.",
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Sobre mí',
    'nav.projects': 'Proyectos',
    'nav.certifications': 'Certificaciones',
    'nav.contact': 'Contacto',
    'home.title': 'Marco Franceschi',
    'home.subtitle': 'Desarrollador Full-Stack Sénior',
    'about.title': 'Yo',
    'projects.title': 'Proyectos',
    'projects.stack': 'Tecnologías',
    'projects.summary': 'Resumen',
    'certifications.title': 'Certificaciones',
    'certifications.certificates': 'Certificados',
    'certifications.degrees': 'Títulos',
    'contact.title': 'Contacto',
    'contact.description': '¿Quieres que trabajemos juntos?',
    'contact.cta': '¡Hablemos!',
    'contact.name': 'Nombre',
    'contact.email': 'Email',
    'contact.subject': 'Asunto',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar',
    'meta.home.title': 'Marco Franceschi',
    'meta.home.description':
      'Desarrollador full-stack con experiencia en aplicaciones web de alto rendimiento.',
    'meta.about.title': 'Yo',
    'meta.about.description':
      'Desarrollador full-stack con más de 6 años de experiencia.',
    'meta.projects.title': 'Proyectos',
    'meta.projects.description':
      'Explora mi portafolio de proyectos construidos con tecnologías modernas.',
    'meta.certifications.title': 'Certificaciones',
    'meta.certifications.description':
      'Certificaciones y educación que han formado mis habilidades como desarrollador.',
    'meta.contact.title': 'Contacto',
    'meta.contact.description': '¿Interesado en trabajar juntos?',
  },
  pt: {
    'nav.home': 'Início',
    'nav.about': 'Sobre Mim',
    'nav.projects': 'Projetos',
    'nav.certifications': 'Certificações',
    'nav.contact': 'Contato',
    'home.title': 'Marco Franceschi',
    'home.subtitle': 'Desenvolvedor Full-Stack Sênior',
    'about.title': 'Eu',
    'projects.title': 'Projetos',
    'projects.stack': 'Tecnologias',
    'projects.summary': 'Sumário',
    'certifications.title': 'Certificações',
    'certifications.certificates': 'Certificados',
    'certifications.degrees': 'Diplomas',
    'contact.title': 'Contato',
    'contact.description': 'Você gostaria de trabalhar juntos?',
    'contact.cta': 'Falemos!',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.subject': 'Assunto',
    'contact.message': 'Mensagem',
    'contact.send': 'Enviar',
    'meta.home.title': 'Marco Franceschi',
    'meta.home.description':
      'Desenvolvedor full-stack com expertise em aplicações web de alto desempenho.',
    'meta.about.title': 'Eu',
    'meta.about.description':
      'Desenvolvedor full-stack com mais de 6 anos de experiência.',
    'meta.projects.title': 'Projetos',
    'meta.projects.description':
      'Explore meu portfólio de projetos construídos com tecnologias modernas.',
    'meta.certifications.title': 'Certificações',
    'meta.certifications.description':
      'Certificações e educação que moldaram minhas habilidades como desenvolvedor.',
    'meta.contact.title': 'Contato',
    'meta.contact.description': 'Interessado em trabalhar juntos?',
  },
} as const;

export const aboutDescriptions: Record<Locale, string[]> = {
  en: [
    'I am a Full-Stack Developer with over 6 years of experience specializing in JavaScript. To me, coding is akin to an art form, where I transform ideas into reality using technology.',
    'I have ample experience in creating mobile and web applications following the best practices and industry standards while developing software, whether it involves starting a project from scratch, implementing new features, or enhancing existing ones. I embrace the opportunity to explore new frameworks and technologies, always staying updated with the latest libraries and frameworks in the tech community.',
    'Nowadays, mastering the tools that enable seamless application building, deployment, and monitoring is crucial. I feel confident in my ability to create and manage infrastructure on cloud platforms like AWS, Azure, and GCP. Additionally, I have hands-on experience in setting up pipelines for continuous delivery and integration. I am proficient in leveraging tools like Terraform, New Relic, Docker that boost my workflow.',
    "Let's not forget that software development is ultimately about the people involved. Throughout my career, I have had the privilege of working and learning from exceptional professionals whom I admire. Also, mentoring new developers has been a rewarding experience.",
  ],
  es: [
    'Soy un desarrollador Full-Stack con más de 6 años de experiencia especializado en JavaScript. Para mí, programar es una forma de arte en la que transformo ideas en realidad a través de la tecnología.',
    'Poseo amplia experiencia en la creación de aplicaciones web y móviles, siguiendo las mejores prácticas y estándares de la industria. Siempre estoy abierto a explorar nuevas tecnologías, manteniéndome actualizado sobre las últimas librerías y frameworks en la comunidad tecnológica.',
    'Hoy en día, es crucial dominar ciertas herramientas que te permitan, compilar, desplegar y monitorear tu aplicación. Me siento cómodo creando y gestionando infraestructura en entornos de nube como AWS, Azure y GCP. Además, tengo experiencia en la configuración de pipelines personalizados para la integración y despliegue continuo. Utilizo herramientas como Terraform, New Relic y Docker para mejorar mi flujo de trabajo.',
    'No podemos olvidar que el desarrollo de software se basa en las personas que lo llevan a cabo. A lo largo de mi carrera, he tenido el privilegio de trabajar y aprender de profesionales excepcionales a quienes admiro. Además, asesorar nuevos desarrolladores ha sido una experiencia gratificante.',
  ],
  pt: [
    'Sou um desenvolvedor Full-Stack com mais de 6 anos de experiência, especializado em JavaScript. Para mim, programação é uma forma de arte pela qual transformo ideias em realidade usando tecnologia.',
    'Tenho ampla experiência na criação de aplicações web e mobile, seguindo as melhores práticas e padrões da indústria. Estou sempre aberto a explorar novas tecnologias e me manter atualizado sobre as últimas bibliotecas e frameworks da comunidade tecnológica.',
    'Atualmente, é fundamental dominar ferramentas que permitem compilar, implantar e monitorar aplicativos. Sinto-me confortável construindo e gerenciando infraestrutura em ambientes de nuvem, como AWS, Azure e GCP. Além disso, tenho experiência em configurar pipelines personalizados para integração e implantação contínuas. Utilizo ferramentas como Terraform, New Relic e Docker para aprimorar meu fluxo de trabalho.',
    'Não podemos esquecer que o desenvolvimento de software é baseado nas pessoas que o realizam. Ao longo da minha carreira, tive o privilégio de trabalhar e aprender com profissionais excepcionais que admiro. Além disso, orientar novos desenvolvedores tem sido uma experiência gratificante.',
  ],
};
