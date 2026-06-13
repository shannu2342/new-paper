module.exports = {
  apps: [
    {
      name: 'new-paper-backend',
      cwd: '/var/www/apps/new-paper/backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production'
      },
      out_file: '/var/www/apps/new-paper/logs/backend-out.log',
      error_file: '/var/www/apps/new-paper/logs/backend-error.log',
      merge_logs: true,
      time: true
    }
  ]
};
