/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--foreground)',
              '--tw-prose-headings': 'var(--foreground)',
              h1: {
                fontSize: '3rem',
                fontWeight: '200',
                marginBottom: '0.5em',
                lineHeight: '1.1',
              },
              h2: {
                fontSize: '1.75rem',
                fontWeight: '400',
                marginBottom: '0.5em',
                lineHeight: '1.2',
              },
              h3: {
                fontSize: '1.25rem',
                marginBottom: '0.5em',
                letterSpacing: '0.05em',
              },
              h4: {
                fontSize: '1.1rem',
                fontWeight: '400',
                marginBottom: '0.5em',
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3rem',
                marginBottom: '0.5em',
              },
              h2: {
                fontSize: '2.5rem',
                marginBottom: '0.5em',
              },
              h3: {
                fontSize: '1.75rem',
              },
              h4: {
                fontSize: '1.25rem',
                fontWeight: '400',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
