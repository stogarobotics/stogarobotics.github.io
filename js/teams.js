/**
 * @file Script that runs on team pages. Loads the statistic summaries that appear on the page.
 */

import {qs, declade} from "./util.js";
import {createNotice, robotEventsGet, robotEventsGetForTeam, generateInstanceDetails, ResultObjectRecordCollector, robotEventsGetForTeams} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

const teamNumberInput = qs("[name='team-number']");
const teamNumber = teamNumberInput.value;
teamNumberInput.remove();

// Events, matches, award counts

{

    const statList = qs("stat-list");

    const targetStatisticCallbacks = [
      async () => {
        const eventsList = await robotEventsGetForTeam(`${teamNumber}`, "events");
        const numOfEvents = eventsList[0].meta.total;
        return numOfEvents;
      },
      async () => {
        const matchesList = await robotEventsGetForTeam(`${teamNumber}`, "matches"); 
        const numOfMatches = matchesList[0].meta.total;
        
        return numOfMatches;
      },
      async () => {
        const awardsList = await robotEventsGetForTeam(`${teamNumber}`, "awards");
        const numOfAwards = awardsList[0].meta.total;
         return numOfAwards;
      },
    ];
    
    const asyncCallback = async () => {
      const targetStatisticsPromises = targetStatisticCallbacks.map(async (callback, i) => {
        statList.setNumberAsLoading(i);
        const count = await callback();
        statList.setNumber(i, count);
      });
    
      await Promise.all(targetStatisticsPromises);
    };
    

    // const targetStatisticCallbacks = [
    //     async eventsBySku => {
    //         return Object.keys(eventsBySku).length;
    //     },

    //     async () => {
    //         return (await robotEventsGet("matches", {team: teamNumber, nodata: true})).size;
    //     },

    //     async eventsBySku => {
    //         const awards = (await robotEventsGet("awards", {team: teamNumber})).result;
            
    //         let nLegitimateAwards = 0;
    //         for (const resultObject of awards) {
    //             const event = eventsBySku[resultObject.sku];
    //             nLegitimateAwards += event && new Date() > new Date(event.end) ? 1 : 0;
    //         }

    //         return nLegitimateAwards;
    //     },
    // ];
    
    // const asyncCallback = () => {
    //     const targertStatisticsPromises = [];
        
    //     for (let i = 0; i < targetStatisticCallbacks.length; i++) {
    //         statList.setNumberAsLoading(i);

    //         targertStatisticsPromises.push((async () => {
    //             const count = await targetStatisticCallbacks[i](eventsBySku);
    //             statList.setNumber(i, count);
    //         })());
    //     }

    //     return Promise.all(targertStatisticsPromises);
    // };

    // const events = (await robotEventsGet("events", {team: teamNumber, status: "past"})).result;
    // const eventsBySku = {};
    // for (const event of events) {
    //     eventsBySku[event.sku] = event;
    // }

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

// {
//     const list = qs("instance-list[name='upcoming-events']");
    
//     const upcomingEventCollector = new ResultObjectRecordCollector({
//         willAccept(resultObject) {
//             // No past events
//             return new Date() < new Date(resultObject.end);
//         },
//     });

//     const asyncCallback = async () => {
//         declade(list);

//         list.parentElement.insertBefore(loadingSign, list);

//         // RobotEvents's "status" parameter currently does not accept multiple values
//         upcomingEventCollector.collect((await robotEventsGet("events", {team: teamNumber, status: "current"})).result);
//         upcomingEventCollector.collect((await robotEventsGet("events", {team: teamNumber, status: "future"})).result);
//     };

//     const oncallbackresolve = () => {
//         const instances = upcomingEventCollector.instances();

//         if (instances.length !== 0) {
//             // Show details for each found event
//             for (const instance of instances.sort((a, b) => new Date(a.start) - new Date(b.start))) {
//                 list.appendChild(generateInstanceDetails.eventDetailed(instance));
//             }
//         } else {
//             // Show a notice that no events were found
//             list.parentElement.insertBefore(createNotice("no upcoming events found"), list);
//         }
//     };

//     const loadingSign = LoadingSign.create(asyncCallback, oncallbackresolve);
//     loadingSign.run();
// }


/* (async () => {

     // W:L:T ratio
    {
        const rankings = (await RobotEventsGet("rankings", {team: teamNumber})).result;
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

