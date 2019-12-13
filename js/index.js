import "./ce.js";
import {qs, qsa, createElement} from "./util.js";

// Edge fallback
if (!Array.prototype.flat) {
    Array.prototype.flat = function () {
        return this.reduce((accumulator, item) => accumulator.concat(item), []);
    };
}

// for (let element of qsa(".js-loading")) {
//     element.appendChild();
// }

qs("footer copyright-year").textContent = new Date().getUTCFullYear();

function loadAwards(teamNumber) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            resolve(JSON.parse(req.responseText).result);
        });
        req.open("GET", `https://api.vexdb.io/v1/get_awards?team=${encodeURI(teamNumber)}`);
        req.send();
    });
}

(async () => {
    const teamNumbers = new Array(6).fill().map((value, i) => `6121${String.fromCharCode(i + "A".charCodeAt())}`);

    const awardsLists = [];
    const awardsPromises = teamNumbers.map((teamNumber, i) => loadAwards(teamNumber).then(awardsList => {
        awardsLists[i] = awardsList;
    }));

    await Promise.all(awardsPromises);

    const awards = awardsLists.flat().sort((a, b) => a.order - b.order);

    for (let i = 0; i < 6; i++) {
        const award = awards[i];
        if (!award) break;

        createElement("bar-item", {
            children: [
                createElement("div", {
                    children: [
                        createElement("a", {
                            properties: {
                                href: `./teams/${award.team}/`,
                            },
                            textContent: award.team,
                        }),
                    ],
                }),
                createElement("h4", {
                    textContent: award.name,
                }),
                createElement("div", {
                    children: [
                        createElement("a", {
                            properties: {
                                href: `https://vexdb.io/events/view/${award.sku}`,
                            },
                            textContent: award.sku,
                        }),
                    ],
                }),
            ],

            parent: qs(".content-chunk[name='honors'] > chunk-other > bar-list"),
        });
    }
})();