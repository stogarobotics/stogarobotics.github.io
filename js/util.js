/**
 * @file Solely used to define a collection of utility methods to facilitate codewriting in any other file. This script should have 0 imports.
 */

export const qs = (selector, context=document) => context.querySelector(selector);
export const qsa = (selector, context=document) => context.querySelectorAll(selector);

/**
 * Creates an element and specifies various properties regarding it in a single function call.
 * @param {string|function} tagNameOrConstructor The tag name of the new element or the constructor that creates it.
 * @param {object} [options] Properties pertaining to the object.
 */
export function createElement(tagNameOrConstructor="div", {
    context=document,
    namespace="",
    textContent="",
    classes=[],
    properties={},
    attributes=[],
    children=[],
    parent=null,
    callback=null,
}={}) {
    let element;

    if (typeof tagNameOrConstructor === "string") { // tag name
        const tagName = tagNameOrConstructor;
        element = !namespace ? context.createElement(tagName) : context.createElementNS(namespace, tagName);

    } else if (typeof tagNameOrConstructor === "function") { // constructor
        element = new tagNameOrConstructor();
    }

    element.textContent = textContent;

    for (const className of classes) {
        element.classList.add(className);
    }

    Object.assign(element, properties);

    for (const [key, value, namespace] of attributes) {
        if (!namespace) {
            element.setAttribute(key, value);
        } else {
            element.setAttributeNS(namespace, key, value);
        }
    }

    for (const child of children) {
        element.appendChild(child);
    }

    if (parent) {
        parent.appendChild(element);
    }

    if (callback) {
        callback.call(this);
    }

    return element;
}

/**
 * Removes all the children of an element.
 */
export function declade(element) {
    element.innerHTML = "";
    return element;
}

export function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
    return element;
}

/**
 * Calculates the location of a mouse event relative to an element.
 */
export function relcoords(mouseEvent, target, method=0) {
    if (!target) target = mouseEvent.currentTarget;

    if (!(target instanceof HTMLElement)) throw new TypeError(`Expected HTMLElement; got ${target.constructor.name}`);

    let x;
    let y;

    let left;
    let top;

    switch (method) {
        // Method 0: Use `getClientBoundingRect`: accurate with relative positioning, but not when CSS transformations are applied.
        default:
        case 0: {
            const rect = target.getBoundingClientRect();

            left = rect.left;
            top = rect.top;
            break;
        }

        // Method 1: Use offset properties: accurate when CSS transformations are applied, but zeroed with relative positioning.
        case 1:
            left = target.offsetLeft;
            top = target.offsetTop;
            break;
    }

    x = mouseEvent.x - left;
    y = mouseEvent.y - top;

    return {x, y};
}

export function xhrGet(url) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            resolve(req.responseText);
        });

        req.addEventListener("error", reject);

        req.open("GET", url);
        req.send();
    });
}

/**
 * Creates a one-time pause in an async block when awaited.
 * Only use when delaying once; use `requestAnimationFrame` when delaying multiple times quickly and timing matters.
 */
export function wait(ms=0) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

export function arrult(array) {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 1];
}
export function arrpenult(array) {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 2];
}

export const mod = (dividend, divisor) => (dividend % divisor + divisor) % divisor;

export function randfloat(min=0, max=1) {
    return Math.random() * (max - min) + min;
}
export function randint(min=0, max=1) {
    return Math.floor(randfloat(min, max + 1));
}

export class StoppablePromise extends Promise {
    constructor(callback) {
        let controls;

        super((resolve, reject) => {
            controls = {resolve, reject};

            callback(resolve, reject);
        });

        Object.assign(this, controls);
    }
}