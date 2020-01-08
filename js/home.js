/**
 * @file Script that runs on the homepage. Presents a snippet of the awards list under the Achievements section.
 */

import "./ce.js";
import {qs, createElement} from "./util.js";
import {vexdbGet, vexdbGetForAllTeams, generateInstanceDetails, createNotice, scopeOf, scopeNames} from "./app-util.js";

const achievementsChunkOther = qs(".content-chunk[name='achievements'] > chunk-other");
const instanceList = qs("instance-list", achievementsChunkOther);

const loadingNotice = instanceList.appendChild(createNotice("loading"));

(async () => {
    let awardsLists;
    try {
        awardsLists = await vexdbGetForAllTeams("awards");
    } catch (error) {
        achievementsChunkOther.remove();
        
        throw error;
    }

    const awardsPromises = awardsLists.flat().map(async award => {
        const event = (await vexdbGet("events", {sku: award.sku})).result[0];

        return {
            award,
            event,
            eventScope: event ? scopeOf(event) : "",
            happened: event ? new Date() >= new Date(event.end) : false,
        };
    });

    const awards = await Promise.all(awardsPromises);

    awards.sort((a, b) => {
        const aScope = scopeNames.indexOf(a.eventScope);
        const bScope = scopeNames.indexOf(b.eventScope);

        switch (true) {
            case !a.happened:
                return 1;

            case !b.happened:
                return -1;

            case aScope < bScope:
                return -1;

            case aScope > bScope:
                return 1;

            case a.award.order < b.award.order:
                return -1;

            case a.award.order > b.award.order:
                return 1;

            default:
                return 0;
        }
    });

    for (let i = 0; i < Math.min(4, awards.length); i++) {
        const {award, event} = awards[i];

        const instanceDetails = instanceList.appendChild(generateInstanceDetails.award(award, undefined, event));
        instanceDetails.appendChild(createElement("div", {
            children: [
                createElement("a", {
                    textContent: award.team,

                    properties: {
                        "href": `./teams/${award.team}`,
                    },
                }),
            ],
        }));
    }

    achievementsChunkOther.appendChild(createElement("div", {
        children: [
            document.createTextNode("⁦… "),

            createElement("a", {
                textContent: "and more",
                
                properties: {
                    "href": "./achievements/",
                },
            }),

            document.createTextNode(" ⁦…"),
        ],
    }));

    loadingNotice.remove();
})();