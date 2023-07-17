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
      "Let's not forget that software development is ultimately about the people involved. Throughout my career, I have had the privilege of working and learning from exceptional professionals whom I admire. Also, mentoring new developers has been a rewarding experience."
      ]
  },
  projects: {  
    title: 'Projects',
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
    title: 'Contact',
    description: 'Would you like to work together?',
    cta: "Let's Talk!",
    placeholderSubject: "Subject",
    placeholderMessage: "Message",
    socials: 'Find me on social media as '
  },
};

export default en