// Only used when running without Turbopack (e.g. `next dev --webpack` inside
// Docker, see Dockerfile.dev). Turbopack uses the dedicated
// `@tailwindcss/turbopack` loader configured in next.config.ts instead.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
