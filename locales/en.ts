import { nanoid } from 'nanoid';

const en = {
  menu: {
    about: 'About Me',
    work: 'Projects',
    certifications: 'Certifications',
    contact: 'Contact',
  },
  home: {
    title: 'Marco Franceschi',
    subtitle: `Senior Full-Stack Developer`,
  },
  about: {
    title: 'Me',
    description: [
      'I am a Full-Stack Developer with over 6 years of experience specializing in JavaScript. To me, coding is akin to an art form, where I transform ideas into reality using technology.',
      'I have ample experience in creating mobile and web applications following the best practices and industry standards while developing software, whether it involves starting a project from scratch, implementing new features, or enhancing existing ones. I embrace the opportunity to explore new frameworks and technologies, always staying updated with the latest libraries and frameworks in the tech community.',
      'Nowadays, mastering the tools that enable seamless application building, deployment, and monitoring is crucial. I feel confident in my ability to create and manage infrastructure on cloud platforms like AWS, Azure, and GCP. Additionally, I have hands-on experience in setting up pipelines for continuous delivery and integration. I am proficient in leveraging tools like Terraform, New Relic, Docker that boost my workflow.',
      "Let's not forget that software development is ultimately about the people involved. Throughout my career, I have had the privilege of working and learning from exceptional professionals whom I admire. Also, mentoring new developers has been a rewarding experience.",
    ],
  },
  projects: {
    title: 'Projects',
    stack: 'Technologies',
    summary: 'Summary',
  },
  certifications: {
    title: 'Certifications',
    certificatesTitle: 'Certificates',
    degreesTitle: 'Degrees',
    certificates: [
      {
        id: nanoid(),
        img: 'jsnad-openjs-node-js-application-developer.png',
        name: 'JSNAD: OpenJS Node.js Application Developer',
        issued: 'Issued on February 2023',
        url: 'https://www.credly.com/badges/077b443b-d016-470a-a931-789098a38655',
      },
      {
        id: nanoid(),
        img: 'jsnsd-openjs-node-js-services-developer.png',
        name: 'JSNSD: OpenJS Node.js Services Developer',
        issued: 'Issued on January 2023',
        url: 'https://www.credly.com/badges/3636c6a7-661e-45e2-8d0d-5dd3cddf489b',
      },
      {
        id: nanoid(),
        img: 'lfw211-node-js-application-development.png',
        name: 'LFW211: Node.js Application Development',
        issued: 'Issued on September 2022',
        url: 'https://www.credly.com/badges/d44cffa0-19ac-415c-a0ff-ba9fa1860163',
      },
      {
        id: nanoid(),
        img: 'lfw212-node-js-services-development.png',
        name: 'LFW212: Node.js Services Development',
        issued: 'Issued on January 2023',
        url: 'https://www.credly.com/badges/a6c1a3aa-406c-46bd-b738-1a88768a81f4',
      },
    ],
    degrees: [
      {
        id: nanoid(),
        img: 'ucab-logo.jpeg',
        issued: 'Issued on November 2017',
        name: 'Computer Engineer',
      },
    ],
  },
  contact: {
    title: 'Contact',
    description: 'Would you like to work together?',
    cta: "Let's Talk!",
    placeholderSubject: 'Subject',
    placeholderMessage: 'Message',
    socials: 'Find me on social media as ',
    submitted: 'Great! Talk to you soon',
  },
  serps: {
    home: {
      title: 'Marco Franceschi',
      description:
        'A seasoned full-stack developer with expertise in building high-performance web applications.',
    },
    about: {
      title: 'Me',
      description:
        'Full-stack developer with 6+ years of experience building web & mobile apps. Passionate coder, cloud & CI/CD expert, loves learning & collaboration.',
    },
    projects: {
      title: 'Projects',
      description:
        'Explore my diverse portfolio of projects built with cutting-edge technologies like TypeScript, Node.js, React, and more.',
    },
    certifications: {
      title: 'Certifications',
      description:
        'Dive deeper into my technical background and explore the certifications and education that have shaped my skills as a full-stack developer',
    },
    contact: {
      title: 'Contact',
      description:
        "Interested in working together? I'm always open to exciting opportunities and connecting with fellow tech enthusiasts.",
    },
  },
};

export default en;
