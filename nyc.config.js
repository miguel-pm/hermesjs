const { NODE_ENV } = process.env;

module.exports = {
  'extends': "@istanbuljs/nyc-config-typescript",
  'all': true,
  'check-coverage': NODE_ENV === 'production',
  'include': [
    'src/**/*.utils.ts',
    'src/**/*.validators.ts'
  ],
  'temp-dir': '.nyc_output/temp',
  'report-dir': '.nyc_output/coverage',
  'reporter': ['lcov', 'text'],
  'watermarks': {
    'lines': [80, 95],
    'functions': [80, 95],
    'branches': [80, 95],
    'statements': [80, 95]
  }
};
