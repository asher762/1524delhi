/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-boska)', 'Georgia', 'serif'],
        sans: ['var(--font-literata)', 'system-ui', 'sans-serif'],
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--foreground)',
              '--tw-prose-headings': 'var(--foreground)',
              h1: {
                fontWeight: '400',
                marginBottom: '0.25em',
                marginTop: '0.5em',
              },
              h2: {
                fontWeight: '400',
                marginBottom: '0.25em',
                marginTop: '0.5em'
              },
              h3: {
                fontWeight: '500',
                marginBottom: '0.5em',
                letterSpacing: '0.025em',
              },
              h4: {
                fontWeight: '600',
              },
              p: {
                fontSize: '1.10rem',
                fontWeight: '200',
            },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '4.5rem',
              },
              h2: {
                fontSize: '3.5rem',
              },
              h3: {
                fontSize: '2rem',
              },
              h4: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
