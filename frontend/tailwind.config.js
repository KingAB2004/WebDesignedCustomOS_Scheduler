/** @type {import('tailwindcss').Config} */  // helps the editor recognise that it is the tailwinf config file, this comment is known as JSDoc comment
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", //  search Query for all types of react files and js and ts files
  ],
  theme: {
    extend: {}, // helps in extending the already available classes of tailwind
  },
  plugins: [],
}