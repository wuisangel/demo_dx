/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.{html,js}"
  ],
  theme: {
    
    extend: {
      colors: {
        'gsmadsot': {
          '50': '#f2f7f5',
          '100': '#e0ebe4',
          '200': '#c3d7cc',
          '300': '#9bbaac',
          '400': '#6f9886',
          '500': '#4f7a69',
          '600': '#406959', // neutral
          '700': '#2f4d42',
          '800': '#273e36',
          '900': '#21332d',
          '950': '#121c19',
        },
        'rsmadsot': {
          '50': '#fff1f2',
          '100': '#ffe4e6',
          '200': '#fecdd4',
          '300': '#fda4b0',
          '400': '#fb7187',
          '500': '#f34061',
          '600': '#e01e4b',
          '700': '#b8123d',
          '800': '#9f123b',
          '900': '#881339',
          '950': '#4c051a',
        }
      },
    },
  },
  plugins: [],
}