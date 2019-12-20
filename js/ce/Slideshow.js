/**
 * @file Provides functionality for the `<slideshow->` element.
 */

import {qs, createElement, declade, mod} from "../util.js";
import {createNotice} from "../app-util.js";

/**
 * Represents an element that allows users to click through and view a number of images and their captions.
 * Noscript users will only see the first image and caption that is specified.
 */
export class Slideshow extends HTMLElement {
    // Essentially a constructor
    connectedCallback() {
        this.mediaContainer = qs("slideshow-media", this);

        this.img = qs("slideshow-media img", this);
        this.captionContainer = qs("slideshow-caption", this);

        this.imgLink = createElement("a", {
            properties: {
                target: "_blank",
            },

            children: [this.img],
            parent: this.mediaContainer,
        });

        // Get the other slideshow entries. The sources are specified on the <img> and captions on the <slideshow-caption>.
        const otherSrcList = this.mediaContainer.getAttribute("data-other-srcs");
        const otherCaptionList = this.captionContainer.getAttribute("data-other-captions");

        const otherSrcs = otherSrcList ? JSON.parse(otherSrcList) : [];
        const otherCaptions = otherCaptionList ? JSON.parse(otherCaptionList) : [];

        this.entries = [
            SlideshowEntry.fromSlideshowInit(this), 
            ...otherSrcs.map((src, i) => new SlideshowEntry(src, otherCaptions[i])),
        ].filter(({src}) => src); // Only keep entries that have an image src

        this.currentIndex = 0;

        // Create and add behavior to the arrows
        const arrowLeft = createElement("navigation-button", {
            classes: ["arrow-left", "disabled"],
            parent: this,
        });
        const arrowRight = createElement("navigation-button", {
            classes: ["arrow-right", "disabled"],
            parent: this,
        });

        arrowLeft.addEventListener("click", () => {
            this.moveEntries(-1);
        });

        arrowRight.addEventListener("click", () => {
            this.moveEntries(1);
        });

        if (this.entries.length > 1) {
            arrowLeft.classList.remove("disabled");
            arrowRight.classList.remove("disabled");
        }

        this.refresh();
    }

    moveEntries(n) {
        this.currentIndex = mod(this.currentIndex + n, this.entries.length);
        this.refresh();
    }

    currentEntry() {
        return this.entries[this.currentIndex];
    }
    
    refresh() {
        // Get the current entry
        const entry = this.currentEntry();

        // Remove image if there are no items
        if (!entry && this.entries.length === 0) {
            declade(this.mediaContainer);
            this.setCaptionNotice("no images found");
            return;
        }

        // loading
        this.setSrc();

        // Load the image
        this.setSrc(entry.src).setCaption(entry.caption);

        return this;
    }

    setSrc(src) {
        this.img.src = src || "";
        this.imgLink.href = src || "";
        return this;
    }

    setCaption(caption) {
        if (!caption) {
            this.setCaptionNotice("no caption");
        } else {
            this.captionContainer.textContent = caption;
            this.img.alt = caption;
        }

        return this;
    }
    
    setCaptionNotice(text) {
        declade(this.captionContainer).appendChild(createNotice(text));
        this.img.alt = text;
        return this;
    }
}

class SlideshowEntry {
    constructor(src, caption) {
        this.src = src;
        this.caption = caption;
    }

    static fromSlideshowInit(slideshow) {
        return new SlideshowEntry(slideshow.img.src, slideshow.captionContainer.textContent);
    }
}