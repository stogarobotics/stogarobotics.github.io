/**
 * @file Script that runs on the About page. Loads the statistic summary that appears on the page.
 */

import {qs} from "./util.js";
import {robotEventsGet, robotEventsGetForAllTeams, robotEventsGetForTeam, ResultObjectRecordCollector, scopeNames, groomAwardName, teamNumbers} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

const statList = qs("stat-list");

const asyncCallback = async () => {
  statList.parentElement.insertBefore(loadingSign, statList);
  for (let i = 0; i < statList.numbers.length; i++) {
    statList.setNumberAsLoading(i);
  }
  let nAwards =0;
  let nTournamentChamps =0;
  let appearances =0;
  let worldsAppearances =0;
  const teamPromises = teamNumbers.map(async (teamNumber) => {
    
   
    
    const [eventsResponse, awardsResponse] = await Promise.all([
      (async () => {
        let eventsList;
        if (localStorage.getItem(`eventsList${teamNumber}`) !== null) {
          eventsList = JSON.parse(localStorage.getItem(`eventsList${teamNumber}`));
        } else {
          eventsList = await robotEventsGetForTeam(`${teamNumber}`, "events?per_page=250");
          var eventsListString = JSON.stringify(eventsList);
          localStorage.setItem(`eventsList${teamNumber}`, eventsListString);
        }
        return eventsList;
      })(),
    
      (async () => {
        let awardList;
        if (localStorage.getItem(`awardList${teamNumber}`) !== null) {
          awardList = JSON.parse(localStorage.getItem(`awardList${teamNumber}`));
        } else {
          awardList = await robotEventsGetForTeam(`${teamNumber}`, "awards?per_page=250");
          var awardListString = JSON.stringify(awardList);
          localStorage.setItem(`awardList${teamNumber}`, awardListString);
        }
        return awardList;
      })()
    ]);
    
    const eventsData = eventsResponse[0];
    const awardsData = awardsResponse[0];
   
    const eventsPromises = [];
    const awardsPromises = [];

    for (let innerIndex = 1; innerIndex <= eventsData.meta.last_page; innerIndex++) {
      eventsPromises.push(
        (async () => {
          let event;
          if (localStorage.getItem(`events?per_page=250${teamNumber}_${innerIndex}`) !== null) {
            event= JSON.parse(localStorage.getItem(`events?per_page=250${teamNumber}_${innerIndex}`));
          } else {
            event = await robotEventsGetForTeam(`${teamNumber}`, `events?per_page=250&page=${innerIndex}`);
            var eventListString = JSON.stringify(event);
            localStorage.setItem(`events?per_page=250${teamNumber}_${innerIndex}`, eventListString);

          }
        
          for (const ev of event[0].data) {
            if (ev.name.includes(scopeNames[0])) {
              worldsAppearances += 1;
            }
            appearances  += 1;
          }




        })()
      );
    }
    for (let innerIndex = 1; innerIndex <= awardsData.meta.last_page; innerIndex++) {
      awardsPromises.push(
        (async () => {
          let award;
          if (localStorage.getItem(`awards?per_page=250${teamNumber}_${innerIndex}`) !== null) {
            award= JSON.parse(localStorage.getItem(`awards?per_page=250${teamNumber}_${innerIndex}`));
          } else {
            award = await robotEventsGetForTeam(`${teamNumber}`, `awards?per_page=250&page=${innerIndex}`);
            var awardListString = JSON.stringify(award);
            localStorage.setItem(`awards?per_page=250${teamNumber}_${innerIndex}`, awardListString);

          }
         
          for (const aw of award[0].data) {
            if (aw.title.includes(['Champion'])) {
              nTournamentChamps += 1;
            }
            nAwards += 1;
          }
        })()
      );
    }

    await Promise.all(eventsPromises.concat(awardsPromises));
  });


  await Promise.all(teamPromises);

  statList.setNumber(0, worldsAppearances);
  statList.setNumber(1, appearances);
  statList.setNumber(2, nTournamentChamps);
  statList.setNumber(3, nAwards);
};


    

    const loadingSign = LoadingSign.create(asyncCallback);
    loadingSign.run();

    // async function findEvent(id) {
    //     for (const instance of eventScopeCollector.instances()) {
    //         if (instance.id === id) {
    //             return instance;
    //         }
    //     }
    
    //     return (await robotEventsGet(`events/${id}`)).result[0];
    // }
