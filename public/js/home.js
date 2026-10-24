const root = document.documentElement;
root.classList.add("js");

const links = [...document.querySelectorAll(".menu a")];
const ids = links.map((a) => a.hash.slice(1));
const panels = new Map(ids.map((id) => [id, document.getElementById(id)]));
const stage = document.querySelector(".stage");

// The command line of each panel is typed out the first time the panel opens.
// Screen readers read a hidden full copy instead of the animation.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const commands = new Map();
panels.forEach((panel, id) => {
  const cmd = panel.querySelector(".cmd");
  const node = cmd?.lastChild;
  if (!node) return;
  const text = node.textContent;

  const label = document.createElement("span");
  label.className = "sr-only";
  label.textContent = text;
  const typed = document.createElement("span");
  typed.setAttribute("aria-hidden", "true");
  typed.textContent = text;
  node.replaceWith(label, typed);
  commands.set(id, { typed, text, done: false, timer: 0 });
});

let typing = null;

function finishTyping() {
  if (!typing) return;
  clearTimeout(typing.timer);
  typing.typed.textContent = typing.text;
  typing.typed.classList.remove("typing");
  typing.done = true;
  typing = null;
}

function typeCommand(id) {
  finishTyping();
  const cmd = commands.get(id);
  if (!cmd || cmd.done) return;
  if (reduceMotion) { cmd.done = true; return; }

  typing = cmd;
  cmd.typed.textContent = "";
  cmd.typed.classList.add("typing");
  let shown = 0;
  const step = () => {
    cmd.typed.textContent = cmd.text.slice(0, ++shown);
    if (shown >= cmd.text.length) return finishTyping();
    cmd.timer = setTimeout(step, 30 + Math.random() * 40);
  };
  cmd.timer = setTimeout(step, 200);
}

function show() {
  const id = panels.has(location.hash.slice(1)) ? location.hash.slice(1) : ids[0];
  typeCommand(id);
  panels.forEach((el, key) => el.classList.toggle("on", key === id));
  links.forEach((a) => {
    if (a.hash.slice(1) === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  stage.scrollTop = 0;
  scrollTo(0, 0); // undo the browser's jump to the #fragment target
  document.title = id === ids[0] ? "furkan@eskil" : `${id} | furkan@eskil`;
}

function go(id) {
  if (location.hash.slice(1) !== id) location.hash = id;
}

addEventListener("hashchange", show);
addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const cur = Math.max(0, ids.indexOf(location.hash.slice(1)));
  const n = Number(e.key);
  if (n >= 1 && n <= ids.length) go(ids[n - 1]);
  else if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); go(ids[Math.min(cur + 1, ids.length - 1)]); }
  else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); go(ids[Math.max(cur - 1, 0)]); }
});

show();
