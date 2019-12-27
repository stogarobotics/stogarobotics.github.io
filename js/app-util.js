/**
 * @file Defines utility methods that pertain to this project specifically. This script should only have `util.js` as an import.
 */

import {createElement, xhrGet} from "./util.js";

export const teamNumbers = new Array(6).fill().map((value, i) => `6121${String.fromCharCode(i + "A".charCodeAt())}`);

/**
 * Queries data from the VexDB API once.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [options] Search parameters to be passed through the URL.
 */
export async function vexdbGet(endpointNameGet, options={}) {
    const response = await xhrGet(`https://api.vexdb.io/v1/get_${endpointNameGet}?${new URLSearchParams(options)}`);

    // If the response gave back an error, throw the object
    if (response.status === 0) {
        throw response;
    }

    return response;
}

/**
 * Queries data from a VexDB API endpoint several times, once for each team.
 * @param {string} endpointNameGet The name of the endpoint, with "get_" trimmed from the start.
 * @param {object} [options] Search parameters to be passed through each URL, in addition to "team" being each team number.
 * @param {boolean} [attachTeamNumber] Whether to add the team number as a property to the object of each request.
 */
export async function vexdbGetForAllTeams(endpointNameGet, options={}, attachTeamNumber=false) {
    const promises = teamNumbers.map(async (teamNumber, i) => {
        const list = (await vexdbGet(endpointNameGet, Object.assign({team: teamNumber}, options))).result;

        if (attachTeamNumber) {
            for (const resultObject of list) {
                resultObject.team = teamNumber;
            }
        }

        return list;
    });

    return await Promise.all(promises);
}

export function createNotice(text) {
    return createElement("text-notice", {
        textContent: text,
    });
}