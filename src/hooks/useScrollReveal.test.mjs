import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  await readFile(new URL("./useScrollReveal.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
);

function mount(reducedMotion = false) {
  const observers = [];
  let cleanup;
  let focus;
  let motionChange;
  const media = {
    matches: reducedMotion,
    addEventListener: (_, handler) => { motionChange = handler; },
    removeEventListener: () => { motionChange = undefined; },
  };
  class Target {
    style = {
      opacity: "",
      priority: "",
      getPropertyPriority() { return this.priority; },
      setProperty(_, value, priority) { this.opacity = value; this.priority = priority; },
    };
    animations = [];
    closest() { return this; }
    animate(frames, options) {
      const animation = { frames, options, cancelled: 0, cancel() { this.cancelled++; } };
      this.animations.push(animation);
      return animation;
    }
  }
  const targets = Array.from({ length: 7 }, () => new Target());
  targets[5].style.opacity = "0.4";
  targets[5].style.priority = "important";
  const scope = {
    querySelectorAll: () => targets,
    contains: target => targets.includes(target),
    addEventListener: (_, handler) => { focus = handler; },
    removeEventListener: () => { focus = undefined; },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    Element: Target,
    window: { matchMedia: () => media },
    IntersectionObserver: class {
      observed = new Set();
      constructor(callback) { this.notify = callback; observers.push(this); }
      observe(target) { this.observed.add(target); }
      unobserve(target) { this.observed.delete(target); }
      disconnect() { this.observed.clear(); }
    },
    require: () => ({ useLayoutEffect: effect => { cleanup = effect(); } }),
  });
  exports.useScrollReveal({ current: scope });
  return {
    targets, observer: observers[0], cleanup,
    focus: target => focus({ target }),
    hasFocusListener: () => !!focus,
    reduceMotion: () => { media.matches = true; motionChange(); },
  };
}

test("reveals only intersecting items once, caps stagger, and releases finished animations", () => {
  const { targets, observer, cleanup, focus, hasFocusListener } = mount();
  assert.ok(targets.every(target => target.style.opacity === "0"));
  observer.notify(targets.map((target, index) => ({ target, isIntersecting: index < 5 })));
  assert.deepEqual(targets.slice(0, 5).map(target => target.animations[0].options.delay), [0, 70, 140, 210, 280]);
  assert.equal(targets[0].animations[0].frames[0].transform, "translateY(-12px)");
  assert.equal(targets[0].animations[0].options.duration, 720);
  assert.equal(targets[0].animations[0].options.fill, "backwards");
  assert.equal(targets[5].animations.length, 0);
  targets[0].animations[0].onfinish();
  observer.notify([{ target: targets[0], isIntersecting: true }]);
  assert.equal(targets[0].animations.length, 1);
  focus(targets[6]);
  assert.equal(targets[6].style.opacity, "");
  assert.equal(targets[6].animations.length, 0);
  focus(targets[1]);
  assert.equal(targets[1].animations[0].cancelled, 1);
  targets[5].style.transform = "scale(0.9)";
  cleanup();
  assert.equal(targets[0].animations[0].cancelled, 1);
  assert.equal(targets[2].animations[0].cancelled, 1);
  assert.equal(targets[5].style.opacity, "0.4");
  assert.equal(targets[5].style.priority, "important");
  assert.equal(targets[5].style.transform, "scale(0.9)");
  assert.equal(observer.observed.size, 0);
  assert.equal(hasFocusListener(), false);
});

test("changing motion preference cancels active effects and reveals pending content", () => {
  const { targets, observer, cleanup, reduceMotion } = mount();
  observer.notify(targets.slice(0, 6).map(target => ({ target, isIntersecting: true })));
  assert.deepEqual(targets.slice(0, 6).map(target => target.animations[0].options.delay), [0, 70, 140, 210, 280, 280]);
  reduceMotion();
  assert.equal(targets[0].animations[0].cancelled, 1);
  assert.equal(targets[6].style.opacity, "");
  assert.equal(observer.observed.size, 0);
  cleanup();
  assert.equal(targets[0].animations[0].cancelled, 1);
});

test("reduced motion leaves content visible without observers or animations", () => {
  const { targets, observer, cleanup } = mount(true);
  assert.equal(observer, undefined);
  assert.equal(cleanup, undefined);
  assert.equal(targets[0].style.opacity, "");
  assert.equal(targets[5].style.opacity, "0.4");
});
