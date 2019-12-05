import {qsa} from "./util.js";
import {Slideshow} from "./ce/Slideshow.js";

(() => {
    // Edge does not have custom element support; use a fallback that maintains functionality
    // Fairly hacky. Be warned, code-reader.
    if (!window.customElements) {
        console.warn("Using custom element fallback");

        window.customElements = {
            define(tagName, fn) {
                // Iterate through each element with the given tag name
                for (let element of qsa(tagName)) {
                    // Copy class methods over
                    element.__proto__ = fn.prototype;

                    // Call `connectedCallback` if present
                    if (typeof fn.prototype.connectedCallback === "function") {
                        fn.prototype.connectedCallback.call(element);
                    }
                }
            },
        };
    }

    // Semantic elements
    for (let tagName of [
        "central-content",          // Contains all content behind the nav and above the footer (Recommended only as a direct child of [main])
        "header-media",             // Holds the background for the header; allows filters to be applied without affecting other header content
        "header-titlecard",         // Contains the logo, title and subtitle for the header
        "header-logo",              // Contains the logo image for the header
        "header-subtitle",          // Contains the subtitle text for the header
        "header-slogan",            // Contains the call-to-action text for the header
        "content-chunks",           // Contains all the content chunks on the central page
        "chunk-decal",              // 
        "chunk-text",               // Holds the main portion of content in a content chunk
        "chunk-other",              // Holds the secondary portion of content in a content chunk
        "gallery-filter-rows",      // 
        "gallery-grid",             // 
        "gallery-item",             // 
        "slideshow-media",          //
        "slideshow-caption",        //
        "slideshow-note",           //
        "paginator-",
        "paginator-display",
        "paginator-counter",
        "paginator-number-max",
        "navigation-button",
        "button-grid",              // 
        "bar-list",                 // 
        "bar-item",                 // Contains a key-value bar with a header and short explanatory text
        "team-roster",              // Lists all the members of a team (Recommended only as a direct child of [primary-content > aside])
        "team-member",              // Contains information about one member of a team (Recommended only as a direct child of [team-roster])
        "team-member-image",        // Displays the image of a team member (Recommended only as a direct child of [team-member])
        "team-member-descriptor",   // Displays the name and role of a team member (Recommended only as a direct child of [team-member])
        "nav-content",              // Contains the links on the nav (Recommended only as a direct child of [main > nav])
        "contact-container",        // Contains the contact form and info
        "contact-info",             // Contains the contact info
        "copyright-info",           // 
        "prefer-nobr",              // Prioritizes the contained text last when a line break is to occur on some text
        "speaker-declaration",      // States the speaker of a quote
    ]) {
        customElements.define(tagName, class extends HTMLElement {});
    }

    // Slideshows
    customElements.define("slideshow-", Slideshow);
})();