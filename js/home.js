/**
 * @file Script that runs on the homepage. Presents a snippet of the awards list under the Prestige section.
 */

import "./ce.js";
import {qs, createElement} from "./util.js";
import {vexdbGetForAllTeams} from "./app-util.js";

(async () => {
    const awardsLists = await vexdbGetForAllTeams("awards");

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

            parent: qs(".content-chunk[name='prestige'] > chunk-other > bar-list"),
        });
    }
})();