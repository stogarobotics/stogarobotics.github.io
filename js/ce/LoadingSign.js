/**
 * @file Provides functionality for the `<loading-sign>` element.
 */

import {declade, createElement} from "../util.js";
import {createNotice, VexdbApiError} from "../app-util.js";

function instantiate(loadingSign, asyncCallback, oncallbackresolve=() => {}, oncallbackreject=() => {}, callbackRerun=() => {}) {
    loadingSign.resetElement();
    loadingSign.nFails = 0;

    loadingSign.asyncCallback = asyncCallback;
    loadingSign.oncallbackresolve = oncallbackresolve;
    loadingSign.oncallbackreject = oncallbackreject;
    loadingSign.callbackRerun = callbackRerun;
    return loadingSign;
}

/**
 * Ties a loading sign to a promise, automatically adding CSS classes or showing error messages on either fulfillment or rejection.
 */
export class LoadingSign extends HTMLElement {
    /**
     * Creates a new <loading-sign>.
     * @param {...*} args Settings of this <loading-sign>.
     * @param {function} asyncCallback Function that returns a promise that is called using `this.run`.
     * @param {function} [callbackRerun] Additional setup to be done when rerunning the callback through the Retry button.
     */
    constructor(...args) {
        super();

        instantiate(this, ...args);
    }

    /**
     * Determines whether this class is available through its constructor on the current browser.
     * @returns Whether this class is available through its constructor on the current browser.
     */
    static isSupported() {
        try {
            // The actual test that will throw if not supported (Edge)
            new this(() => Promise.resolve());

            // If passed, return true
            return true;
        } catch (error) {
            // If failed, return false
            return false;
        }
    }

    /**
     * Uses a fallback manner of instantiating this class if it is not supported (Edge).
     * @param {...*} args Arguments to be relegated to this class's constructor.
     * @param {function} asyncCallback Function that returns a promise that is called using `this.run`.
     * @param {function} [callbackRerun] Additional setup to be done when rerunning the callback through the Retry button.
     * @returns A new instance of this class or an element set to have this class's prototype.
     */
    static create(...args) {
        if (this.isSupported()) {
            return new this(...args);
        }

        // Creates a <loading-sign> with this class as its prototype
        const element = createElement("loading-sign");
        Object.setPrototypeOf(element, this.prototype);
        instantiate(element, ...args);

        return element;
    }

    /**
     * Runs `this.asyncCallback`, calling `this.resolved` once the promise is fulfilled or `this.rejected` if it fails.
     * @returns {Promise} The promise from `this.asyncCallback`.
     */
    run() {
        const promise = this.asyncCallback()
        
        promise.then(() => {
            this.resolved();
        }).catch(error => {
            this.rejected(error);
        });

        return promise;
    }

    /**
     * Replaces this element’s contents with a single loading sign and removes the `resolved` class if present.
     * @returns This object.
     */
    resetElement() {
        declade(this).classList.remove("resolved");
        this.appendChild(createNotice("loading"));

        return this;
    }

    /**
     * Adds the `resolved` class to this <loading-sign>.
     * @returns This object.
     */
    resolved() {
        this.classList.add("resolved");
        this.oncallbackresolve();
        return this;
    }

    /**
     * Shows an error message from this <loading-sign> and provides a Retry button to rerun it.
     * @param {Error} [error] If this error is a `VexdbApiError` with code `0`, an additional message will be shown that VexDB is currently unavailable.
     * @returns This object.
     */
    rejected(error) {
        // Increment number of fails
        this.nFails += 1;

        // Show an error message if failed
        declade(this).appendChild(createNotice(`loading failed ${this.failMessage()}`));

        // For VexDB error code 0 (internal server error), show an additional message
        if (error instanceof VexdbApiError && error.code === 0) {
            createElement("p", {
                textContent: "VexDB is currently unavailable. Try again later.",
                parent: this,
            });
        }
    
        // Add a retry button
        createElement("span", {
            textContent: "Retry",
            classes: ["button"],
            parent: this,
        }).addEventListener("click", () => {
            this.callbackRerun();
            this.resetElement();
            this.run();
        });

        this.oncallbackreject();

        return this;
    }
    
    /**
     * Gets the appropriate fail message appendage depending on this element’s fail count.
     * @returns The message appendage.
     */
    failMessage() {
        switch (this.nFails) {
            case 1:
                return "";
    
            case 2:
                return " again";
    
            default:
                return ` ${this.nFails} times`;
        }
    }
}