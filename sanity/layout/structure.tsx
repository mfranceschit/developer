import { FaTrophy, FaFileContract, FaLaptopCode } from 'react-icons/fa6';
import { StructureBuilder } from 'sanity/desk';

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Portfolio')
    .items([
      S.listItem()
        .title('Certifications')
        .child(
          S.list()
            .title('Certifications')
            .items([
              S.listItem({ id: 'degree', icon: FaTrophy })
                .title('Degrees')
                .child(S.documentTypeList('degree')),
              S.listItem({ id: 'certificates', icon: FaFileContract })
                .title('Certificates')
                .child(S.documentTypeList('certification')),
            ]),
        ),
      S.listItem()
        .title('Work')
        .child(
          S.list()
            .title('Work')
            .items([
              S.listItem({ id: 'work', icon: FaLaptopCode })
                .title('Projects')
                .child(S.documentTypeList('project')),
            ]),
        ),
    ]);
