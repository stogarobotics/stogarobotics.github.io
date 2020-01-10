/**
 * @file Provides functionality for the `<stat-list>` element.
 */

import {qsa} from "../util.js";

export class StatList extends HTMLElement {
    connectedCallback() {
        this.numbers = qsa("big-number", this);
        this.labels = qsa("h4", this);
    }

    setNumberAsLoading(i) {
        this.numbers[i].textContent = "…";
    }

    setNumber(i, value) {
        const number = this.numbers[i];
        const label = this.labels[i];

        number.textContent = value.toLocaleString();

        const singularTextLabel = label.getAttribute("data-singular");
        if (singularTextLabel && value === 1) {
            (label.firstElementChild || label).textContent = singularTextLabel;
        }
    }
}