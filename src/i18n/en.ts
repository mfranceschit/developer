import { nanoid } from 'nanoid';

const en = {
  menu: {
    about: 'About Me',
    work: 'Projects',
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
    items: [
      {
        id: nanoid(),
        img: 'autocloud.png',
        title: 'AutoCloud',
        description: [
          'AutoCloud helps with the full DevOps lifecycle, from building and deploying to managing and optimizing your cloud infrastructure. Allows you to get secure, cost-optimized cloud infrastructure to production. AutoCloud gives dev, sec, and ops teams multi-cloud visibility through best-in-class visualizations, compliance and security reports, detailed asset change tracking, and an IaC terraform provider to create reusable blueprints in a few clicks. ',
          'I was deeply involve in the different areas of the platform, from add support to cloud services for AWS, Azure, and GCP to build the IaC reusable blueprints.',
          '- Created and refactored large sections of the site frontend. For example, The whole IAC Catalog section, The integrations section for Github and Jira. The charts fo the benchmarks results cards, among others.',
          '- Completed complex challenges to support new features, among them, process the terraform provider input and generate the IaC blueprints.',
          '- Added support for multiple cloud providers services like AWS, GCP, and Azure.',
        ],
        url: 'https://www.autocloud.io/',
        repo: '',
        technologies: [
          'React',
          'Node.js',
          'NestJS',
          'ElasticMQ',
          'PostgresSQL',
          'TypeScript',
          'Apollo',
          'GraphQl',
          'Material UI',
          'Docker',
          'Jest',
          'Prisma',
          'Sentry',
          'Reids',
          'AWS SDK',
          'GCP SDK',
          'Azure SDK',
        ],
      },
      {
        id: nanoid(),
        img: 'tfprovider.png',
        title: 'AC Terraform Provider',
        description: [
          'The AutoCloud Terraform Provider is the DevOps solution to create reusable blueprints based on HCL code that can be extended and manage through the Autocloud Platform. ',
          'This was my biggest challenges during my time on Autocloud, it implies deal with unknown technologies for me at the moment as Golang and Terraform. We created the Terraform Provider from scratch taking in the insights for different DevOps experts. We shaped a product that facilitates the DevOps workflow. ',
        ],
        url: 'https://docs.autocloud.io/getting-started-with-terraform-blueprints',
        repo: 'https://github.com/autoclouddev/terraform-provider-autocloud',
        technologies: [
          'Golang',
          'Terraform',
          'Terraform Plugin SDK',
          'terraform-plugin-go',
          'Testify',
        ],
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
        technologies: [
          'GraphQl',
          'oclif',
          'Express',
          'TypeScript',
          'Dgraph',
          'Jest',
          'LocalStack',
          'AWS SDK',
          'GCP SDK',
          'Azure SDK',
        ],
      },
      {
        id: nanoid(),
        img: 'ecotext.jpg',
        title: 'ecoText',
        description: [
          'The best platform to share and collaborate around ebooks. A web application that allows users to read, share and create annotations through a subscription model. It contains a huge catalog of books and papers to read. ',
          'I participated as DevOps creating automated pipelines for the frontend. Also, I worked as a developer for several sections of the site, the most remarkable was the book reader logic to guarantee Epub files distribution, protecting them to be stolen. Besides, I played as backend developer for a short period, learning about Django and Python.',
        ],
        url: 'https://ecotext.co',
        repo: '',
        technologies: [
          'Epub.js',
          'Sentry',
          'Material UI',
          'TypeScript',
          'React',
          'React Testing Library',
          'Jest',
          'Python',
          'Django',
          'Stripe',
          'Docker',
          'Amazon S3',
          'Amazon CloudFront',
          'AWS Elastic Beanstalk',
          'Amazon RDS',
          'PostgreSQL',
          'Gitlab CI/CD pipeline',
        ],
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
        technologies: [
          'ASP.NET Core',
          'Microsoft SQL Server',
          'Azure Cosmos DB',
          'Entity Framework',
          'Visual Basic',
          'React',
          'TypeScript',
          'PM2',
          'Koa',
          'Node.js',
        ],
      },
      {
        id: nanoid(),
        img: 'energybillkill.jpg',
        title: 'EnergyBillKill',
        description: [
          'Find the best energy supply provider that suits you through a mobile app for Android/iOS, without setting foot in an office. That was the goal for the project based on a microservices architecture built entirely in the JavaScript stack. ',
          'It was my first approach integrating AWS services. I performed a role as a Full-Stack developer, using Node.js for the backend and React Native for the frontend.',
          'My main challenge was reuse the most of the outdated codebase of the former mobile app and turning into a up-to-date stack. Also, I took the advantages of Expo to turn the existing app into a website.',
        ],
        url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
        repo: '',
        technologies: [
          'React Native',
          'TypeScript',
          'Terraform',
          'Redux-Saga',
          'Amazon SNS',
          'Amazon SES',
          'AWS Lambda',
          'Amazon Cognito',
          'Amazon DynamoDB',
          'Amazon CloudWatch',
          'Koa',
          'Node.js',
          'Bugsnag',
          'Lottie',
        ],
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
        technologies: [
          'React Native',
          'React Native Elements',
          'Redux',
          'react-native-opentok',
          'WebRTC',
          'OneSignal',
        ],
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
  },
};

export default en;
