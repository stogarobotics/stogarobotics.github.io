/**
 * @file Solely used to define a collection of utility methods to facilitate codewriting in any other file. util.js should have 0 dependencies.
 */

export const qs = (selector, context=document) => context.querySelector(selector);
export const qsa = (selector, context=document) => context.querySelectorAll(selector);

/**
 * Creates an element and specifies numerous properties regarding it.
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
}={}) {
    let element;

    if (typeof tagNameOrConstructor === "string") { // tag name
        const tagName = tagNameOrConstructor;
        element = !namespace ? context.createElement(tagName) : context.createElementNS(namespace, tagName);

    } else if (typeof tagNameOrConstructor === "function") { // constructor
        const fn = tagNameOrConstructor;
        element = new fn();
    }

    element.textContent = textContent;

    for (let className of classes) {
        element.classList.add(className);
    }

    for (let [key, value] of Object.entries(properties)) {
        element[key] = value;
    }

    for (let [key, value, namespace] of attributes) {
        if (!namespace) {
            element.setAttribute(key, value);
        } else {
            element.setAttributeNS(namespace, key, value);
        }
    }

    for (let child of children) {
        element.appendChild(child);
    }

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}

// Removes all the children of an element
export function declade(element) {
    while (element.lastElementChild) {
        element.lastElementChild.remove();
    }
    return element;
}

export function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
    return element;
}

// Calculates the location of a click relative to an element
export const relcoords = (mouseEvent, target, method=0) => {
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
            let rect = target.getBoundingClientRect();

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

// Creates a one-time pause in an async block when awaited
// Only use when delaying once; use `requestAnimationFrame` when delaying multiple times quickly and timing matters
export const wait = (ms=0) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

export const arrult = array => {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 1];
};
export const arrpenult = array => {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 2];
};

export const mod = (dividend, divisor) => (dividend % divisor + divisor) % divisor;

export const randfloat = (min=0, max=1) => {
    return Math.random() * (max - min) + min;
};
export const randint = (min=0, max=1) => {
    return Math.floor(randfloat(min, max + 1));
};