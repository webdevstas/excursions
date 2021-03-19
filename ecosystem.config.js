module.exports = {
  apps: [{
    name: 'app',
    script: './bin/www',
    exec_mode: 'cluster',
    instances: 4,
    env: {
      NODE_ENV: "production",
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
