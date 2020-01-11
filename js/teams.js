/**
 * @file Script that runs on team pages. Loads the statistic summaries that appear on the page.
 */

import {qs, declade} from "./util.js";
import {createNotice, vexdbGet, generateInstanceDetails, ResultObjectRecordCollector} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

const teamNumber = qs("[name='team-number']").value;

// Events, matches, award counts

{
    const statList = qs("stat-list");

    const targetStatisticCallbacks = [
        async () => {
            return (await vexdbGet("events", {team: teamNumber, nodata: true})).size;
        },

        async () => {
            return (await vexdbGet("matches", {team: teamNumber, nodata: true})).size;
        },

        async () => {
            const awards = (await vexdbGet("awards", {team: teamNumber})).result;
            
            let nLegitimateAwards = 0;
            for (const resultObject of awards) {
                const event = (await vexdbGet("events", {sku: resultObject.sku})).result[0];
                nLegitimateAwards += Number(!event || new Date() > new Date(event.end));
            }

            return nLegitimateAwards;
        },
    ];
    
    const asyncCallback = () => {
        const targertStatisticsPromises = [];
        
        for (let i = 0; i < targetStatisticCallbacks.length; i++) {
            statList.setNumberAsLoading(i);

            targertStatisticsPromises.push((async () => {
                const count = await targetStatisticCallbacks[i]();
                statList.setNumber(i, count);
            })());
        }

        return Promise.all(targertStatisticsPromises);
    };

    const loadingSign = LoadingSign.create(asyncCallback);
    statList.parentElement.insertBefore(loadingSign, statList);

    loadingSign.run();

    // function buildStatisticBar(value, label) {
    //     return [
    //         createElement("big-number", {
    //             textContent: value.toLocaleString(),
    //             parent: statList,
    //         }),
    
    //         createElement("h4", {
    //             textContent: label,
    //             parent: statList,
    //         }),
    //     ];
    // }
}

// Upcoming event list

{
    const list = qs("instance-list[name='upcoming-events']");
    
    const upcomingEventCollector = new ResultObjectRecordCollector({
        willAccept(resultObject) {
            // No past events
            return new Date() < new Date(resultObject.end);
        },
    });

    const asyncCallback = async () => {
        declade(list);

        list.parentElement.insertBefore(loadingSign, list);

        // VexDB's "status" parameter currently does not accept multiple values
        upcomingEventCollector.collect((await vexdbGet("events", {team: teamNumber, status: "current"})).result);
        upcomingEventCollector.collect((await vexdbGet("events", {team: teamNumber, status: "future"})).result);
    };

    const oncallbackresolve = () => {
        const instances = upcomingEventCollector.instances();

        if (instances.length !== 0) {
            // Show details for each found event
            for (const instance of instances.sort((a, b) => new Date(a.start) - new Date(b.start))) {
                list.appendChild(generateInstanceDetails.eventDetailed(instance));
            }
        } else {
            // Show a notice that no events were found
            list.parentElement.insertBefore(createNotice("no upcoming events found"), list);
        }
    };

    const loadingSign = LoadingSign.create(asyncCallback, oncallbackresolve);
    loadingSign.run();
}


/* (async () => {

     // W:L:T ratio
    {
        const rankings = (await vexdbGet("rankings", {team: teamNumber})).result;
        const rankingCounts = {
            wins: 0,
            losses: 0,
            ties: 0,
        };

        for (const resultObject of rankings) {
            for (const stat of Object.keys(rankingCounts)) {
                rankingCounts[stat] += resultObject[stat];
            }
        }

        const max = Math.max(...Object.values(rankingCounts));
        buildStatisticBar(Object.values(rankingCounts).map(count => (count / max).toFixed(3)).join(":"), "win:loss:tie ratio");
    }
})();*/