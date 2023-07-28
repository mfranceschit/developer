import { nanoid } from 'nanoid';

const es = {
  menu: {
    about: 'Sobre mí',
    work: 'Proyectos',
    contact: 'Contacto',
  },
  home: {
    title: 'Marco Franceschi',
    subtitle: `Desarrollador Full-stack Sénior`,
  },
  about: {
    title: 'Yo',
    description: [
      'Soy un desarrollador Full-stack con más de 6 años de experiencia especializado en JavaScript. Para mí, programar es una forma de arte en la que transformo ideas en realidad a través de la tecnología.',
      'Poseo amplia experiencia en la creación de aplicaciones web y móviles, siguiendo las mejores prácticas y estándares de la industria. Siempre estoy abierto a explorar nuevas tecnologías, manteniéndome actualizado sobre las últimas librerías y frameworks en la comunidad tecnológica.',
      'Hoy en día, es crucial dominar ciertas herramientas que te permitan, compilar, desplegar y monitorear tu aplicación. Me siento cómodo creando y gestionando infraestructura en entornos de nube como AWS, Azure y GCP. Además, tengo experiencia en la configuración de pipelines personalizados para la integración y despliegue continuo. Utilizo herramientas como Terraform, New Relic y Docker para mejorar mi flujo de trabajo.',
      'No podemos olvidar que el desarrollo de software se basa en las personas que lo llevan a cabo. A lo largo de mi carrera, he tenido el privilegio de trabajar y aprender de profesionales excepcionales a quienes admiro. Además, asesorar nuevos desarrolladores ha sido una experiencia gratificante.',
    ],
  },
  projects: {
    title: 'Proyectos',
    items: [
      {
        id: nanoid(),
        img: 'autocloud.png',
        title: 'AutoCloud',
        description: [
          'AutoCloud ayuda con todo el ciclo de vida de DevOps, desde la construcción e implementación hasta la gestión y optimización de la infraestructura en la nube. Te permite obtener una infraestructura en la nube segura y optimizada para la producción. AutoCloud brinda a los equipos de desarrollo, seguridad y operaciones una visibilidad multi-nube a través de visualizaciones de primera clase, informes de cumplimiento y seguridad, seguimiento detallado de cambios de activos y un proveedor de terraform IaC para crear blueprints reutilizables con unos pocos clics.',
          'Estuve profundamente involucrado en diferentes áreas de la plataforma, desde agregar soporte para servicios en la nube de AWS, Azure y GCP hasta construir los blueprints reutilizables de IaC.',
          '- Creé y refactoricé grandes secciones del frontend del sitio utilizando TypeScript y Material UI.',
          '- Construí componentes reutilizables utilizando React.',
          '- Afronté desafíos complejos para admitir nuevas características, entre ellas, procesar la entrada del proveedor de terraform y generar los blueprints de IaC. Utilicé Node.js, NestJS, ElasticMQ, PostgresSQL, entre otras tecnologías.',
        ],
        url: 'https://www.autocloud.io/',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'tfprovider.png',
        title: 'AutoCloud Terraform Provider',
        description: [
          'El proveedor de Terraform de AutoCloud es la solución DevOps para crear planos reutilizables basados en código HCL que pueden ser extendidos y administrados a través de la Plataforma Autocloud.',
          'Este fue mi mayor desafío durante mi tiempo en Autocloud, ya que implicó lidiar con tecnologías desconocidas para mí en ese momento, como Golang y Terraform. Creamos el proveedor de Terraform desde cero, teniendo en cuenta las ideas de diferentes expertos en DevOps. Creamos un producto que facilita el flujo de trabajo de los DevOps.',
        ],
        url: 'https://docs.autocloud.io/getting-started-with-terraform-blueprints',
        repo: 'https://github.com/autoclouddev/terraform-provider-autocloud',
      },
      {
        id: nanoid(),
        img: 'cloudgraph.png',
        title: 'CloudGraph',
        description: [
          'CloudGraph es una herramienta de código abierto que te ayuda a comprender el estado actual de tus entornos en la nube. Accede a los datos de tus recursos de una manera más sencilla, escribe consultas simples para resolver desafíos complejos. Además, utiliza múltiples benchmarks como CIS, PCI DSS y NIST 800-53 para detectar vulnerabilidades en tu infraestructura y garantizar las mejores prácticas de seguridad.',
          'Trabajé desde el inicio del proyecto, tomando decisiones cruciales en la interfaz de línea de comandos (CLI), construyendo proveedores desde cero y desarrollando el motor de reglas que realiza las verificaciones de compliance. Node.js fue la tecnología principal utilizada en el proyecto, Dgraph como base de datos de grafos, y otras herramientas como Jest y LocalStack se utilizaron para las pruebas unitarias.',
        ],
        url: 'https://www.cloudgraph.dev/',
        repo: 'https://github.com/cloudgraphdev',
      },
      {
        id: nanoid(),
        img: 'ecotext.jpg',
        title: 'ecoText',
        description: [
          'La mejor plataforma para compartir y colaborar en torno a libros electrónicos. Una aplicación web que permite a los usuarios leer, compartir y crear anotaciones a través de un modelo de suscripción. Contiene un amplio catálogo de libros y documentos para leer. ',
          'Participé como DevOps, creando canalizaciones automatizadas para el frontend, utilizando herramientas como Gitlab, Docker y servicios de AWS como CloudFront y S3. Además, trabajé como desarrollador en varias secciones del sitio, siendo la más destacada la lógica del lector de libros para garantizar la distribución de archivos Epub y protegerlos para evitar su robo. También tuve una breve participación como desarrollador backend usando Django y Python.',
        ],
        url: 'https://ecotext.co',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'printsmart.jpg',
        title: 'Printsmart',
        description: [
          'Renovación de un nuevo sitio para Smart Levels Media, una de las mayores empresas de impresión en línea en el Condado de Orange, California. Un ambicioso proyecto para migrar el antiguo sitio de comercio electrónico de Smart Levels.',
          'Mi rol al principio fue como desarrollador backend, utilizando mis conocimientos previos en .NET para migrar la base de código original a un stack moderno con C# como lenguaje de programación. Después de eso, también participé como desarrollador frontend. Mejoré algunos flujos desde el backend hasta el frontend, tales como la autenticación y los módulos de pago.',
        ],
        url: 'https://www.printsmart.com',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'energybillkill.jpg',
        title: 'EnergyBillKill',
        description: [
          'Encuentra el mejor proveedor de suministro de energía que se adapte a tus necesidades a través de una aplicación móvil para Android / iOS, sin pisar una oficina. Ese era el objetivo del proyecto, basado en una arquitectura de microservicios construida completamente con el stack de JavaScript.',
          'Fue mi primer acercamiento a la integración de servicios de AWS como SNS, SES, Lambda, Cognito, DynamoDB, entre otros. Desempeñé el rol de desarrollador Full-stack, utilizando Node.js para el backend y React Native para el frontend.',
        ],
        url: 'https://apps.apple.com/us/app/energybillkill/id1436518949',
        repo: '',
      },
      {
        id: nanoid(),
        img: 'jeenie.jpg',
        title: 'Jeenie',
        description: [
          'Rompe las barreras del lenguaje al conectar intérpretes con usuarios a pedido a través de una aplicación móvil para iOS y Android. Utiliza todas las capacidades de WebRTC para crear llamadas de audio y video.',
          'Participé como desarrollador frontend. Por algún tiempo, estuve a cargo del equipo durante un par de sprints. Estuve muy involucrado con el núcleo de la aplicación, el módulo de llamadas. Desarrollé características como la reconexión, cambio de cámara, silenciar audio y la interfaz de usuario para las videollamadas.',
        ],
        url: 'https://jeenie.com',
        repo: '',
      },
    ],
  },
  contact: {
    title: 'Contacto',
    description: '¿Quieres que trabajemos juntos?',
    cta: '¡Hablemos!',
    placeholderSubject: 'Asunto',
    placeholderMessage: 'Mensaje',
    socials: 'Encuéntrame en las redes sociales como ',
  },
};

export default es;
