/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. Colors - Royal Blue & Gold Theme
      colors: {
        royal: {
          blue: {
            DEFAULT: "#0B3D91",
            light: "#1E63C8",
          },
          gold: {
            DEFAULT: "#D4AF37",
            dark: "#B1892A",
          },
        },
        neutral: {
          black: "#061026",
          slate: "#9AA7C7",
          grey: "#E6EBF8",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.65)",
          blue: "rgba(30, 99, 200, 0.1)",
        },
        validation: {
          error: "#E85D5D",
          success: "#2ECC71",
        },
      },
      // 2. Fonts
      fontFamily: {
        display: ['"Playfair Display"', "serif"], // For headings
        sans: ["Inter", "sans-serif"], // For everything else
        decorative: ['"Cinzel Decorative"', "serif"], // For testimonial quotes
        spectral: ['"Spectral SC"', "serif"], // For testimonial names/roles
      },
      // 3. Typography Scale
      fontSize: {
        h1: ["56px", "64px"],
        h2: ["40px", "48px"],
        h3: ["28px", "36px"],
        h4: ["20px", "28px"],
        body: ["16px", "24px"],
        small: ["14px", "20px"],
      },
      // 4. Border Radius
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        xl: "28px",
      },
      // 5. Box Shadow - Glassmorphic Shadows
      boxShadow: {
        1: "0 4px 12px 0 rgba(3, 10, 24, 0.12)",
        2: "0 10px 30px 0 rgba(3, 10, 24, 0.22)",
        3: "0 20px 60px 0 rgba(11, 61, 145, 0.06)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        glow: "0 0 20px 0 rgba(212, 175, 55, 0.3)",
      },
      // 6. Backdrop Blur (for glass effects)
      backdropBlur: {
        xs: "2px",
        sm: "12px",
        md: "24px",
        lg: "40px",
        xl: "100px",
      },
      // 7. Spacing tokens (extending default 8px grid)
      spacing: {
        18: "4.5rem", // 72px
        22: "5.5rem", // 88px
        26: "6.5rem", // 104px
        30: "7.5rem", // 120px
        34: "8.5rem", // 136px
        38: "9.5rem", // 152px
        42: "10.5rem", // 168px
        46: "11.5rem", // 184px
        50: "12.5rem", // 200px
        128: "32rem", // 512px
        144: "36rem", // 576px
        160: "40rem", // 640px
      },
      // 8. Animation & Transitions
      transitionDuration: {
        180: "180ms",
        320: "320ms",
        420: "420ms",
        560: "560ms",
      },
      // 9. Container max widths
      maxWidth: {
        "8xl": "1400px",
      },
      // 10. Background gradients
      backgroundImage: {
        "royal-gradient": "linear-gradient(135deg, #0B3D91 0%, #1E63C8 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
    },
  },
  plugins: [],
};
