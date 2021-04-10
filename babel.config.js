module.exports = {
  presets: ['@babel/preset-env'],
  targets: {
    "browsers": "last 2 versions",
    "esmodules": true
  },
  plugins: [
    '@babel/plugin-proposal-class-properties',
    "@babel/plugin-transform-runtime"
  ]
}