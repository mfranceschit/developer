import { nanoid } from 'nanoid';

const pt = {
  home: {
    title: 'Marco Franceschi',
    subtitle: `Senior Full-stack Developer`,
  },
  about: {
    title: 'Eu',
    description: ['Sou um desenvolvedor Full-stack com mais de 6 anos de experiência, especializado em JavaScript. Para mim, programação é uma forma de arte pela qual transformo ideias em realidade usando tecnologia.',
    'Tenho ampla experiência na criação de aplicações web e mobile, seguindo as melhores práticas e padrões da indústria. Estou sempre aberto a explorar novas tecnologias e me manter atualizado sobre as últimas bibliotecas e frameworks da comunidade tecnológica.',
    'Atualmente, é fundamental dominar ferramentas que permitem compilar, implantar e monitorar aplicativos. Sinto-me confortável construindo e gerenciando infraestrutura em ambientes de nuvem, como AWS, Azure e GCP. Além disso, tenho experiência em configurar pipelines personalizados para integração e implantação contínuas. Utilizo ferramentas como Terraform, New Relic e Docker para aprimorar meu fluxo de trabalho.',
    'Não podemos esquecer que o desenvolvimento de software é baseado nas pessoas que o realizam. Ao longo da minha carreira, tive o privilégio de trabalhar e aprender com profissionais excepcionais que admiro. Além disso, orientar novos desenvolvedores tem sido uma experiência gratificante.'
    ]
  },
  projects: {  
    title: 'Projetos',
    items: [
      {
        id: nanoid(),
        img: 'ecotext.jpg',
        title: 'ecoText',
        info: 'The best platform to share and collaborate around ebooks. A web application that allows users to read, share and create annotations through a subscription model. It contains a huge catalog of books and papers to read. ',
        info2:
          'I participated as DevOps creating automated pipelines for the frontend, using tools like Gitlab, Docker, and AWS services like CloudFront, S3. Also, I worked as a developer for several sections of the site, the most remarkable was the book reader logic to guarantee Epub files distribution, protecting them to be stolen. Besides, I played as backend developer for a short period, learning about Django and Python.',
        url: 'https://ecotext.co',
        repo: '', // if no repo, the button will not show up
      },
      {
        id: nanoid(),
        img: 'printsmart.jpg',
        title: 'Printsmart',
        info: 'Revamp a new site for Smart Levels Media, one of the largest online printing companies in Orange County, California. An ambitious project to migrate the former site of Smart Levels e-commerce.',
        info2:
          'My role at first was as a backend developer, using my prior knowledge with .NET to migrate the original codebase to a modern stack with C# as a language program. After that, I was involved as a frontend developer as well. I improved some flows from backend to frontend, such as the authentication and the payment modules.',
        url: 'https://www.printsmart.com',
        repo: '', // if no repo, the button will not show up
      },
      {
        id: nanoid(),
        img: 'energybillkill.jpg',
        title: 'EnergyBillKill',
        info: 'Find the best energy supply provider that suits you through a mobile app for Android/iOS, without setting foot in an office. That was the goal for the project based on a microservices architecture built entirely in the JavaScript stack. ',
        info2:
          'It was my first approach to integrating AWS services like SNS, SES, Lambda, Cognito, DynamoDB, among others. I performed a role as a Full-stack developer, using Node.js for the backend and React Native for the frontend. ',
        url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
        repo: '', // if no repo, the button will not show up
      },
      {
        id: nanoid(),
        img: 'jeenie.jpg',
        title: 'Jeenie',
        info: 'Breaking the language boundaries by matching interpreters with users On-Demand by a mobile app for iOS and Android. It uses all the capabilities of WebRTC to create audio and video calls. ',
        info2:
          'I played a role as a frontend developer. At some point, I was in charge of the team for a couple of sprints. I was closely related to the core of the application, the calls module. Developing features such as reconnection, switch camera, mute audio, and the UI related to the video call.',
        url: 'https://jeenie.com',
        repo: '', // if no repo, the button will not show up
      },
    ]
  },
  contact: {
    title: 'Contato',
    description: 'Você gostaria de trabalhar juntos?',
    cta: "Vamos conversar!",
    placeholderSubject: "Assunto",
    placeholderMessage: "Mensagem",
    socials: 'Encontre-me nas redes sociais como '

  },
};

export default pt