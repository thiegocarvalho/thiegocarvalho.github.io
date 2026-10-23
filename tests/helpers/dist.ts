import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DIST = "dist";

function walk(dir: string, base = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(join(dir, e.name), rel) : [rel];
  });
}

// Minimal glob: `**/` = any depth (incl. none), `*` = within a segment, `?` = one char.
function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        re += "(?:.*/)?";
        i += 2;
      } else {
        re += ".*";
        i += 1;
      }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

/** Built file contents, relative to dist/. Throws if absent. */
export function readDist(relPath: string): string {
  const full = join(DIST, relPath);
  if (!existsSync(full)) throw new Error(`dist/${relPath} does not exist; was the site built?`);
  return readFileSync(full, "utf8");
}

/** Built paths (relative to dist/, posix separators) matching a glob. */
export function distFiles(glob: string): string[] {
  if (!existsSync(DIST)) throw new Error(`${DIST}/ does not exist; was the site built?`);
  const re = globToRegExp(glob);
  return walk(DIST).filter((p) => re.test(p)).sort();
}

/** Every built HTML page. */
export function allHtml(): { path: string; html: string }[] {
  return distFiles("**/*.html").map((path) => ({ path, html: readDist(path) }));
}

/**
 * Every stylesheet rule in the build: all emitted dist/**\/*.css plus the text of
 * every inline <style> tag. Throws when empty, because with
 * inlineStylesheets: "auto" an empty corpus would make any not.toMatch pass blindly.
 */
export function allStyles(): string {
  const emitted = distFiles("**/*.css").map(readDist);
  const inline = allHtml().flatMap(({ html }) =>
    [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]),
  );
  const css = [...emitted, ...inline].join("\n");
  if (css.trim() === "") {
    throw new Error(
      "allStyles(): no CSS found in dist/ (no .css files and no inline <style> tags). " +
        "Refusing to return an empty corpus: assertions over it would pass blindly.",
    );
  }
  return css;
}
