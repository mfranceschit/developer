import { nanoid } from 'nanoid';

const pt = {
  menu: {
    about: 'Sobre Mim',
    work: 'Projetos',
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
    items: [
      {
        id: nanoid(),
        img: 'autocloud.png',
        title: 'AutoCloud',
        description: [
          'O AutoCloud auxilia em todo o ciclo de vida do DevOps, desde a construção e implantação até a gestão e otimização de sua infraestrutura na nuvem. Permite obter uma infraestrutura na nuvem segura e otimizada para a produção. O AutoCloud fornece às equipes de desenvolvimento, segurança e operações uma visibilidade multi-nuvem por meio de visualizações de classe mundial, relatórios de conformidade e segurança, rastreamento detalhado de alterações de ativos e um provedor Terraform IaC para criar planos reutilizáveis em alguns cliques.',
          'Estive profundamente envolvido em diferentes áreas da plataforma, desde adicionar suporte para serviços em nuvem da AWS, Azure e GCP até construir os planos reutilizáveis de IaC.',
          '- Criei e refatorei grandes seções do frontend do site utilizando TypeScript e Material UI.',
          '- Construí componentes reutilizáveis usando React.',
          '- Enfrentei desafios complexos para suportar novos recursos, incluindo o processamento da entrada do provedor Terraform e a geração dos planos de IaC. Usei Node.js, NestJS, ElasticMQ, PostgresSQL entre outros.',
        ],
        url: 'https://www.autocloud.io/',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'tfprovider.png',
        title: 'AutoCloud Terraform Provider',
        description: [
          'O Provedor AutoCloud Terraform é a solução DevOps para criar planos reutilizáveis baseados em código HCL que podem ser estendidos e gerenciados por meio da plataforma Autocloud.',
          'Esse foi meu maior desafio durante meu tempo na Autocloud, pois envolve lidar com tecnologias desconhecidas para mim na época, como Golang e Terraform. Criamos o provedor Terraform do zero, levando em consideração os insights de diferentes especialistas em DevOps. Moldamos um produto que facilita o fluxo de trabalho de DevOps.',
        ],
        url: 'https://docs.autocloud.io/getting-started-with-terraform-blueprints',
        repo: 'https://github.com/autoclouddev/terraform-provider-autocloud',
      },
      {
        id: nanoid(),
        img: 'cloudgraph.png',
        title: 'CloudGraph',
        description: [
          'O CloudGraph é uma ferramenta de código aberto que ajuda a entender o estado atual de seus ambientes de nuvem. Acesse os dados de seus recursos de forma mais simples, escreva consultas simples para resolver desafios complexos. Além disso, utiliza vários benchmarks como CIS, PCI DSS e NIST 800-53 para detectar qualquer vulnerabilidade em sua infraestrutura e garantir as melhores práticas de segurança.',
          'Trabalhei desde o início do projeto, tomando decisões cruciais na interface de linha de comando (CLI), construindo provedores do zero e desenvolvendo o motor de regras que realiza as verificações de conformidade. Node.js foi a principal tecnologia usada no projeto, Dgraph como banco de dados de gráficos, e outras ferramentas como Jest e LocalStack foram usadas para testes unitários.',
        ],
        url: 'https://www.cloudgraph.dev/',
        repo: 'https://github.com/cloudgraphdev',
      },
      {
        id: nanoid(),
        img: 'ecotext.jpg',
        title: 'ecoText',
        description: [
          'A melhor plataforma para compartilhar e colaborar com ebooks. Uma aplicação web que permite aos usuários ler, compartilhar e criar anotações por meio de um modelo de assinatura. Contém um enorme catálogo de livros e documentos disponíveis para leitura. ',
          'Participei como DevOps, criando pipelines automatizados para o frontend, usando ferramentas como Gitlab, Docker e serviços AWS como CloudFront e S3. Além disso, trabalhei como desenvolvedor em várias seções do site, sendo a mais notável a lógica do leitor de livros para garantir a distribuição de arquivos Epub, protegendo-os contra roubo. Além disso, atuei como desenvolvedor backend usando Django e Python.',
        ],
        url: 'https://ecotext.co',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'printsmart.jpg',
        title: 'Printsmart',
        description: [
          'Reestruturação de um novo site para a Smart Levels Media, uma das maiores empresas de impressão online no Condado de Orange, Califórnia. Um projeto ambicioso para migrar o antigo site de comércio eletrônico da Smart Levels.',
          'Meu papel inicialmente foi como desenvolvedor backend, utilizando meus conhecimentos prévios com .NET para migrar a base de código original para um stack moderno com C# como linguagem de programação. Após isso, também participei como desenvolvedor frontend. Melhorei alguns fluxos do backend para o frontend, como a autenticação e os módulos de pagamento.',
        ],
        url: 'https://www.printsmart.com',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'energybillkill.jpg',
        title: 'EnergyBillKill',
        description: [
          'Encontre o melhor fornecedor de energia que se adapte a você por meio de um aplicativo móvel para Android / iOS, sem precisar sair de casa. Esse foi o objetivo do projeto, baseado em uma arquitetura de microsserviços construída completamente no JavaScript stack.',
          'Foi minha primeira abordagem à integração de serviços da AWS, como SNS, SES, Lambda, Cognito, DynamoDB, entre outros. Atuei como desenvolvedor Full-Stack, utilizando Node.js para o backend e React Native para o frontend.',
        ],
        url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'jeenie.jpg',
        title: 'Jeenie',
        description: [
          'Quebrando as barreiras do idioma ao conectar intérpretes com usuários sob demanda por meio de um aplicativo móvel para iOS e Android. Utiliza todas as capacidades do WebRTC para criar chamadas de áudio e vídeo.',
          'Atuei como desenvolvedor frontend. Em determinado momento, fui responsável pela equipe por algumas sprints. Estive intimamente relacionado ao núcleo do aplicativo, o módulo de chamadas. Desenvolvi recursos como reconexão, alternância de câmera, mudo de áudio e a interface de usuário relacionada à chamada de vídeo.',
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
