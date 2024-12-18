module.exports = {
  plugins: {
    'postcss-uncss': {
      html: ['public/**/*.html'],
      ignore: [
        'code'
      ]
    },
    'cssnano': {}
  }
}
