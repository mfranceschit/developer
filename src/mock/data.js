import { nanoid } from 'nanoid';

// HEAD DATA
export const headData = {
  title: 'Marco Franceschi', // e.g: 'Name | Developer'
  lang: 'en', // e.g: en, es, fr, jp
  description: 'Hola mola', // e.g: Welcome to my website
};

// HERO DATA
export const heroData = {
  title: '',
  name: 'Marco Franceschi',
  subtitle: `I'm a Code Craftsman`,
  cta: '',
};

// ABOUT DATA
export const aboutData = {
  img: 'profile.png',
  paragraphOne: 'For me, Coding can be interpreted as a way of art. I enjoy turn ideas into reality using technology. I take advantage of best practices and standards to create software, either for building a project architecture from scratch, create a new feature, or even improve an existing one.',
  paragraphTwo: `I'm not afraid to try new frameworks and technologies. I keep myself updated reading about new libraries and frameworks, always keeping an eye on what's happening in the community.`,
  paragraphThree: `Let's be clear software development is about people. For years I've been part of teams with great professionals that I admire. I feel lucky to learn from other and mentoring new developers.`,
  resume: '', // if no resume, the button will not show up
};

// PROJECTS DATA
export const projectsData = [
  {
    id: nanoid(),
    img: 'ecotext.jpg',
    title: 'ecoText',
    info: '',
    info2: '',
    url: 'https://ecotext.co',
    repo: '', // if no repo, the button will not show up
  },
  {
    id: nanoid(),
    img: 'printsmart.jpg',
    title: 'Printsmart',
    info: '',
    info2: '',
    url: 'https://www.printsmart.com',
    repo: '', // if no repo, the button will not show up
  },
  {
    id: nanoid(),
    img: 'energybillkill.jpg',
    title: 'EnergyBillKill',
    info: '',
    info2: '',
    url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
    repo: '', // if no repo, the button will not show up
  },
  {
    id: nanoid(),
    img: 'jeenie.jpg',
    title: 'Jeenie',
    info: '',
    info2: '',
    url: 'https://jeenie.com',
    repo: '', // if no repo, the button will not show up
  },
];

// CONTACT DATA
export const contactData = {
  cta: '',
  btn: '',
  email: 'franceschi.marco@gmail.com',
};

// FOOTER DATA
export const footerData = {
  networks: [
    {
      id: nanoid(),
      name: 'linkedin',
      url: 'https://www.linkedin.com/in/mfranceschit/',
    },
    {
      id: nanoid(),
      name: 'github',
      url: 'https://github.com/mfranceschit',
    },
    {
      id: nanoid(),
      name: 'gitlab',
      url: 'https://gitlab.com/mfranceschit',
    },
    {
      id: nanoid(),
      name: 'medium',
      url: 'https://medium.com/@mfranceschit',
    },
  ],
};

// Github start/fork buttons
export const githubButtons = {
  isEnabled: true, // set to false to disable the GitHub stars/fork buttons
};
