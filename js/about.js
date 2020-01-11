/**
 * @file Script that runs on the About page. Loads the statistic summary that appears on the page.
 */

import {qs} from "./util.js";
import {vexdbGet, vexdbGetForAllTeams, ResultObjectRecordCollector, scopeNames, groomAwardName} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

{
    const eventScopeCollector = ResultObjectRecordCollector.createCommon.eventsByScope();
    const awardsCollector = ResultObjectRecordCollector.createCommon.awardsByType({
        async willAccept(resultObject) {
            const event = await findEvent(resultObject.sku);
            return !event || new Date() > new Date(event.end);
        },
    });

    const statList = qs("stat-list");
    
    const asyncCallback = () => {
        eventScopeCollector.clear();
        awardsCollector.clear();

        statList.parentElement.insertBefore(loadingSign, statList);

        const promises = [];
        
        for (let i = 0; i < statList.numbers.length; i++) {
            statList.setNumberAsLoading(i);
        }

        promises.push((async () => {
            await eventScopeCollector.collectAsync(await vexdbGetForAllTeams("events", {status: "past"}));

            // Number of Worlds appearances
            statList.setNumber(0, eventScopeCollector.records.find(record => record.data.scope === scopeNames[0]).count);
            // Total appearances
            statList.setNumber(1, eventScopeCollector.nInstances);
        })());
        
        promises.push((async () => {
            await awardsCollector.collectAsync(await vexdbGetForAllTeams("awards"));

            let nTournamentFinals = 0; // Counts both Champions and Finalists awards
            let nDivisionFinalists = 0;

            for (const record of awardsCollector.records) {
                const name = groomAwardName(record.data.name);

                if (["Tournament Champions", "Tournament Finalists"].includes(name)) {
                    nTournamentFinals += record.count;
                } else if (name === "Division Finalist") {
                    nDivisionFinalists += record.count;
                }
            }

            statList.setNumber(2, nTournamentFinals);
            statList.setNumber(3, nDivisionFinalists);
        })());

        return Promise.all(promises);
    };

    const loadingSign = LoadingSign.create(asyncCallback);
    loadingSign.run();

    async function findEvent(sku) {
        for (const instance of eventScopeCollector.instances()) {
            if (instance.sku === sku) {
                return instance;
            }
        }
    
        return (await vexdbGet("events", {sku})).result[0];
    }
}