/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        stage: '#000000',
        ink: '#f6f5fb',
        surface: { DEFAULT: '#ffffff', 2: '#e8e4f4' },
        line: { DEFAULT: '#e6e3ef', soft: '#efedf6' },
        fg: '#1b1a22',
        dim: '#57546a',
        faint: '#6a6779',
        label: '#6a6779',
        brand: {
          DEFAULT: '#6b5fa8',
          ink: '#ffffff',
          soft: '#e4e0fb',
          warm: '#efb6ec',
          rose: '#8e7ff0',
          deep: '#433d56'
        },
        aurora: {
          base: '#e7dffb',
          1: '#b9a3f7',
          2: '#efb6ec',
          3: '#a9dcff',
          4: '#ffe0f2'
        },
        kind: {
          person: '#e2d6f3',
          place: '#d3e8d8',
          object: '#f7e0c6',
          event: '#f9d9cf',
          animal: '#d5e2f2'
        },
        'kind-ink': {
          person: '#4a3566',
          place: '#2d5340',
          object: '#6b4522',
          event: '#71382a',
          animal: '#2f4665'
        },
        delta: { up: '#5145cd', note: '#b07708', down: '#b03a4e' },
        warn: { soft: '#fcefd9', ink: '#7a4800' },
        good: { soft: '#e3f4ea', ink: '#1a6b43' },
        mastery: { high: '#2f7a5c', medium: '#a06210', low: '#b03a4e' }
      },
      fontFamily: {
        book: ['Manrope_400Regular'],
        mid: ['Manrope_500Medium'],
        strong: ['Manrope_600SemiBold'],
        heavy: ['Manrope_700Bold']
      },
      fontSize: {
        caps: ['10.5px', { lineHeight: '14px', letterSpacing: '1.3px' }],
        note: ['12px', { lineHeight: '18px' }],
        hint: ['13px', { lineHeight: '19px' }],
        body: ['14px', { lineHeight: '21px' }],
        lead: ['16px', { lineHeight: '24px' }],
        title: ['20px', { lineHeight: '26px' }],
        display: ['28px', { lineHeight: '32px' }],
        hero: ['34px', { lineHeight: '38px' }]
      },
      spacing: {
        tap: '48px',
        'tap-ios': '44px'
      },
      minHeight: {
        tap: '48px'
      },
      minWidth: {
        tap: '48px'
      },
      borderRadius: {
        card: '14px',
        panel: '18px',
        large: '24px',
        cloud: '30px'
      },
      boxShadow: {
        card: '0 6px 18px rgba(90, 70, 160, 0.1)',
        bar: '0 10px 24px rgba(90, 70, 160, 0.14)'
      }
    }
  },
  plugins: []
}
