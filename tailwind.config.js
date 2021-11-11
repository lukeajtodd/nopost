const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sansSerif: [
          'Lato',
          defaultTheme.fontFamily.sansSerif,
        ]
      },
    }
  }
}