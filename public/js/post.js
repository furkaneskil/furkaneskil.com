// Adds a "copy" control to every code block header.
document.querySelectorAll(".code").forEach((block) => {
  const head = block.querySelector(".code-h");
  const code = block.querySelector("pre code");
  if (!head || !code || !navigator.clipboard) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy";
  btn.textContent = "copy";
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.innerText.replace(/\n+$/, ""));
      btn.textContent = "copied";
    } catch {
      btn.textContent = "failed";
    }
    setTimeout(() => (btn.textContent = "copy"), 1400);
  });
  head.appendChild(btn);
});
