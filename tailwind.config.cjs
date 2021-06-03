module.exports = {
  purge: ['./src/**/*.svelte', './src/**/*.css'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    textColor: theme => theme('colors'),
    textColor: {
       'primary': '#1f7abc',
       'secondary': '#ffed4a',
       'danger': '#e3342f',
       'white': '#ffffff',
    },
    fontFamily: {
       'sans': ['Recursive', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Helvetica Neue", 'Arial', 'sans-serif'],
       'serif': ['ui-serif', 'Georgia'],
       'mono': ['ui-monospace', 'SFMono-Regular'],
       'display': ['Oswald'],
       'body': ['Recursive', 'Open Sans'],
    },
    extend: {},
  },
  variants: {
    extend: { inset: ['active'] },
  },
  plugins: [],
}
