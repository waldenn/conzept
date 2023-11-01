/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [],
  theme: {
    extend: {
      screens: {
        tiny: "240px",
        xs: "350px",
      },
      fontSize: {
        xxs: "0.625rem", // 10px
      },
    },
  },
};
