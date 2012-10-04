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
      include: ['components/component'],
      exclude: ['less']
    },
    {
      name: 'app',
      exclude: ['core-components', 'less']
    }
  ]
})
