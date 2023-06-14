/**
 * @file Script that runs on the homepage. Presents a snippet of the awards list under the Achievements section.
 */

import "./ce.js";
import {qs, createElement,getData} from "./util.js";
import {robotEventsGet, robotEventsGetForTeam, robotEventsGetForTeams, robotEventsGetForAllTeams, generateInstanceDetails, createNotice, scopeOf, scopeNames, teamNumbers, teamIDs} from "./app-util.js";

const nMaxAwardsToShow = 6;

const achievementsChunkOther = qs(".content-chunk[name='achievements'] > chunk-other");
const instanceList = qs("instance-list", achievementsChunkOther);

const loadingNotice = instanceList.appendChild(createNotice("loading"));

(async () => {
    // The awards preview causes a page jump; this counteracts it unless the user has already scrolled
    let scrolled = false;
    function handleScroll() {
        scrolled = true;
    }

    // addEventListener("scroll", handleScroll, {once: true});
   
    let awardsList;
   

    // If this fails, remove the awards preview entirely
    try {
       
        if (localStorage.getItem(`awardsList`) == null  ) {
            awardsList = await robotEventsGetForAllTeams("awards?per_page=250",true);
            const awardsListString = JSON.stringify(awardsList);
            localStorage.setItem('awardsList', awardsListString);
    
            
         } else {
            awardsList = JSON.parse(localStorage.getItem(`awardsList`));
            console.log(awardsList)
            
           }
        
        

        
        let list = [];
           console.log(awardsList)
       for (let i =0; i< awardsList.length; i++) {
            list[i] = awardsList[i].meta.last_page
           
       }
       
       const promises = awardsList.map(async (award, index) => {
        
        
          if (localStorage.getItem(`awards?per_page=250${teamNumbers[index]}_${index}`) !== null) {
            award= JSON.parse(localStorage.getItem(`awards?per_page=250${teamNumbers[index]}_${index}`));
          } else {
            award = await robotEventsGetForTeam(`${teamNumbers[index]}`, `awards?per_page=250&page=${index}`);
            var awardListString = JSON.stringify(award);
            localStorage.setItem(`awards?per_page=250${teamNumbers[index]}_${index}`, awardListString);

          } 
        
      });
      
      // Execute all promises in parallel
      await Promise.all(promises);

 } catch (error) {
        achievementsChunkOther.remove();
        
        throw error;
    }

    // Get the event result object from each award and extract relevant data
    
    const awardsPromises = awardsList.map(async award => {
    
        
        const eventFromAward = award["data"][award.data.length-1].event;
        const eventID = eventFromAward.id;
        
        let event;
        if (localStorage.getItem(`events/${eventID}`) !== null ) {
            event= JSON.parse(localStorage.getItem(`events/${eventID}`));
          } else {
            event = await robotEventsGet(`events/${eventID}`);
            console.log(event.name)
            var awardListString = JSON.stringify(event);
            localStorage.setItem(`events/${eventID}`, awardListString);

          } 
        
        return {
            award,
            event,
            eventScope: event ? scopeOf(event) : "",
            happened: event ? new Date() >= new Date(event.end) : false,
        };
    });

    const awards = await Promise.all(awardsPromises);
    
    for (let i = 0; i< awardsList.length; i++){
        awards[i].team = teamNumbers[i];


    }

    // Sorts awards first by scope, then by award prestige
    // awards.sort((a, b) => {
    //     const aScope = scopeNames.indexOf(a.eventScope);
    //     const bScope = scopeNames.indexOf(b.eventScope);

    //     switch (true) {
    //         case !a.happened:
    //             return 1;

    //         case !b.happened:
    //             return -1;

    //         case aScope < bScope:
    //             return -1;

    //         case aScope > bScope:
    //             return 1;

    //         case a.award.order < b.award.order:
    //             return -1;

    //         case a.award.order > b.award.order:
    //             return 1;

    //         default:
    //             return 0;
    //     }
    // }
    

    for (let i = 0; i < Math.min(nMaxAwardsToShow, awards.length); i++) {
        const award= awards[i].award.data[awards[i].award.data.length-1];
        
        
        const instanceDetails = instanceList.appendChild(generateInstanceDetails.award(award, undefined, awards[i].event));
        instanceDetails.appendChild(createElement("div", {
            children: [
                createElement("a", {
                    textContent: awards[i].team,
                    
                    properties: {
                        "href": `./teams/${awards[i].team}`,
                    },
                }),
            ],
        }));
    }

    achievementsChunkOther.appendChild(createElement("note-", {
        children: [
            document.createTextNode("⁦… "),

            createElement("a", {
                textContent: "and more",
                
                properties: {
                    "href": "./achievements/",
                },
            }),

            document.createTextNode(" ⁦…"),
        ],
    }));

    // Do the page jump counteraction
    removeEventListener("scroll", handleScroll);
    if (!scrolled && location.hash.replace(/#/g, "")) {
        location.replace(location.hash);
    }

    loadingNotice.remove();
})();
