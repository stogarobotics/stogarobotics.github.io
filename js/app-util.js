/**
 * @file Defines utility methods that pertain to this project specifically. This script should only have `util.js` as an import.
 */

import {declade, createElement, xhrGet} from "./util.js";

/**
 * Array of all active team numbers.
 * @constant
 * @type {string[]}
 */
export const teamNumbers = new Array(6).fill().map((value, i) => `6121${String.fromCharCode(i + "A".charCodeAt())}`);

/**
 * Represents an error sent from a failed VexDB API response.
 */
export class VexdbApiError extends Error {
    constructor(message, code) {
        super(message);
        
        this.code = code;
    }
}

/**
 * Queries data from the VexDB API once.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [options] Search parameters to be passed through the URL.
 */
export async function vexdbGet(endpointNameGet, options={}) {
    const response = await xhrGet(`https://api.vexdb.io/v1/get_${endpointNameGet}?${new URLSearchParams(options)}`);

    // If the response gave back an error, throw the object
    if (response.status === 0) {
        throw new VexdbApiError(response.error_text, response.error_code);
    }

    return response;
}

/**
 * Queries data from a VexDB API endpoint several times, once for each specified team.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {string[]} teamNumbersTarget The numbers of the teams to query VexDB for.
 * @param {object} [options] Search parameters to be passed through each URL, in addition to "team" being each team number.
 * @param {boolean} [attachTeamNumber] Whether to add the team number as a property to the object of each request.
 */
export async function vexdbGetForTeams(endpointNameGet, teamNumbersTarget, options={}, attachTeamNumber=false) {
    const promises = teamNumbersTarget.map(async teamNumber => {
        const resultObjects = (await vexdbGet(endpointNameGet, Object.assign({team: teamNumber}, options))).result;

        if (attachTeamNumber) {
            for (const resultObject of resultObjects) {
                resultObject.team = teamNumber;
            }
        }

        return resultObjects;
    });

    return await Promise.all(promises);
}

/**
 * Queries data from a VexDB API endpoint several times, once for each team.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [options] Search parameters to be passed through each URL, in addition to "team" being each team number.
 * @param {boolean} [attachTeamNumber] Whether to add the team number as a property to the object of each request.
 */
export async function vexdbGetForAllTeams(endpointNameGet, options, attachTeamNumber) {
    return await vexdbGetForTeams(endpointNameGet, teamNumbers, options, attachTeamNumber)
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

/**
 * Converts a date to `YYYY-MM-DD` format.
 * @param {Date} date The date to reference.
 * @returns {string} A string in `YYYY-MM-DD` format.
 */
export function dateString(date) {
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

/**
 * Converts a string indicating a range of dates if the two dates do not represent the time boundaries of a single-day event according to VexDB.
 * @param {Date} start The start of an event.
 * @param {Date} end The end of an event.
 * @returns {string} A string in `YYYY-MM-DD – YYYY-MM-DD` format if the event is not single-day, or `YYYY-MM-DD` if it is single-day.
 */
export function dateRangeString(start, end) {
    // From VexDB API documentation
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
                        href: `https://robotevents.com/${resultObject.sku}.html`,
                        target: "_blank",
                    },
                    textContent: resultObject.name,
                }),
            ],

            parent: instanceDetailsContainer,
        });

        createElement("div", {
            children: [
                document.createTextNode("("),
                createElement("a", {
                    properties: {
                        href: `https://vexdb.io/events/view/${resultObject.sku}`,
                        target: "_blank",
                    },
                    textContent: "VexDB",
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
                        href: `https://robotevents.com/${resultObject.sku}.html`,
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
                        href: `https://vexdb.io/events/view/${resultObject.sku}`,
                        target: "_blank",
                    },
                    textContent: "VexDB",
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
            textContent: resultObject.name,

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

    addRecord(resultObject) {
        const record = new ResultObjectRecord(this.toDataObject(resultObject), this);
        this.records.push(record);
        return record;
    }

    count(resultObjects) {
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

    instances() {
        return this.records.map(record => record.instances).flat();
    }

    clear() {
        this.records = [];
        return this;
    }
}

class ResultObjectRecord {
    constructor(data, counter) {
        this.data = data;
        this.counter = counter;

        this.instances = [];
    }

    addInstance(resultObject) {
        if (!this.instances.includes(resultObject)) {
            this.instances.push(resultObject);
        }
        return this;
    }

    encompasses(resultObject) {
        return this.counter.recordEncompasses(this, resultObject);
    }

    get count() {
        return this.instances.length;
    }
}