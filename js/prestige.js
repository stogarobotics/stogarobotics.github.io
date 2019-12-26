/**
 * @file Script that runs on the Prestige page. Queries data from the VexDB API and counts certain attributes to present team totals.
 */

import {qs, createElement, declade} from "./util.js";
import {vexdbGet, vexdbGetForAllTeams, createNotice} from "./app-util.js";

const instanceDisplay = qs("instance-display");

// Classes used to count instances of a type from the query

class TypeCounter {
    constructor(count=0) {
        this.count = count;
        this.instances = [];
    }

    addInstance(resultObject) {
        if (!this.instances.includes(resultObject)) {
            this.instances.push(resultObject);
        }
        return this;
    }
}

const scopeNames = [
    "World Championship",
    "State Championship",
    "Qualifier",
    "",
];

function getLoadingFailMessage(nLoadingFails) {
    switch (true) {
        case nLoadingFails === 0:
            return "";

        case nLoadingFails === 1:
            return " again";

        default:
            return ` ${nLoadingFails} times`;
    }
}

class EventScopeType extends TypeCounter {
    constructor(resultObject) {
        super();

        this.scope = EventScopeType.scopeOf(resultObject);

        this.addInstance(resultObject);
    }
    
    static willAccept(resultObject) {
        // no future events
        return new Date() > new Date(resultObject.start);
    }

    static scopeOf(resultObject) {
        // Determine the scope of this event
        // VexDB does not provide a scope property alongside events, but scope can usually be guessed from the event name
        for (const scopeName of scopeNames) {
            if (resultObject.name.toUpperCase().includes(scopeName.toUpperCase())) {
                return scopeName;
            }
        }

        return "";
    }

    static updateDisplay() {
        declade(this.grid);

        this.records = this.records.sort((a, b) => scopeNames.indexOf(a.scope) - scopeNames.indexOf(b.scope));

        // Display the counts
        for (const record of this.records) {
            createBlock(record.count,
                    record.scope ? `Times teams attended a ${record.scope}` : "Other",
                    this.grid,
                    false,
                    record);
        }
    
        const nTotal = this.records.reduce((accumulator, {count}) => accumulator + count, 0);
        createBlock(nTotal,
                "Total",
                this.grid,
                true,
                this);
    }

    static async buildInstancesDisplay(instances, sublist) {
        instances = instances.sort((a, b) => new Date(b.start) - new Date(a.start));
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const instanceDetailsContainer = sublist.children[i];

            const date = new Date(instance.start);

            declade(instanceDetailsContainer).classList.remove("placeholder");

            createElement("instance-name", {
                children: [
                    createElement("a", {
                        properties: {
                            href: `https://robotevents.com/${instance.sku}.html`,
                            target: "_blank",
                        },
                        textContent: instance.name,
                    }),
                ],

                parent: instanceDetailsContainer,
            });

            createElement("div", {
                children: [
                    document.createTextNode(" ("),
                    createElement("a", {
                        properties: {
                            href: `https://vexdb.io/events/view/${instance.sku}`,
                            target: "_blank",
                        },
                        textContent: "VexDB",
                    }),
                    document.createTextNode(")"),
                ],

                parent: instanceDetailsContainer,
            });

            createElement("div", {
                textContent: dateString(date),

                parent: instanceDetailsContainer,
            });
        }
    }

    equiv(resultObject) {
        return this.id === EventScopeType.scopeOf(resultObject);
    }

    get id() {
        return this.scope;
    }
}
EventScopeType.records = [];
EventScopeType.nLoadingFails = 0;
EventScopeType.grid = qs("block-grid[name='events']");
EventScopeType.endpointName = "events";

class AwardType extends TypeCounter {
    constructor(resultObject) {
        super();

        this.name = resultObject.name;
        this.order = resultObject.order;

        this.addInstance(resultObject);
    }

    static willAccept(resultObject) {
        return true;
    }

    static updateDisplay() {
        declade(this.grid);

        this.records = this.records.sort((a, b) => a.order - b.order);

        // Display the counts
        for (const record of this.records) {
            createBlock(record.count,
                    record.name.replace(/ \(VRC\/VEXU\)/g, ""),
                    this.grid,
                    false,
                    record);
        }
    
        const nTotal = this.records.reduce((accumulator, {count}) => accumulator + count, 0);
        createBlock(nTotal,
                "Total",
                this.grid,
                true,
                this);
    }

    static async buildInstancesDisplay(instances, sublist) {
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const instanceDetailsContainer = sublist.children[i];

            // No await to let the other instances load concurrently
            (async () => {
                const event = await findEvent(instance.sku);
                const date = event ? new Date(event.start) : NaN;
    
                declade(instanceDetailsContainer).classList.remove("placeholder");
                
                createElement("instance-name", {
                    children: [
                        document.createTextNode(`${instance.name} at `),
                        createElement("a", {
                            properties: {
                                href: `https://robotevents.com/${instance.sku}.html`,
                                target: "_blank",
                            },
                            textContent: event ? event.name : instance.sku,
                        }),
                    ],
    
                    parent: instanceDetailsContainer,
                });
    
                createElement("div", {
                    children: [
                        document.createTextNode(" ("),
                        createElement("a", {
                            properties: {
                                href: `https://vexdb.io/events/view/${instance.sku}`,
                                target: "_blank",
                            },
                            textContent: "VexDB",
                        }),
                        document.createTextNode(")"),
                    ],
    
                    parent: instanceDetailsContainer,
                });
    
                createElement("div", {
                    textContent: event ? dateString(date) : "date unknown",
    
                    parent: instanceDetailsContainer,
                });
            })();
        }
    }

    equiv(resultObject) {
        return this.id === resultObject.name;
    }

    get id() {
        return this.name;
    }
}
AwardType.records = [];
AwardType.nLoadingFails = 0;
AwardType.grid = qs("block-grid[name='awards']");
AwardType.endpointName = "awards";

async function findEvent(sku) {
    for (const instance of EventScopeType.records.map(record => record.instances).flat()) {
        if (instance.sku === sku) {
            return instance;
        }
    }

    return (await vexdbGet("events", {sku})).result[0];
}

function dateString(date) {
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

const infoDivs = new Map(); // maps Counters to elements that display errors, loading, etc.

// Run a counter
async function count(Counter) {
    // Get the info div for this Counter, or create one if it does not exist
    let infoDiv = infoDivs.get(Counter);
    if (!infoDiv) {
        infoDiv = createElement("div");
        infoDivs.set(Counter, infoDiv);

        Counter.grid.parentElement.insertBefore(infoDiv, Counter.grid);
    }

    // Show a loading message while querying VexDB
    declade(infoDiv).appendChild(createNotice("loading"));
    
    let queryResponse;
    try {
        // Query VexDB
        queryResponse = (await vexdbGetForAllTeams(Counter.endpointName, {}, true)).flat();
    } catch (error) {
        // Show an error message if failed
        declade(infoDiv).appendChild(createNotice(`loading failed${getLoadingFailMessage(Counter.nLoadingFails)}`));

        // For VexDB error code 0 (internal server error), show an additional message
        if (error.error_code === 0) {
            infoDiv.appendChild(createElement("p", {
                textContent: "VexDB is currently unavailable. Try again later.",
            }));
        }

        // Add a retry button
        createElement("span", {
            textContent: "Retry",
            classes: ["button"],
            parent: infoDiv,
        }).addEventListener("click", () => {
            count(Counter);
        });

        // Increment number of loading fails for this counter
        Counter.nLoadingFails++;

        throw error;
    }

    // Remove the info div if successful
    infoDiv.remove();
    infoDivs.delete(Counter);

    // Iterate through the result objects
    for (const resultObject of queryResponse) {
        // Skip this result object if invalid
        if (!Counter.willAccept(resultObject)) continue;

        // Find an existing record that encompasses this result object
        let record = Counter.records.find(record => record.equiv(resultObject));

        // If not present, create a new record
        if (!record) {
            record = new Counter(resultObject);
            Counter.records.push(record);
        }

        // Add this record as an instance
        record.addInstance(resultObject);
        record.count++;
    }

    // Show the list of categories
    Counter.updateDisplay();
}

let nBlock = 0; // numerical id, used to match up each block with its <input>
// Create a box displaying a number with a label
function createBlock(number, label, parent, emphasize=false, Counter) {
    const classes = ["button", "item"];

    if (emphasize) {
        classes.push("em");
    }

    const id = `stat-viewer-control_${nBlock}`;

    const input = createElement("input", {
        properties: {
            name: "stat-viewer-control",
            type: "radio",
            id,
        },

        parent,
    });
    
    inputsToRecords.set(input, Counter);

    createElement("label", {
        attributes: [
            ["for", id],
        ],

        classes,

        children: [
            createElement("big-number", {
                textContent: number,
            }),
            createElement("h4", {
                textContent: label,
            }),
        ],

        parent,
    });

    nBlock++;
}

// Divide an instances array into arrays for each team
function countCategoryInstancesByTeam(instances) {
    const instancesByTeam = {};

    for (const instance of instances) {
        if (!instancesByTeam[instance.team]) {
            instancesByTeam[instance.team] = [];
        }

        instancesByTeam[instance.team].push(instance);
    }

    return instancesByTeam;
}

async function displayCategoryInstances(instances, Counter) {
    // Sort the instances into teams
    const instancesByTeam = countCategoryInstancesByTeam(instances);
    const instancesByTeamEntries = Object.entries(instancesByTeam).sort((a, b) => a[0].localeCompare(b[0]));

    declade(instanceDisplay);
    for (const [teamNumber, instances] of instancesByTeamEntries) {
        // Create a section for each team

        createElement("h3", {
            children: [
                createElement("a", {
                    properties: {
                        href: `../teams/${teamNumber}/`,
                    },

                    textContent: teamNumber,
                }),
            ],

            parent: instanceDisplay,
        });

        createElement("instance-subcounter", {
            textContent: instances.length,

            parent: instanceDisplay,
        });

        const sublist = createElement("instance-sublist", {
            parent: instanceDisplay,
        });

        // Since the number of instances to display is known, placeholder elements can be used to fill the space and avoid page jumping
        for (let i = 0; i < instances.length; i++) {
            createElement("instance-details", {
                children: [
                    createNotice("loading"),
                ],

                classes: ["placeholder"],

                parent: sublist,
            });
        }

        // This shouldn't block the function execution
        Counter.buildInstancesDisplay(instances, sublist);
    }
}

function instanceDisplayInit() {
    declade(instanceDisplay).appendChild(createNotice("Select a statistic to view its instances…"));
}

// init

const inputsToRecords = new WeakMap();
qs("form.stat-options").addEventListener("change", event => {
    const record = inputsToRecords.get(qs("input:checked", event.currentTarget));

    if (!record) {
        instanceDisplayInit();
    } else if (record instanceof TypeCounter) {
        const instances = record.instances;
        displayCategoryInstances(instances, record.constructor);
    } else {
        const instances = record.records.map(record => record.instances).flat();
        displayCategoryInstances(instances, record);
    }
});

instanceDisplayInit();

for (const Counter of [EventScopeType, AwardType]) {
    count(Counter);
}