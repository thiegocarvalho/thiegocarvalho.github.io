import { execSync } from "node:child_process";

// Build once per run. CI builds before testing and sets SKIP_TEST_BUILD=1.
export default function setup() {
  if (process.env.SKIP_TEST_BUILD === "1") return;
  execSync("pnpm build", { stdio: "inherit" });
}
