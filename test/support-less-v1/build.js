{
  appDir: ".",
  baseUrl: ".",
  mainConfigFile: "config.js",
  dir: "out",
  fileExclusionRegExp: /(?:^build\.js$)|(?:lessc\.js$)|(?:\.less$)|(?:\.html$)/,

  less: {
    compress: true
  },

  modules: [
    {name: "test"}
  ]
}
