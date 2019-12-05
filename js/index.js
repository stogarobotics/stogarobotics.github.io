import "./ce.js";
import {qs, qsa, createElement} from "./util.js";

// for (let element of qsa(".js-loading")) {
//     element.appendChild();
// }

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
                    textContent: award.team,
                }),
                createElement("h4", {
                    textContent: award.name,
                }),
                createElement("div", {
                    textContent: award.sku,
                }),
            ],

            parent: qs(".content-chunk[name='honors'] > chunk-other > bar-list"),
        });
    }
})();