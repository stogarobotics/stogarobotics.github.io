/**
 * @file Script that runs on the homepage. Presents a snippet of the awards list under the Prestige section.
 */

import "./ce.js";
import {qs, createElement} from "./util.js";
import {vexdbGetForAllTeams} from "./app-util.js";

const prestigeChunkOther = qs(".content-chunk[name='prestige'] > chunk-other");

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
                                target: "_blank",
                            },
                            textContent: award.sku,
                        }),
                    ],
                }),
            ],

            parent: qs("bar-list", prestigeChunkOther),
        });
    }
})();