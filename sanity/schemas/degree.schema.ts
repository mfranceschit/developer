const degree = {
  name: 'degree',
  title: 'Degrees',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'localeString',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt',
          type: 'string',
        },
      ],
    },
    {
      name: 'issued',
      title: 'Issued',
      type: 'localeString',
    },
  ],
};

export default degree;
