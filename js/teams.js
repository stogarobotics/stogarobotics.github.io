/**
 * @file Script that runs on team pages. Loads the statistic summaries that appear on the page.
 */

import {qs, declade, createElement} from "./util.js";
import {createNotice, vexdbGet, generateInstanceDetails, ResultObjectRecordCollector} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

const teamNumber = qs("[name='team-number']").value;
const targetStatistics = [
    ["events", "events registered", "event registered"],
    ["matches", "matches played", "match played"],
    ["awards", "awards received", "award received"],
];

// Events, matches, award counts

{
    const teamStatContainer = qs("[name='team-statistics']");
    const teamStatList = qs("team-stat-list");
    
    const asyncCallback = () => {
        declade(teamStatList);

        const targertStatisticsPromises = [];
        
        for (const targetStatistic of targetStatistics) {
            const statBar = buildStatisticBar("…", targetStatistic[1]);
        
            targertStatisticsPromises.push((async () => {
                const count = (await vexdbGet(targetStatistic[0], {team: teamNumber})).size;
                statBar[0].textContent = count.toLocaleString();
                statBar[1].textContent = targetStatistic[count !== 1 ? 1 : 2]; // Select the appropriate label (plural or singular)
            })());
        }

        return Promise.all(targertStatisticsPromises);
    };

    const loadingSign = LoadingSign.create(asyncCallback);
    teamStatContainer.insertBefore(loadingSign, teamStatList);

    loadingSign.run();

    function buildStatisticBar(value, label) {
        return [
            createElement("big-number", {
                textContent: value.toLocaleString(),
                parent: teamStatList,
            }),
    
            createElement("h4", {
                textContent: label,
                parent: teamStatList,
            }),
        ];
    }
}

// Upcoming event list

{
    const list = qs("instance-list[name='upcoming-events']");
    
    const upcomingEventCollector = new ResultObjectRecordCollector({
        willAccept(resultObject) {
            return new Date() < new Date(resultObject.end);
        },
    });

    const asyncCallback = async () => {
        declade(list);

        upcomingEventCollector.count((await vexdbGet("events", {team: teamNumber})).result);
    };

    const loadingSign = LoadingSign.create(asyncCallback);
    list.parentElement.insertBefore(loadingSign, list);

    loadingSign.run().then(() => {
        const instances = upcomingEventCollector.instances(); console.log(instances);
        if (instances.length !== 0) {
            for (const instance of instances.sort((a, b) => new Date(a.start) - new Date(b.start))) {
                list.appendChild(generateInstanceDetails.eventDetailed(instance));
            }
        } else {
            list.parentElement.insertBefore(createNotice("no upcoming events found"), list);
        }
    });
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