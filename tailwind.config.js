/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Apple Health neutrals — UI base
        canvas: "#ffffff",
        surface: "#ffffff",
        grey6: "#f2f2f7", // secondary surface, cards
        grey5: "#e5e5ea", // divider strong
        grey4: "#d1d1d6", // placeholder fills
        grey3: "#c7c7cc",
        divider: "rgba(60,60,67,0.18)",
        separator: "rgba(60,60,67,0.36)",

        // Text
        ink: "#000000",
        "text-1": "#000000",
        "text-2": "rgba(60,60,67,0.6)",
        "text-3": "rgba(60,60,67,0.3)",

        // Data category colours — rings / icons / dots / progress ONLY.
        // Never use these as card backgrounds or body text.
        food: "#34c759",
        water: "#007aff",
        air: "#64d2ff",
        producer: "#ff9500",
        honey: "#ffcc00",
        alert: "#ff3b30",
        action: "#007aff",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        serif: ["SourceSerif4_500Medium_Italic"],
        mono: ["Menlo"], // SF Mono fallback; iOS uses Menlo as system monospace
      },
      fontSize: {
        "largeTitle": ["34px", { lineHeight: "36px", letterSpacing: "-0.75px" }],
        "title-1": ["28px", { lineHeight: "32px", letterSpacing: "-0.56px" }],
        "title-2": ["22px", { lineHeight: "26px", letterSpacing: "-0.33px" }],
        "title-3": ["20px", { lineHeight: "24px", letterSpacing: "-0.24px" }],
        headline: ["17px", { lineHeight: "22px", letterSpacing: "-0.17px" }],
        body: ["17px", { lineHeight: "22px", letterSpacing: "-0.08px" }],
        sub: ["15px", { lineHeight: "20px", letterSpacing: "-0.08px" }],
        caption: ["13px", { lineHeight: "18px" }],
        footnote: ["11px", { lineHeight: "13px", letterSpacing: "0.11px" }],
        mono: ["11px", { lineHeight: "14px", letterSpacing: "0.44px" }],
        "mono-caps": ["10px", { lineHeight: "13px", letterSpacing: "0.6px" }],
      },
      borderRadius: {
        card: "18px",
        "card-lg": "24px",
        hero: "30px",
        button: "14px",
        pill: "999px",
        cell: "12px",
      },
    },
  },
  plugins: [],
};
