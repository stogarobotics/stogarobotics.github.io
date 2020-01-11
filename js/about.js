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
            await eventScopeCollector.collectAsync(await vexdbGetForAllTeams("events", {status: "past"}))
        })());
        
        promises.push((async () => {
            await awardsCollector.collectAsync(await vexdbGetForAllTeams("awards"))
        })());

        return Promise.all(promises);
    };

    const oncallbackresolve = () => {
        const tourneyChampionsOrFinalists = name => [
            "Tournament Champions",
            "Tournament Finalists",
        ].includes(groomAwardName(name));

        const stats = [
            eventScopeCollector.records.find(record => record.data.scope === scopeNames[0]).count,

            eventScopeCollector.nInstances,

            awardsCollector.records.reduce((accumulator, record) =>
                accumulator + (tourneyChampionsOrFinalists(record.data.name) ? record.count : 0), 0),

            awardsCollector.records.find(record => groomAwardName(record.data.name) === "Division Finalist").count,
        ];

        for (let i = 0; i < stats.length; i++) {
            statList.setNumber(i, stats[i]);
        }
    };

    const loadingSign = LoadingSign.create(asyncCallback, oncallbackresolve);

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