/**
 * @file Script that runs on the About page. Loads the statistic summary that appears on the page.
 */

import {qs} from "./util.js";
import {vexdbGetForAllTeams, ResultObjectRecordCollector, scopeNames, groomAwardName} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

{
    const eventScopeCollector = ResultObjectRecordCollector.generateCommon.eventsByScope();
    const awardsCollector = ResultObjectRecordCollector.generateCommon.awards();

    const statList = qs("stat-list");
    
    const asyncCallback = () => {
        const promises = [];
        
        for (let i = 0; i < statList.numbers.length; i++) {
            statList.setNumberAsLoading(i);
        }

        promises.push((async () => {
            eventScopeCollector.count(await vexdbGetForAllTeams("events"));
        })());

        promises.push((async () => {
            awardsCollector.count(await vexdbGetForAllTeams("awards"));
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
    statList.parentElement.insertBefore(loadingSign, statList);

    loadingSign.run();
}