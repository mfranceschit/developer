import { randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION ?? '2023-12-08',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function toBlocks(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block',
    _key: randomUUID(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: randomUUID(), text, marks: [] }],
  }));
}

// Copy verbatim from apps/portfolio/src/i18n/ui.ts -> aboutDescriptions.en
const bodyEn: string[] = [
  'I am a Full-Stack Developer with over 6 years of experience specializing in JavaScript. To me, coding is akin to an art form, where I transform ideas into reality using technology.',
  'I have ample experience in creating mobile and web applications following the best practices and industry standards while developing software, whether it involves starting a project from scratch, implementing new features, or enhancing existing ones. I embrace the opportunity to explore new frameworks and technologies, always staying updated with the latest libraries and frameworks in the tech community.',
  'Nowadays, mastering the tools that enable seamless application building, deployment, and monitoring is crucial. I feel confident in my ability to create and manage infrastructure on cloud platforms like AWS, Azure, and GCP. Additionally, I have hands-on experience in setting up pipelines for continuous delivery and integration. I am proficient in leveraging tools like Terraform, New Relic, Docker that boost my workflow.',
  "Let's not forget that software development is ultimately about the people involved. Throughout my career, I have had the privilege of working and learning from exceptional professionals whom I admire. Also, mentoring new developers has been a rewarding experience.",
];
const bodyEs: string[] = [
  'Soy un desarrollador Full-Stack con más de 6 años de experiencia especializado en JavaScript. Para mí, programar es una forma de arte en la que transformo ideas en realidad a través de la tecnología.',
  'Poseo amplia experiencia en la creación de aplicaciones web y móviles, siguiendo las mejores prácticas y estándares de la industria. Siempre estoy abierto a explorar nuevas tecnologías, manteniéndome actualizado sobre las últimas librerías y frameworks en la comunidad tecnológica.',
  'Hoy en día, es crucial dominar ciertas herramientas que te permitan, compilar, desplegar y monitorear tu aplicación. Me siento cómodo creando y gestionando infraestructura en entornos de nube como AWS, Azure y GCP. Además, tengo experiencia en la configuración de pipelines personalizados para la integración y despliegue continuo. Utilizo herramientas como Terraform, New Relic y Docker para mejorar mi flujo de trabajo.',
  'No podemos olvidar que el desarrollo de software se basa en las personas que lo llevan a cabo. A lo largo de mi carrera, he tenido el privilegio de trabajar y aprender de profesionales excepcionales a quienes admiro. Además, asesorar nuevos desarrolladores ha sido una experiencia gratificante.',
];
const bodyPt: string[] = [
  'Sou um desenvolvedor Full-Stack com mais de 6 anos de experiência, especializado em JavaScript. Para mim, programação é uma forma de arte pela qual transformo ideias em realidade usando tecnologia.',
  'Tenho ampla experiência na criação de aplicações web e mobile, seguindo as melhores práticas e padrões da indústria. Estou sempre aberto a explorar novas tecnologias e me manter atualizado sobre as últimas bibliotecas e frameworks da comunidade tecnológica.',
  'Atualmente, é fundamental dominar ferramentas que permitem compilar, implantar e monitorar aplicativos. Sinto-me confortável construindo e gerenciando infraestrutura em ambientes de nuvem, como AWS, Azure e GCP. Além disso, tenho experiência em configurar pipelines personalizados para integração e implantação contínuas. Utilizo ferramentas como Terraform, New Relic e Docker para aprimorar meu fluxo de trabalho.',
  'Não podemos esquecer que o desenvolvimento de software é baseado nas pessoas que o realizam. Ao longo da minha carreira, tive o privilégio de trabalhar e aprender com profissionais excepcionais que admiro. Além disso, orientar novos desenvolvedores tem sido uma experiência gratificante.',
];

const doc = {
  _id: 'about',
  _type: 'about',
  title: { en: 'Me', es: 'Yo', pt: 'Eu' },
  body: { en: toBlocks(bodyEn), es: toBlocks(bodyEs), pt: toBlocks(bodyPt) },
  stack: [
    'JavaScript',
    'TypeScript',
    'Python',
    'React',
    'Node.js',
    'Astro',
    'AWS',
    'GCP',
    'Azure',
    'Terraform',
    'Docker',
    'New Relic',
  ],
};

async function main() {
  await client.createOrReplace(doc);
  console.log('Seeded published about document.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
