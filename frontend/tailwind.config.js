/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-hebrew': ['Noto Sans Hebrew', 'sans-serif'],
        'heebo': ['Heebo', 'sans-serif'],
        'assistant': ['Assistant', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
      },
      colors: {
        // צבעי המערכת החדשים
        success: {
          50: '#e7f7e7',
          100: '#c3efc3',
          200: '#9fe79f',
          300: '#7bdf7b',
          400: '#57d757',
          500: '#33cf33',
          600: '#29a329',
          700: '#1f771f',
          800: '#154b15',
          900: '#0b1f0b'
        },
        warning: {
          50: '#fbefcc',
          100: '#f7dfaa',
          200: '#f3cf88',
          300: '#efbf66',
          400: '#ebaf44',
          500: '#e79f22',
          600: '#b97f1b',
          700: '#8b5f14',
          800: '#5d3f0d',
          900: '#2f1f06'
        },
        error: {
          50: '#fdacae',
          100: '#fc9295',
          200: '#fb787c',
          300: '#fa5e63',
          400: '#f9444a',
          500: '#f82a31',
          600: '#c62227',
          700: '#941a1d',
          800: '#621113',
          900: '#310909'
        },
        info: {
          50: '#d1eefd',
          100: '#a3ddfa',
          200: '#75ccf7',
          300: '#47bbf4',
          400: '#1aa9f1',
          500: '#0891d1',
          600: '#0674a7',
          700: '#04577d',
          800: '#023a53',
          900: '#001d29'
        },
        purple: {
          50: '#e7cdff',
          100: '#d9b3ff',
          200: '#cb99ff',
          300: '#bd7fff',
          400: '#af65ff',
          500: '#a14bff',
          600: '#813ccc',
          700: '#612d99',
          800: '#411e66',
          900: '#200f33'
        },
        purpleAlt: {
          50: '#e2dff2',
          100: '#d1cceb',
          200: '#c0b9e4',
          300: '#afa6dd',
          400: '#9e93d6',
          500: '#8d80cf',
          600: '#7166a5',
          700: '#554d7b',
          800: '#393351',
          900: '#1c1a28'
        },
        orange: {
          50: '#fee2d5',
          100: '#fdd5c0',
          200: '#fcc8ab',
          300: '#fbbb96',
          400: '#faae81',
          500: '#f9a16c',
          600: '#c78156',
          700: '#956141',
          800: '#63402b',
          900: '#322016'
        },
        customGray: {
          50: '#f7f7f7',
          100: '#e9e9e9',
          200: '#d1d1d1',
          300: '#b9b9b9',
          400: '#a1a1a1',
          500: '#898989',
          600: '#6d6d6d',
          700: '#515151',
          800: '#353535',
          900: '#191919'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}