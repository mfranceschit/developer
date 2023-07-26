import { nanoid } from 'nanoid';

const en = {
  home: {
    title: 'Marco Franceschi',
    subtitle: `Senior Full-stack Developer`,
  },
  about: {
    title: 'Me',
    description: [
      'I am a Full-stack Developer with over 6 years of experience specializing in JavaScript. To me, coding is akin to an art form, where I transform ideas into reality using technology.',
      'I have ample experience in creating mobile and web applications following the best practices and industry standards while developing software, whether it involves starting a project from scratch, implementing new features, or enhancing existing ones. I embrace the opportunity to explore new frameworks and technologies, always staying updated with the latest libraries and frameworks in the tech community.',
      'Nowadays, mastering the tools that enable seamless application building, deployment, and monitoring is crucial. I feel confident in my ability to create and manage infrastructure on cloud platforms like AWS, Azure, and GCP. Additionally, I have hands-on experience in setting up pipelines for continuous delivery and integration. I am proficient in leveraging tools like Terraform, New Relic, Docker that boost my workflow.',
      "Let's not forget that software development is ultimately about the people involved. Throughout my career, I have had the privilege of working and learning from exceptional professionals whom I admire. Also, mentoring new developers has been a rewarding experience.",
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
    title: 'Contact',
    description: 'Would you like to work together?',
    cta: "Let's Talk!",
    placeholderSubject: 'Subject',
    placeholderMessage: 'Message',
    socials: 'Find me on social media as ',
  },
};

export default en;
