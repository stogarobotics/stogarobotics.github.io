/**
 * @file Script that runs on the gallery page. Controls querying and parsing of image info gathered from the API.
 */

import {qs, qsa, declade, createElement} from "./util.js";

const arrowLeftEnd = qs("paginator- navigation-button.arrow-left-end");
const arrowLeft = qs("paginator- navigation-button.arrow-left");
const arrowRight = qs("paginator- navigation-button.arrow-right");
const arrowRightEnd = qs("paginator- navigation-button.arrow-right-end");
const pageCounter = qs("paginator- paginator-counter");
const pageCounterInput = qs("paginator- paginator-counter input");
const pageCounterMax = qs("paginator- paginator-number-max");

const galleryGrid = declade(qs("gallery-grid"));

const nResultsPerPage = 8;
let nTotalMatchingEntries = 0;

let nPage = 0;
const nMaxPage = () => Math.floor(nTotalMatchingEntries / nResultsPerPage);

function query() {
    updateCurrentPageNumber();
    
    // Parses the filter settings
    const teamNumbers = [...qsa("input[name='team-filter']:checked")].map(input => input.value);

    const fetchOptions = {
        teams: teamNumbers,

        n_results: nResultsPerPage,
        n_offset: nResultsPerPage * nPage,
    };

    fetchAndDisplayImages(fetchOptions);

    // history.replaceState(null, "", `${location.origin}${location.pathname}?${new URLSearchParams(fetchOptions)}`);
}

// version used with backend on
/*function requestImages(options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            resolve(JSON.parse(req.responseText));
        });
        req.open("GET", `./api/images?${new URLSearchParams(options)}`);
        req.send();
    });
}*/
// version used on static page
const requestImages = (() => {
    let queryResult;

    return async options => {
        if (!queryResult) {
            queryResult = await new Promise(resolve => {
                const req = new XMLHttpRequest();
                req.addEventListener("load", () => {
                    resolve(JSON.parse(req.responseText));
                });
                req.open("GET", `./images.json`);
                req.send();
            });
        }

        const response = {
            success: true,
        };
        
        const matches = queryResult.result.filter(image => {
            return !options.teams[0] || options.teams.includes(image.team_number);
        });
        response.n_total_matching_entries = matches.length;
        response.result = matches.slice(options.n_offset, options.n_offset + options.n_results);

        return response;
    };
})();

async function fetchAndDisplayImages(options) {
    declade(galleryGrid);
    addNotice("loading");

    // Query the API
    const response = await requestImages(options);

    // Show an error message if querying failed
    if (!response.success) {
        addNotice("image fetching failed; try reloading");

        console.warn("Image fetching failed:", response.errorMessage);
        return;
    }

    nTotalMatchingEntries = response.n_total_matching_entries;
    updateCurrentPageNumber();
    updateMaxPageNumber();

    declade(galleryGrid);

    // Create gallery entries for each image
    if (response.result.length === 0) {
        addNotice("no images found");
        return;
    }

    for (const image of response.result) {
        createElement("gallery-item", {
            children: [
                createElement("a", {
                    properties: {
                        "href": `../img/gallery/${image.image_url}`,
                        "target": "_blank",
                    },

                    children: [  
                        createElement(Image, {
                            properties: {
                                "src": `./thumb/${image.image_url}`,
                                "alt": image.caption,
                            },
                        }),
                    ],
                }),
            ],

            parent: galleryGrid,
        });
    }
}

function addNotice(text) {
    createElement("gallery-item", {
        classes: ["notice"],
        children: [
            createElement("text-notice", {
                textContent: text,
            }),
        ],

        parent: galleryGrid,
    });
}

function updateCurrentPageNumber(n=nPage) {
    nPage = Math.min(nMaxPage(), Math.max(0, n)) || 0;
    pageCounterInput.value = nPage + 1;

    if (nPage === 0) {
        arrowLeft.classList.add("disabled");
        arrowLeftEnd.classList.add("disabled");
    } else {
        arrowLeft.classList.remove("disabled");
        arrowLeftEnd.classList.remove("disabled");
    }

    if (nPage === nMaxPage()) {
        arrowRight.classList.add("disabled");
        arrowRightEnd.classList.add("disabled");
    } else {
        arrowRight.classList.remove("disabled");
        arrowRightEnd.classList.remove("disabled");
    }
}

function updateMaxPageNumber() {
    pageCounterMax.textContent = nMaxPage() + 1;
}

qs("gallery-filter-rows").addEventListener("change", () => {
    updateCurrentPageNumber(0);
    query(); // Filter settings are handled in `query`
});

arrowLeftEnd.addEventListener("click", () => {
    updateCurrentPageNumber(0);
    query();
});
arrowLeft.addEventListener("click", () => {
    updateCurrentPageNumber(nPage - 1);
    query();
});
arrowRight.addEventListener("click", () => {
    updateCurrentPageNumber(nPage + 1);
    query();
});
arrowRightEnd.addEventListener("click", () => {
    updateCurrentPageNumber(nMaxPage());
    query();
});

pageCounter.addEventListener("change", () => {
    updateCurrentPageNumber(parseInt(pageCounterInput.value) - 1);
    query();
});

query();