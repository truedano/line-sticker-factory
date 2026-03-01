/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    50: 'rgb(var(--tw-slate-50) / <alpha-value>)',
                    100: 'rgb(var(--tw-slate-100) / <alpha-value>)',
                    200: 'rgb(var(--tw-slate-200) / <alpha-value>)',
                    300: 'rgb(var(--tw-slate-300) / <alpha-value>)',
                    400: 'rgb(var(--tw-slate-400) / <alpha-value>)',
                    500: 'rgb(var(--tw-slate-500) / <alpha-value>)',
                    600: 'rgb(var(--tw-slate-600) / <alpha-value>)',
                    700: 'rgb(var(--tw-slate-700) / <alpha-value>)',
                    800: 'rgb(var(--tw-slate-800) / <alpha-value>)',
                    900: 'rgb(var(--tw-slate-900) / <alpha-value>)',
                    950: 'rgb(var(--tw-slate-950) / <alpha-value>)',
                },
                line: {
                    DEFAULT: '#06C755',
                    dark: '#05b34c',
                }
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
