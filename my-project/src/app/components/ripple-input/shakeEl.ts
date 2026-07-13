export function shakeEl(el: HTMLElement) {
  el.classList.add("is-shaking");
  el.addEventListener("animationend", () => el.classList.remove("is-shaking"), {
    once: true,
  });
}
