module.exports = {
  apps: [{
    name: 'app',
    script: './bin/www',
    watch: true,
    ignore_watch: ["node_modules", "*.log"],
    exec_mode: 'cluster',
    instances: 2,
    env: {
      NODE_ENV: "production",
    },
    error_file: 'err.log',
    out_file: 'out.log',
    log_file: 'combined.log',
    time: true
  }]
};
