/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: "tw-",
    important: false,
    content: ["**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: "#000",
                secondary: "#fff",
            },
        },
    },
    plugins: [],
};
