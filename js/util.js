/**
 * @file Solely used to define a collection of utility methods to facilitate codewriting in any other file. This script should have 0 imports.
 */

export const qs = (selector, context=document) => context.querySelector(selector);
export const qsa = (selector, context=document) => context.querySelectorAll(selector);
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZjEwYzA1NTZjYTQ4MjA2MzhkM2VjY2M0YzI1Njk3NDEyNWM2Y2ExNjE5YTE3NzVkZDM1NzgxNGJlY2U2Y2VkYmIxNzZmZjFkMjE1YTE0YzEiLCJpYXQiOjE2ODU3NTM1NjcuMzU5OTA0MSwibmJmIjoxNjg1NzUzNTY3LjM1OTkwODEsImV4cCI6MjYzMjUyODM2Ny4zNTEyMjQ5LCJzdWIiOiIxMTY1MCIsInNjb3BlcyI6W119.om1aGeoPI4FbOScVQfqcxxMpZRkwQVyY9Lf5WAIzGWNGejjboIzqXiQ-Y456QaXo_qTM3bcmhrUMLWyFnjPfxM92t7DRh0rY-tOf_CIK6F1-MbZxjFNL8mBLG3rPBqin1Djt1pL3B7b3CKSAA8vSLk2Gt35RZyr9lv-w6-oQL_etWz-zKrHvzKcv2mPe6ODUTolvwnyAi-qO0BXgoeLIM-jdKpSnOuGPWDFbvXkCppS0CSGK9Dz3z8RVXwp4OUoJUbxwFXb76gY7_j-5qKccEwi2kHZ96mN_hWulZoogN-HRg34qUH79eLWaAUoqjc6UYrjAr2__Q0UvHmuNus6b2ixgY-dCdcgZa_74QGYbwHKH1nXhzo6lSW1Pqc8rkuZJXGRPFVxYK6-kkUS13TD6SXHsRgTnYgJ5oi9lWlmAgGggVG4-0twTSMoGEkby96Q3X7TFiW7hSxcoghofVq5Lz1L7OZGZLjAnace-fpJpNdtCUbjZX50IHOPZAEpuUpdlHxibhidnwYLpqI0UWTicqWtVxOVLjX2XNm5xp2XJ3OnQSUCDTdFx4S5WVc3JlMSCCyNZ1Q61jlzf54XrHGKcCjO2TG-lSr3KNCMqZlS-o6sjFbFo0WwZNDRPnftD6M_0dRwAj6jxVgRb-BuFGw4KBXUjj6E4777FHzDcEmkRq6o"
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
    listeners={},
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

    for (const [eventType, handlers] of Object.entries(listeners)) {
        for (const [handler, options] of handlers) {
            element.addEventListener(eventType, handler, options);
        }
    }

    if (callback) {
        callback.call(element);
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

export async function getData(url = "") {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        'Authorization': `Bearer ${token}`
        
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      
    });
    return response.json(); // parses JSON response into native JavaScript objects
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