module.exports = {
  apps: [{
    name: 'app',
    script: './bin/www',
    watch: '.',
    ignore_watch: ["node_modules"],
    // exec_mode: 'cluster',
    // instances: 2,
    env: {
      NODE_ENV: "production",
    }
  }]
};
