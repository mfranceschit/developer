import { nanoid } from 'nanoid';

const pt = {
  home: {
    title: 'Marco Franceschi',
    subtitle: `Senior Full-stack Developer`,
  },
  about: {
    title: 'Eu',
    description: [
      'Sou um desenvolvedor Full-stack com mais de 6 anos de experiência, especializado em JavaScript. Para mim, programação é uma forma de arte pela qual transformo ideias em realidade usando tecnologia.',
      'Tenho ampla experiência na criação de aplicações web e mobile, seguindo as melhores práticas e padrões da indústria. Estou sempre aberto a explorar novas tecnologias e me manter atualizado sobre as últimas bibliotecas e frameworks da comunidade tecnológica.',
      'Atualmente, é fundamental dominar ferramentas que permitem compilar, implantar e monitorar aplicativos. Sinto-me confortável construindo e gerenciando infraestrutura em ambientes de nuvem, como AWS, Azure e GCP. Além disso, tenho experiência em configurar pipelines personalizados para integração e implantação contínuas. Utilizo ferramentas como Terraform, New Relic e Docker para aprimorar meu fluxo de trabalho.',
      'Não podemos esquecer que o desenvolvimento de software é baseado nas pessoas que o realizam. Ao longo da minha carreira, tive o privilégio de trabalhar e aprender com profissionais excepcionais que admiro. Além disso, orientar novos desenvolvedores tem sido uma experiência gratificante.',
    ],
  },
  projects: {
    title: 'Projects',
    items: [
      {
        id: nanoid(),
        img: 'autocloud.png',
        title: 'AutoCloud',
        description: [
          'AutoCloud helps with the full DevOps lifecycle, from building and deploying to managing and optimizing your cloud infrastructure. Allows you to get secure, cost-optimized cloud infrastructure to production. AutoCloud gives dev, sec, and ops teams multi-cloud visibility through best-in-class visualizations, compliance and security reports, detailed asset change tracking, and an IaC terraform provider to create reusable blueprints in a few clicks. ',
          'I was deeply involve in the different areas of the platform, from add support to cloud services for AWS, Azure, and GCP to build the IaC reusable blueprints.',
          '- Created and refactored large sections of the site frontend. using TypeScript and Material UI.',
          '- Built reusable components using React.',
          '- Completed complex challenges to support new features, among them, process the terraform provider input and generate the IaC blueprints. Using Node.js, NestJS, ElasticMQ, PostgresSQL, and more.',
        ],
        url: 'https://www.autocloud.io/',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'tfprovider.png',
        title: 'AutoCloud Terraform Provider',
        description: [
          'The AC Terraform Provider is the DevOps solution to create reusable blueprints based on HCL code that can be extended and manage through the Autocloud Platform. ',
          'This was my biggest challenges during my time on Autocloud, it implies deal with unknown technologies for me at the moment as Golang and Terraform. We created the Terraform Provider from scratch taking in the insights for different DevOps experts. We shaped a product that facilitates the DevOps workflow. ',
        ],
        url: 'https://docs.autocloud.io/getting-started-with-terraform-blueprints',
        repo: 'https://github.com/autoclouddev/terraform-provider-autocloud',
      },
      {
        id: nanoid(),
        img: 'cloudgraph.png',
        title: 'CloudGraph',
        description: [
          'CloudGraph is an open source tool that helps you understand the current state of your cloud environments. Access to your resources data in a simpler way, write simple queries to solve complex challenges. Also, it uses multiple benchmarks as CIS, PCI DSS, and NIST 800-53 to detect any vulnerability on your infrastructure, and ensure security best practices. ',
          'I worked from the beginning of the project, making crucial decisions on the CLI, building providers from scratch, and building the rules engine that perform the compliance checks. Node.js was the main technology used for the project, Dgraph as graph database, other tools like Jest and LocalStack were use for unit testing.',
        ],
        url: 'https://www.cloudgraph.dev/',
        repo: 'https://github.com/cloudgraphdev',
      },
      {
        id: nanoid(),
        img: 'ecotext.jpg',
        title: 'ecoText',
        description: [
          'The best platform to share and collaborate around ebooks. A web application that allows users to read, share and create annotations through a subscription model. It contains a huge catalog of books and papers to read. ',
          'I participated as DevOps creating automated pipelines for the frontend, using tools like Gitlab, Docker, and AWS services like CloudFront, S3. Also, I worked as a developer for several sections of the site, the most remarkable was the book reader logic to guarantee Epub files distribution, protecting them to be stolen. Besides, I played as backend developer for a short period, learning about Django and Python.',
        ],
        url: 'https://ecotext.co',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'printsmart.jpg',
        title: 'Printsmart',
        description: [
          'Revamp a new site for Smart Levels Media, one of the largest online printing companies in Orange County, California. An ambitious project to migrate the former site of Smart Levels e-commerce.',
          'My role at first was as a backend developer, using my prior knowledge with .NET to migrate the original codebase to a modern stack with C# as a language program. After that, I was involved as a frontend developer as well. I improved some flows from backend to frontend, such as the authentication and the payment modules.',
        ],
        url: 'https://www.printsmart.com',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'energybillkill.jpg',
        title: 'EnergyBillKill',
        description: [
          'Find the best energy supply provider that suits you through a mobile app for Android/iOS, without setting foot in an office. That was the goal for the project based on a microservices architecture built entirely in the JavaScript stack. ',
          'It was my first approach to integrating AWS services like SNS, SES, Lambda, Cognito, DynamoDB, among others. I performed a role as a Full-stack developer, using Node.js for the backend and React Native for the frontend. ',
        ],
        url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'jeenie.jpg',
        title: 'Jeenie',
        description: [
          'Breaking the language boundaries by matching interpreters with users On-Demand by a mobile app for iOS and Android. It uses all the capabilities of WebRTC to create audio and video calls. ',
          'I played a role as a frontend developer. At some point, I was in charge of the team for a couple of sprints. I was closely related to the core of the application, the calls module. Developing features such as reconnection, switch camera, mute audio, and the UI related to the video call.',
        ],
        url: 'https://jeenie.com',
        repo: '',
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
