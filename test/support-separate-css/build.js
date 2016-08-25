{
  appDir: ".",
  baseUrl: ".",
  mainConfigFile: "config.js",
  dir: "out",
  fileExclusionRegExp: /(?:^build\.js$)|(?:lessc\.js$)|(?:\.less$)|(?:\.html$)/,

  siteRoot: ".",
  separateCSS: true,
  less: {
    compress: true
  },

  modules: [
    {name: "test"}
  ]
}
