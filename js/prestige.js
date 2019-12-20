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

    static async buildInstancesDisplay(instances) {
        instances = instances.sort((a, b) => new Date(b.start) - new Date(a.start));
        for (const instance of instances) {
            const date = new Date(instance.start);

            instanceDisplay.appendChild(createElement("instance-details", {
                children: [
                    createElement("div", {
                        children: [
                            createElement("a", {
                                properties: {
                                    href: `https://robotevents.com/${instance.sku}.html`,
                                    target: "_blank",
                                },
                                textContent: trimEventName(instance.name, 50),
                            }),
                        ],
                    }),

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
                    }),

                    createElement("div", {
                        textContent: dateString(date),
                    }),
                ],
            }));
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

    static async buildInstancesDisplay(instances) {
        for (const instance of instances) {
            const event = await findEvent(instance.sku);

            const date = event ? new Date(event.start) : NaN;
            
            instanceDisplay.appendChild(createElement("instance-details", {
                children: [
                    createElement("div", {
                        children: [
                            document.createTextNode(`${instance.name} at `),
                            createElement("a", {
                                properties: {
                                    href: `https://robotevents.com/${instance.sku}.html`,
                                    target: "_blank",
                                },
                                textContent: trimEventName(event ? event.name : instance.sku, 30),
                            }),
                        ],
                    }),

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
                    }),

                    createElement("div", {
                        textContent: event ? dateString(date) : "date unknown",
                    }),
                ],
            }));
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
AwardType.grid = qs("block-grid[name='awards']");
AwardType.endpointName = "awards";

function trimEventName(name, maxNameLength=40) {
    name = name.trim();
    if (name.length > maxNameLength) {
        return name.substring(0, maxNameLength) + "…";
    }
    return name;
}

async function findEvent(sku) {
    for (const instance of EventScopeType.records.map(record => record.instances).flat()) {
        if (instance.sku === sku) {
            return instance;
        }
    }

    return (await vexdbGet("events", {sku})).result[0];
}

function dateString(date) {
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${(date.getUTCDay() + 1).toString().padStart(2, "0")}`;
}

// Run a counter
async function count(Counter) {
    let queryResponse;
    
    try {
        // Query VexDB
        queryResponse = (await vexdbGetForAllTeams(Counter.endpointName, {}, true)).flat();
    } catch (error) {
        // Show an error message if failed
        declade(Counter.grid).appendChild(createNotice("loading failed"));
        throw error;
    }

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

    Counter.updateDisplay();
}

let nBlock = 0;
// Create a box displaying a number with a label
function createBlock(number, label, parent, emphasize=false, counter) {
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
    
    inputsToRecords.set(input, counter);

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
    const instancesByTeam = countCategoryInstancesByTeam(instances);
    
    const entries = Object.entries(instancesByTeam).sort((a, b) => a[0].localeCompare(b[0]));

    declade(instanceDisplay);

    for (const [teamNumber, instances] of entries) {
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

        await Counter.buildInstancesDisplay(instances);
    }
}

// init

const inputsToRecords = new WeakMap();

qs("form.stat-options").addEventListener("change", event => {
    const record = inputsToRecords.get(qs("input:checked", event.currentTarget));

    if (record instanceof TypeCounter) {
        const instances = record.instances;
        displayCategoryInstances(instances, record.constructor);
    } else {
        const instances = record.records.map(record => record.instances).flat();
        displayCategoryInstances(instances, record);
    }
});

for (const Counter of [EventScopeType, AwardType]) {
    count(Counter);
}