import { readFileSync } from "node:fs";
import { join } from "node:path";
import Landing from "../components/Landing";

// Static, author-controlled markup ported from the original index.html.
const html = readFileSync(join(process.cwd(), "content", "landing.html"), "utf8");

export default function Home() {
  return <Landing html={html} />;
}
