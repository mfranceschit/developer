import { nanoid } from 'nanoid';

const pt = {
  menu: {
    about: 'Sobre Mim',
    work: 'Projetos',
    certifications: 'Certificações',
    contact: 'Contato',
  },
  home: {
    title: 'Marco Franceschi',
    subtitle: `Desenvolvedor Full-Stack Sênior`,
  },
  about: {
    title: 'Eu',
    description: [
      'Sou um desenvolvedor Full-Stack com mais de 6 anos de experiência, especializado em JavaScript. Para mim, programação é uma forma de arte pela qual transformo ideias em realidade usando tecnologia.',
      'Tenho ampla experiência na criação de aplicações web e mobile, seguindo as melhores práticas e padrões da indústria. Estou sempre aberto a explorar novas tecnologias e me manter atualizado sobre as últimas bibliotecas e frameworks da comunidade tecnológica.',
      'Atualmente, é fundamental dominar ferramentas que permitem compilar, implantar e monitorar aplicativos. Sinto-me confortável construindo e gerenciando infraestrutura em ambientes de nuvem, como AWS, Azure e GCP. Além disso, tenho experiência em configurar pipelines personalizados para integração e implantação contínuas. Utilizo ferramentas como Terraform, New Relic e Docker para aprimorar meu fluxo de trabalho.',
      'Não podemos esquecer que o desenvolvimento de software é baseado nas pessoas que o realizam. Ao longo da minha carreira, tive o privilégio de trabalhar e aprender com profissionais excepcionais que admiro. Além disso, orientar novos desenvolvedores tem sido uma experiência gratificante.',
    ],
  },
  projects: {
    title: 'Projetos',
    stack: 'Tecnologias',
    summary: 'Sumário',
  },
  certifications: {
    title: 'Certificações',
    certificatesTitle: 'Certificados',
    degreesTitle: 'Diplomas',
    certificates: [
      {
        id: nanoid(),
        img: 'jsnad-openjs-node-js-application-developer.png',
        name: 'JSNAD: OpenJS Node.js Application Developer',
        issued: 'Emitido em Fevereiro de 2017',
        url: 'https://www.credly.com/badges/077b443b-d016-470a-a931-789098a38655',
      },
      {
        id: nanoid(),
        img: 'jsnsd-openjs-node-js-services-developer.png',
        name: 'JSNSD: OpenJS Node.js Services Developer',
        issued: 'Emitido em Janeiro de 2017',
        url: 'https://www.credly.com/badges/3636c6a7-661e-45e2-8d0d-5dd3cddf489b',
      },
      {
        id: nanoid(),
        img: 'lfw211-node-js-application-development.png',
        name: 'LFW211: Node.js Application Development',
        issued: 'Emitido em Setembro 2022',
        url: 'https://www.credly.com/badges/d44cffa0-19ac-415c-a0ff-ba9fa1860163',
      },
      {
        id: nanoid(),
        img: 'lfw212-node-js-services-development.png',
        name: 'LFW212: Node.js Services Development',
        issued: 'Emitido em Janeiro de 2017',
        url: 'https://www.credly.com/badges/a6c1a3aa-406c-46bd-b738-1a88768a81f4',
      },
    ],
    degrees: [
      {
        id: nanoid(),
        img: 'ucab-logo.jpeg',
        issued: 'Emitido em Novembro de 2017',
        name: 'Engenheiro em informática',
      },
    ],
  },
  contact: {
    title: 'Contato',
    description: 'Você gostaria de trabalhar juntos?',
    cta: 'Falemos!',
    placeholderSubject: 'Assunto',
    placeholderMessage: 'Mensagem',
    socials: 'Encontre-me nas redes sociais como ',
  },
};

export default pt;
