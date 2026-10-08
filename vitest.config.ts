import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.ts"],
  },
});
