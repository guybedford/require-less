({
  appDir: 'www',
  dir: 'www-built',
  baseUrl: '.',
  fileExclusionRegExp: /(^example)|(.git)$/,
  map: {
    '*': {
      less: 'require-less/less',
      css: 'require-css/css'
    }
  },
  paths: {
    c: 'less'
  },
  modules: [
    {
      name: 'core-components',
      create: true,
      include: ['components/component', 'css'],
      excludeShallow: ['require-css/css-builder', 'require-less/lessc-server', 'require-less/lessc']
    },
    {
      name: 'app',
      exclude: ['core-components', 'less']
    }
  ]
})
