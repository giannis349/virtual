module.exports = {
  timeout: 100,
  load: {
    before: ['cors'],
    order: [
      "Define the middlewares' load order by putting their name in this array is the right order",
    ],
    after: [],
  },
  settings: {
    cors: {
      enabled: true,
      origin:['*']
    },
    public: {
      path: './public',
      maxAge: 60000,
    },
    cron: { enabled: true }
  },
  favicon: {
    path: "favicon.ico",
    maxAge: 86400000
  },
  public: {
    path: "./public",
    maxAge: 60000
  }
};