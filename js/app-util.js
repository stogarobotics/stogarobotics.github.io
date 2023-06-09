/**
 * @file Defines utility methods that pertain to this project specifically. This script should only have `util.js` as an import.
 */

import {declade, createElement, getData} from "./util.js";

/**
 * Array of all active team numbers.
 * @constant
 * @type {string[]}
 */
export const teamIDs = ['60031','60032','78265','108654','117453','117454'];
export const teamNumbers = ['6121A','6121B','6121C','6121D','6121E','6121F'];
/**
 * Represents an error sent from a failed RobotEvents API response.
 */
export class robotEventsApiError extends Error {
    constructor(message, code) {
        super(message);
        
        this.code = code;
    }
}

/**
 * Queries data from the RobotEvents API once.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [options] Search parameters to be passed through the URL.
 */
export async function robotEventsGet(endpointNameGet) {
    const url = `https://www.robotevents.com/api/v2/${endpointNameGet}`;
    const response = await getData(url);
      if (response.status === 0) {
          throw new robotEventsApiError(response.error_text, response.error_code);
      }
  
      return response;
  }

/**
 * Queries data from a RobotEvents API endpoint several times, once for each specified team.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {string[]} teamNumbersTarget The numbers of the teams to query RobotEvents for.
 * @param {object} [options] Search parameters to be passed through each URL, in addition to "team" being each team number.
 * @param {boolean} [attachTeamNumber] Whether to add the team number as a property to the object of each request.
 */
export async function robotEventsGetForTeams(teamNumbersTarget = [], option, attachTeamNumber = false) {
    
    let promises = [];
  
    for (let index = 0; index < teamNumbersTarget.length; index++) {
      let resultObject;
      
      const teamNumber = teamNumbersTarget[index];
      
      const teamID = teamIDs[teamNumbers.indexOf(teamNumber)];
      
      const url = `teams/${teamID}/${option}`;
    
      resultObject = robotEventsGet(url);
    
      if (attachTeamNumber) {
        resultObject.team = teamNumber;
      }
      
      promises.push(resultObject);
    }
    
    return Promise.all(promises);
  }


  export async function robotEventsGetForTeam (teamNumberTarget, option, attachTeamNumber = false) {
    let promises = [];
    let resultObject;
      const teamID = teamIDs[teamNumbers.indexOf(teamNumberTarget)];
      
      const url = `teams/${teamID}/${option}`;
    
      resultObject = robotEventsGet(url);
    
      if (attachTeamNumber) {
        resultObject.team = teamNumberTarget;
      }
      promises.push(resultObject);
      return Promise.all(promises);
    }
    
    
  
/**
 
 * Queries data from a RobotEvents API endpoint several times, once for each team.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [option] Search parameters to be passed through each URL, in addition to "team" being each team number.
 * @param {boolean} [attachTeamNumber] Whether to add the team number as a property to the object of each request.
 */
export async function robotEventsGetForAllTeams(option, attachTeamNumber) {
    return (await robotEventsGetForTeams( teamNumbers, option, attachTeamNumber)).flat();
}


/**
 * Creates an inline notice to display a simple message.
 * @param {string} text Message of the `<text-notice>`. 
 * @returns {HTMLElement} A `<text-notice>` element with the given text.
 */
export function createNotice(text) {
    return createElement("text-notice", {
        textContent: text,
    });
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Converts a date to `Mmm D, YYYY` format.
 * @param {Date} date The date to reference.
 * @returns {string} A string in `Mmm D, YYYY` format.
 */
export function dateString(date) {
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
    // return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

/**
 * Converts a string indicating a range of dates if the two dates do not represent the time boundaries of a single-day event according to RobotEvents.
 * @param {Date} start The start of an event.
 * @param {Date} end The end of an event.
 * @returns {string} A string in `Mmm D, YYYY – Mmm D, YYYY` format if the event is not single-day, or `Mmm D, YYYY` if it is single-day.
 */
export function dateRangeString(start, end) {
    // From RobotEvents API documentation
    const singleDayEvent = start.getUTCDate() === end.getUTCDate()
        && start.getUTCMonth() === end.getUTCMonth()
        && start.getUTCFullYear() === end.getUTCFullYear();

    if (singleDayEvent) {
        return dateString(start);
    } else {
        return `${dateString(start)} – ${dateString(end)}`;
    }
}

/**
 * Contains presets for generating `<instance-details>` elements.
 * @constant
 * @type {object}
 */
export const generateInstanceDetails = {
    event(resultObject, instanceDetailsContainer) {
        instanceDetailsContainer = instanceDetailsContainer || createElement("instance-details");
        
        declade(instanceDetailsContainer).classList.remove("placeholder");

        createElement("instance-name", {
            children: [
                createElement("a", {
                    properties: {
                        href: `https://www.robotevents.com/robot-competitions/vex-robotics-competition/RE-VRC-22-9124.html#general-info`,
                        target: "_blank",
                    },
                    textContent: resultObject,
                    
                }),
            ],

            parent: instanceDetailsContainer,
        });

        createElement("div", {
            children: [
                document.createTextNode("("),
                createElement("a", {
                    properties: {
                        href: `https://www.robotevents.com/robot-competitions/vex-robotics-competition/RE-VRC-22-9124.html#general-info`,
			    
                        target: "_blank",
                    },
                    textContent: "Monkey",
                }),
                document.createTextNode(")"),
            ],

            parent: instanceDetailsContainer,
        });

        createElement("div", {
            textContent: dateRangeString(new Date(resultObject.start), new Date(resultObject.end)),

            parent: instanceDetailsContainer,
        });

        return instanceDetailsContainer;
    },

    eventDetailed(resultObject, instanceDetailsContainer) {
        instanceDetailsContainer = this.event(resultObject, instanceDetailsContainer);

        const location = [resultObject.loc_venue, resultObject.loc_city, resultObject.loc_region].join(", ");
        const mapLocation = [resultObject.loc_address1, resultObject.loc_city].join(", ");

        createElement("div", {
            children: [
                createElement("a", {
                    properties: {
                        href: `https://www.google.com/maps/place/${mapLocation}`,
                        target: "_blank",
                    },
                    textContent: location,
                }),
            ],
            parent: instanceDetailsContainer,
        });

        createElement("div", {
            textContent: resultObject.season,
            parent: instanceDetailsContainer,
        });

        return instanceDetailsContainer;
    },

    award(resultObject, instanceDetailsContainer, event) {
        instanceDetailsContainer = instanceDetailsContainer || createElement("instance-details");

        const date = event ? new Date(event.start) : NaN;

        declade(instanceDetailsContainer).classList.remove("placeholder");
        
        createElement("instance-name", {
            children: [
                createElement("a", {
                    properties: {
                        href: `https://www.robotevents.com/robot-competitions/vex-robotics-competition/${resultObject.event.code}.html#general-info`,
                        target: "_blank",
                    },
                    textContent: event ? event.name : resultObject.sku,
                }),
            ],

            parent: instanceDetailsContainer,
        });

        createElement("div", {
            children: [
                document.createTextNode("("),
                createElement("a", {
                    properties: {
                        href: `https://www.robotevents.com/robot-competitions/vex-robotics-competition/${resultObject.event.code}.html#general-info`,
                        target: "_blank",
                    },
                    textContent: "RobotEvents",
                }),
                document.createTextNode(")"),
            ],

            parent: instanceDetailsContainer,
        });

        createElement("div", {
            textContent: event ? dateRangeString(date, new Date(event.end)) : "date unknown",

            parent: instanceDetailsContainer,
        });
        
        createElement("div", {
            textContent: groomAwardName(resultObject.title),

            parent: instanceDetailsContainer,
        });
        
        return instanceDetailsContainer;
    },
};

export class ResultObjectRecordCollector {
    constructor({
        recordEncompasses=() => true,
        toDataObject=() => null,
        willAccept=() => true,
    }={}) {
        this.recordEncompasses = recordEncompasses;
        this.toDataObject = toDataObject;
        this.willAccept = willAccept;

        this.clear();
    }

    /**
     * Adds a record identified by the given result object's data object.
     * @param {object} resultObject The RobotEvents result object to initialize the record.
     */
    addRecord(resultObject) {
        const record = new ResultObjectRecord(this.toDataObject(resultObject), this);
        this.records.push(record);
        return record;
    }

    /**
     * Adds a record with the given result object, identified by the result object's data object, treating
     * `toDataObject` as async if it directly returns a promise.
     * @param {object} resultObject The RobotEvents result object to initialize the record.
     */
    async addRecordAsync(resultObject) {
        const record = new ResultObjectRecord(await Promise.resolve(this.toDataObject(resultObject)), this);
        this.records.push(record);
        return record;
    }

    /**
     * Adds result objects to this collector's records.
     * @param {object[]} resultObjects The RobotEvents result objects to parse.
     */
    collect(resultObjects) {
        // Iterate through the result objects
        for (const resultObject of resultObjects) {
            // Skip this result object if invalid
            if (!this.willAccept(resultObject)) continue;

            // Find an existing record that encompasses this result object
            let record = this.records.find(record => record.encompasses(resultObject));

            // If not present, create a new record
            if (!record) {
                record = this.addRecord(resultObject);
            }

            // Add this record as an instance
            record.addInstance(resultObject);
        }
    }

    /**
     * Adds result objects to this collector's records, treating `willAccept`, `recordEncompasses`, and `toDataObject`
     * as async if they directly return promises.
     * @param {object[]} resultObjects The RobotEvents result objects to parse.
     */
    async collectAsync(resultObjects) {
        // Iterate through the result objects
        for (const resultObject of resultObjects) {
            // Skip this result object if invalid
            if (!await Promise.resolve(this.willAccept(resultObject))) continue;

            let recordTarget;

            // Find an existing record that encompasses this result object
            for (const record of this.records) {
                if (!await Promise.resolve(this.recordEncompasses(record, resultObject))) continue;

                recordTarget = record;
                break;
            }

            // If not present, create a new record
            if (!recordTarget) {
                recordTarget = await this.addRecordAsync(resultObject);
            }

            // Add this record as an instance
            recordTarget.addInstance(resultObject);
        }
        
    }

    instances() {
        return this.records.map(record => record.instances).flat();
    }

    clear() {
        this.records = [];
        return this;
    }

    get nInstances() {
        return this.records.reduce((accumulator, record) => accumulator + record.count, 0);
    }
}
/**
 * Common result object collectors.
 */
ResultObjectRecordCollector.createCommon = {
    eventsByScope(options={}) {
        return new ResultObjectRecordCollector(Object.assign({
            recordEncompasses(record, resultObject) {
                return record.data.scope === scopeOf(resultObject);
            },
        
            toDataObject(resultObject) {
                return {
                    scope: scopeOf(resultObject),
                };
            },
        }, options));
    },

    awardsByType(options={}) {
        return new ResultObjectRecordCollector(Object.assign({
            recordEncompasses(record, resultObject) {
                return record.data.name === resultObject.name;
            },
    
            toDataObject(resultObject) {
                return {
                    name: resultObject.name,
                    order: resultObject.order,
                };
            },
        }, options));
    },
};

class ResultObjectRecord {
    constructor(data, collector) {
        this.data = data;
        this.collector = collector;

        this.instances = [];
    }

    addInstance(resultObject) {
        if (!this.instances.includes(resultObject)) {
            this.instances.push(resultObject);
        }
        return this;
    }

    encompasses(resultObject) {
        return this.collector.recordEncompasses(this, resultObject);
    }

    get count() {
        return this.instances.length;
    }
}

export function scopeOf(resultObject) {
    // Determine the scope of this event
    // RobotEvents does not provide a scope property alongside events, but scope can usually be guessed from the event name
    for (const scopeName of scopeNames) {
        if (resultObject.name.toUpperCase().includes(scopeName.toUpperCase())) {
            return scopeName;
        }
    }

    return "";
}

export const scopeNames = [
    "World Championship",
    "U.S. Open",
    "State Championship",
    "",
];

export function groomAwardName(name) {
   let tor = name.replace(/ \(VRC\/VEXU\)/g, "");
    tor = tor.replace(/ \(VRC\/VEXU\/VAIC\)/g, "");
    tor = tor.replace(/ \(VRC\/VEXU\/VAIC\/ADC\)/g, "");
    return tor;
}
