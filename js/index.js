/**
 * @file Script that runs on all pages.
 */

import "./ce.js";
import {qs, qsa} from "./util.js";

// Edge fallback
if (!Array.prototype.flat) {
    Array.prototype.flat = function () {
        return this.reduce((accumulator, item) => accumulator.concat(item), []);
    };
}

for (const element of qsa(".js-required")) {
    element.classList.remove("js-required");
}


// let headerRect;
// const headerMedia = qs("header-media");

// setHeaderRect();
// addEventListener("scroll", () => {
//     if (scrollY > headerRect.bottom) return;

//     headerMedia.style.transform = `translateY(${scrollY / 2}px)`;
// });
// addEventListener("resize", () => {
//     setHeaderRect();
// });

// function setHeaderRect() {
//     headerRect = qs("header").getBoundingClientRect();
// }

qs("footer copyright-year").textContent = new Date().getUTCFullYear();
