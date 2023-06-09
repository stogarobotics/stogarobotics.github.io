/**
 * @file Script that runs on the About page. Loads the statistic summary that appears on the page.
 */

import {qs} from "./util.js";
import {robotEventsGet, robotEventsGetForAllTeams, robotEventsGetForTeam, ResultObjectRecordCollector, scopeNames, groomAwardName, teamNumbers} from "./app-util.js";
import {LoadingSign} from "./ce/LoadingSign.js";

{
  
    const statList = qs("stat-list");
    
    const asyncCallback = async () => {
      
    
      statList.parentElement.insertBefore(loadingSign, statList);
      for (let i = 0; i < statList.numbers.length; i++) {
        statList.setNumberAsLoading(i);
      }
    
      const promises = [];
      let worldsAppearances = 0;
      let appearances = 0;
      let nTournamentChamps = 0;
      let nAwards = 0;
    
      for (const teamNumber of teamNumbers) {
        promises.push(
          (async () => {
            const [eventsResponse, awardsResponse] = await Promise.all([
              robotEventsGetForTeam(teamNumber, "events"),
              robotEventsGetForTeam(teamNumber, "awards")
            ]);
    
            const eventsData = eventsResponse[0];
            const awardsData = awardsResponse[0];
    
            for (let innerIndex = 1; innerIndex <= eventsData.meta.last_page; innerIndex++) {
              const eventsPageResponse = await robotEventsGetForTeam(teamNumber, `events/?page=${innerIndex}`);
              const nestedEventsData = eventsPageResponse[0];
    
              for (const event of nestedEventsData.data) {
                const groomedName = groomAwardName(event.name);
                if (groomedName.includes(scopeNames[0])) {
                  worldsAppearances += 1;
                }
                appearances += 1;
              }
            }
    
            for (const award of awardsData.data) {
              const groomedName = groomAwardName(award.title);
    
              if (["Tournament Champions"].includes(groomedName)) {
                nTournamentChamps += 1;
              } else if (["Judges Award", "Build Award", "Amaze Award", "Robot Skills Champion", "Create Award", "Excellence Award", "Robot Skills 2nd Place"].includes(groomedName)) {
                nAwards += 1;
              }
            }
          })()
        );
      }
    
      await Promise.all(promises);
    
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
}
