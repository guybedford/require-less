({
  appDir: 'www',
  dir: 'www-built',
  baseUrl: '.',
  fileExclusionRegExp: /(^example)|(.git)$/,
  packages: [
  {
    name: 'css',
    location: 'require-css',
    main: 'css'
  },
  {
    name: 'less',
    location: 'require-less',
    main: 'less'
  }
  ],
  modules: [
    {
      name: 'core-components',
      create: true,
      include: ['css', 'components/component'],
      excludeShallow: ['css/css-builder', 'less/lessc-server', 'less/lessc']
    },
    {
      name: 'app',
      exclude: ['core-components', 'less']
    }
  ]
})
