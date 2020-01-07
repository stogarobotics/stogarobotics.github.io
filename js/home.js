/**
 * @file Script that runs on the homepage. Presents a snippet of the awards list under the Prestige section.
 */

import "./ce.js";
import {qs, createElement} from "./util.js";
import {vexdbGet, vexdbGetForAllTeams, generateInstanceDetails, createNotice} from "./app-util.js";

const prestigeChunkOther = qs(".content-chunk[name='prestige'] > chunk-other");
const instanceList = qs("instance-list", prestigeChunkOther);

const loadingNotice = instanceList.appendChild(createNotice("loading"));

(async () => {
    let awardsLists;
    try {
        awardsLists = await vexdbGetForAllTeams("awards");
    } catch (error) {
        prestigeChunkOther.remove();
        
        throw error;
    }

    const awards = awardsLists.flat().sort((a, b) => a.order - b.order);

    for (let i = 0; i < 4; i++) {
        const award = awards[i];
        if (!award) break;

        const event = (await vexdbGet("events", {sku: award.sku})).result[0];

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

    prestigeChunkOther.appendChild(createElement("div", {
        children: [
            document.createTextNode("⁦… "),

            createElement("a", {
                textContent: "and more",
                
                properties: {
                    "href": "./prestige/",
                },
            }),

            document.createTextNode(" ⁦…"),
        ],
    }));

    loadingNotice.remove();
})();