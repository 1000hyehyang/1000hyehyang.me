import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import nextEnv from "@next/env";
import ts from "typescript";
import { verifyCvPassword } from "../../lib/cv-auth.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const origin = "http://localhost:3000";
const password = process.env.CV_PASSWORD;

test("sixth digit submits once, failed attempts reset, and a correct retry opens CV", async () => {
  const require = createRequire(import.meta.url);
  const states = [];
  let cursor = 0;
  const attempts = [];
  let finishAttempt;
  let submission;
  const exports = {};
  const source = await readFile("src/app/cv/CvAccess.tsx", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  });
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      if (name === "react") return {
        useEffect: () => {},
        useState: (initial) => {
          const index = cursor++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (value) => { states[index] = value; }];
        },
        useRef: (initial) => {
          const index = cursor++;
          if (!(index in states)) states[index] = { current: initial };
          return states[index];
        },
      };
      if (name === "./actions") return { unlockCv: (value) => {
        attempts.push(value);
        return new Promise((resolve) => { finishAttempt = resolve; });
      } };
      if (name === "./cv.module.css") return { default: {} };
      if (name === "./PrintButton") return { PrintButton: () => null };
      if (name === "@/components/markdown/MarkdownContent") return { MarkdownContent: () => null };
      if (name === "react/jsx-runtime") return require(name);
      return {};
    },
  });
  const elements = (node) => [node, ...[].concat(node?.props?.children ?? []).flatMap(elements)];
  const render = () => { cursor = 0; return elements(exports.CvAccess()); };
  const input = () => render().find((node) => node?.type === "input");
  const dots = () => render().filter((node) => node?.type === "span");
  const change = (value) => {
    const target = { value, form: { requestSubmit: () => {
      const data = new FormData();
      data.set("password", target.value);
      submission = render().find((node) => node?.type === "form").props.action(data);
    } } };
    input().props.onChange({ currentTarget: target });
  };
  assert.equal(input().props.autoFocus, true);
  assert.equal(dots().length, 6);
  for (const [typed, expected] of [["1", "1"], ["123", "123"], ["12", "12"], ["12a34", "1234"], ["", ""], ["12345", "12345"]]) {
    change(typed);
    assert.equal(input().props.value, expected);
    assert.deepEqual(dots().map((dot) => dot.props["data-filled"]), Array.from({ length: 6 }, (_, i) => i < expected.length));
  }
  assert.equal(attempts.length, 0);
  change("123456");
  assert.deepEqual(attempts, ["123456"]);
  assert.equal(input().props.readOnly, true);
  assert.ok(dots().every((dot) => dot.props["data-filled"]));
  await render().find((node) => node?.type === "form").props.action(new FormData());
  assert.equal(attempts.length, 1, "Enter or another submit must not duplicate the pending request");
  finishAttempt(null);
  await submission;
  assert.equal(input().props.value, "");
  assert.equal(input().props.readOnly, false);
  assert.ok(dots().every((dot) => !dot.props["data-filled"]));
  assert.ok(render().some((node) => node?.props?.role === "alert"));
  change("6543217");
  assert.deepEqual(attempts, ["123456", "654321"]);
  finishAttempt({ profileHtml: "profile", bodyHtml: "body", photo: "photo" });
  await submission;
  assert.ok(render().some((node) => node?.type === "article"));
  assert.equal(input(), undefined);
});

test("password validation fails closed", () => {
  try {
    delete process.env.CV_PASSWORD;
    assert.equal(verifyCvPassword("anything"), false);
    process.env.CV_PASSWORD = "short";
    assert.equal(verifyCvPassword("short"), false);
    process.env.CV_PASSWORD = "654321";
    assert.equal(verifyCvPassword("incorrect"), false);
    assert.equal(verifyCvPassword("123456"), false);
    assert.equal(verifyCvPassword("65432"), false);
    assert.equal(verifyCvPassword("6543210"), false);
    assert.equal(verifyCvPassword("65432a"), false);
    assert.equal(verifyCvPassword(process.env.CV_PASSWORD), true);
    process.env.CV_PASSWORD = "abcdef";
    assert.equal(verifyCvPassword("abcdef"), false);
  } finally {
    if (password === undefined) delete process.env.CV_PASSWORD;
    else process.env.CV_PASSWORD = password;
  }
});

// Run npm run dev, then npm run test:cv. Never print credentials or action responses.
test("every CV visit requires a password, including visits with an old valid session", async () => {
  assert.ok(password && /^[0-9]{6}$/.test(password), "Set a six-digit CV_PASSWORD in .env.local.");
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const signature = createHmac("sha256", password).update(`cv-session:${expires}`).digest("hex");
  const legacyCookie = `cv-session=${expires}.${signature}`;

  async function assertLocked() {
    for (const url of ["/cv", "/cv?_rsc=private-check"]) {
      for (const headers of [{}, { Cookie: legacyCookie }, { RSC: "1", Cookie: legacyCookie, "x-middleware-subrequest": "middleware:middleware:middleware:middleware:middleware" }]) {
        const response = await fetch(origin + url, { headers });
        assert.equal(response.status, 200);
        assert.match(response.headers.get("cache-control"), /no-store/);
        assert.equal(response.headers.get("www-authenticate"), null);
        const content = await response.text();
        assert.ok(!/YEO CHAE HYEON|ducogus12|data:image\/jpeg;base64/.test(content), "GET must never return CV content");
      }
    }
  }

  await assertLocked();
  const loginHtml = await (await fetch(origin + "/cv")).text();
  assert.match(loginHtml, /type="password"/);
  assert.match(loginHtml, /inputMode="numeric"/);
  assert.match(loginHtml, /minLength="6"/);
  assert.match(loginHtml, /maxLength="6"/);
  const manifest = JSON.parse(await readFile(".next/server/server-reference-manifest.json", "utf8"));
  const actionId = Object.entries(manifest.node).find(([, action]) => action.exportedName === "unlockCv")?.[0];
  assert.ok(actionId, "CV password server action is compiled");
  const submit = (value, requestOrigin = origin) => fetch(origin + "/cv", {
    method: "POST",
    headers: { Origin: requestOrigin, "Next-Action": actionId, "Content-Type": "application/json", Cookie: legacyCookie },
    body: JSON.stringify([value]),
    redirect: "manual",
  });

  for (const value of ["incorrect", null, { password }, ""]) {
    const response = await submit(value);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("set-cookie"), null);
    const content = await response.text();
    assert.ok(!content.includes("YEO CHAE HYEON"), "Even an old valid cookie cannot bypass password validation");
  }
  const crossOrigin = await submit(password, "https://untrusted.example");
  assert.ok(crossOrigin.status >= 400);
  assert.equal(crossOrigin.headers.get("set-cookie"), null);

  const response = await submit(password);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const content = await response.text();
  assert.ok(content.includes("YEO CHAE HYEON"), "A correct password returns the CV");
  assert.ok(content.includes("data:image/jpeg;base64,"), "Portrait is embedded in the same authenticated response");
  const photo = await readFile("private/cv/photo.jpg");
  assert.ok(content.includes(photo.toString("base64")), "Embedded portrait matches the private file");
  const projects = [...content.matchAll(/\/portfolio\/project\/([^"/]+)"/g)].map((match) => match[1]);
  assert.deepEqual(projects, ["udidura", "real-match"]);
  await assertLocked();

  for (const url of ["/cv/photo", "/cv.md", "/cv-photo.jpg", "/private/cv/resume.md", "/private/cv/photo.jpg"]) {
    assert.equal((await fetch(origin + url, { headers: { Cookie: legacyCookie } })).status, 404, url);
  }
});
