/**
 * @file Defines all custom elements.
 */

import {qsa} from "./util.js";
import {Slideshow} from "./ce/Slideshow.js";
import {LoadingSign} from "./ce/LoadingSign.js";
import {StatList} from "./ce/StatList.js";

// Edge does not have custom element support; use a fallback that maintains functionality
// Fairly hacky. Be warned, code-reader.
if (!window.customElements) {
    console.warn("Using custom element fallback");

    window.customElements = {
        define(tagName, fn) {
            // Iterate through each element with the given tag name
            for (const element of qsa(tagName)) {
                // Copy class methods over
                Object.setPrototypeOf(element, fn.prototype);

                // Call `connectedCallback` if present
                if (typeof fn.prototype.connectedCallback === "function") {
                    fn.prototype.connectedCallback.call(element);
                }
            }
        },
    };
}

// Semantic elements
for (const tagName of [
    "central-content",          // Contains all content behind the nav and above the footer (Recommended only as a direct child of [main])
    "header-media",             // Holds the background for the header; allows filters to be applied without affecting other header content
    "header-titlecard",         // Contains the logo, title and subtitle for the header
    "header-logo",              // Contains the logo image for the header
    "header-subtitle",          // Contains the subtitle text for the header
    "header-slogan",            // Contains the call-to-action text for the header
    "content-chunks",           // Contains all the content chunks on the central page
    "floating-anchor",          // Offsets a page anchor jump (as to not be covered by the compact <nav>)
    "chunk-decal",              // Displays a subtle background image for a content chunk
    "chunk-text",               // Holds the main portion of content in a content chunk
    "chunk-other",              // Holds the secondary portion of content in a content chunk
    "filter-rows",              // Contains buttons that control a gallery filter
    "gallery-grid",             // Organizes the images in a gallery
    "gallery-item",             // Contains one image in a gallery
    "slideshow-media",          // Contains one image in a slideshow
    "slideshow-caption",        // Contains the caption for a slideshow image
    "slideshow-note",           // Contains the note below a slideshow image
    "paginator-",               // Contains page number controls
    "paginator-display",        // Contians the current and maximum page number of a paginator
    "paginator-counter",        // Displays the current page number of a paginator
    "paginator-number-max",     // Displays the maximum page number of a paginator
    "navigation-button",        // Serves as a button used to move along in a sequence, eg update a page number
    "instance-display",
    "instance-subcounter",
    "instance-list",
    "instance-details",
    "instance-name",
    "big-number",               // Emphasizes a single number, usually for a statistic
    "button-grid",              // Organizes buttons into a grid
    "block-grid",               
    "bar-list",                 // Contains multiple <bar-item>s
    "bar-item",                 // Contains a key-value bar with a header and short explanatory text
    "team-roster",              // Lists all the members of a team (Recommended only as a direct child of [primary-content > aside])
    "team-member",              // Contains information about one member of a team (Recommended only as a direct child of [team-roster])
    "team-member-image",        // Displays the image of a team member (Recommended only as a direct child of [team-member])
    "team-member-descriptor",   // Displays the name and role of a team member (Recommended only as a direct child of [team-member])
    "nav-content",              // Contains the links on the nav (Recommended only as a direct child of [main > nav])
    "nav-separator",            // Creates a thin line separator between items in the nav
    "contact-container",        // Contains the contact form and info
    "contact-info",             // Contains the contact info
    "copyright-info",           // Contains the copyright info
    "copyright-year",           // Contains the copyright year
    "prefer-nobr",              // Prioritizes the contained text last when a line break is to occur on some text
    "speaker-declaration",      // States the speaker of a quote
    "text-notice",              
    "note-",
]) {
    customElements.define(tagName, class extends HTMLElement {});
}

// Other
customElements.define("slideshow-", Slideshow);
customElements.define("loading-sign", LoadingSign);
customElements.define("stat-list", StatList); // Creates a grid to organize team statistics into horizontal bars