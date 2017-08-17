enum Speed {
    Fast = "Fast",
    Slow = "Slow",
}

enum Land {
    Ocean = "Ocean",
    Jungle = "Jungle",
    Wetland = "Wetland",
    Mountain = "Mountain",
    Sand = "Sand",
    Coastal = "Coastal",
}

const LandAny = [Land.Ocean, Land.Jungle, Land.Wetland, Land.Mountain, Land.Sand];

enum TargetSpirit {
    Any = "Any Spirit",
    Another = "Another Spirit",
}

enum TargetProperty {
    Dahan = "Dahan",
    Invaders = "Invaders",
    Blight = "Blight",
    NoBlight = "No Blight",
    NoInvaders = "No Invaders",
}

type Target = Land | Land[] | TargetSpirit | TargetProperty;

enum Source {
    Site = "Site",
    SacredSite = "SacredSite",
}

class Ranges {
    constructor(public from: Source, public range: number | number[], public land?: (Land[] | undefined)) {
    }

    toString() {
        return " " + this.from + " " + this.range;
    }
}

enum Elements {
    Sun = "Sun",
    Moon = "Moon",
    Fire = "Fire",
    Air = "Air",
    Water = "Water",
    Earth = "Earth",
    Planet = "Planet",
    Animal = "Animal",
}

enum Spirit {
    ASpreadOfRampantGreen = "A Spread of Rampant Green",
    BringerOfDreamsAndNightmares = "Bringer of Dreams and Nightmares",
    LightngingsSwiftStrike = "Lightning's Swift Strike",
    OceansHungryGrasp = "Ocean's Hungry Grasp",
    RiverSurgesInSunlight = "River Surges in Sunlight",
    ShadowsFlickerLikeFlame = "Shadows Flicker Like Flame",
    Thunderspeaker = "Thunderspeaker",
    VitalStrengthOfTheEarth = "Vital Strength of the Earth",
}

enum CardType {
    Minor = "Minor",
    Major = "Major",
}

type PowerType = Spirit | CardType;

class Card {
    constructor(public type: PowerType, public name: string, public cost: number, public speed: Speed,
                public range: Ranges | null, public target: Target, public elements: Elements[],
                public description: string) {
    }

    toSearchString() {
        let s = this.type + " " + this.cost + " " + this.name + " " + this.speed;
        if (this.range != null) {
            s += " " + this.range.from + " " + this.range.range;
        }
        if (this.target == LandAny) {
            s += " Any";
        }
        s += " " + this.target + " " + this.elements + " " + this.description;
        return s;
    }

    toTableRow() {
        let row = document.createElement("tr");
        row.insertCell().innerText = this.type;
        row.insertCell().innerText = this.cost.toString();
        row.insertCell().innerText = this.name;
        row.insertCell().innerText = this.speed;
        let range = "";
        if (this.range != null) {
            range = this.range.from + " " + this.range.range;
        } else {
            range = "---";
        }
        row.insertCell().innerText = range;
        let target = "";
        if (this.target instanceof Array) {
            if (this.target == LandAny) {
                target= "Any";
            } else {
                target+= this.target.join(", ");
            }
        } else {
            target+= this.target;
        }
        row.insertCell().innerText = target;
        row.insertCell().innerText = this.elements.join(", ");
        row.insertCell().innerText = this.description;
        return row;
    }
}

const search = <HTMLInputElement> document.getElementById("search");
const result = <HTMLParagraphElement> document.getElementById("result");

function update() {
    let table = document.createElement("table");
    table.border = "1";
    let header = document.createElement("tr");
    let type = document.createElement("th");
    type.innerText = "Type";
    header.appendChild(type);
    let cost = document.createElement("th");
    cost.innerText = "Cost";
    header.appendChild(cost);
    let name = document.createElement("th");
    name.innerText = "Name";
    header.appendChild(name);
    let speed = document.createElement("th");
    speed.innerText = "Speed";
    header.appendChild(speed);
    let range = document.createElement("th");
    range.innerText = "Range";
    header.appendChild(range);
    let target = document.createElement("th");
    target.innerText = "Target";
    header.appendChild(target);
    let elements = document.createElement("th");
    elements.innerText = "Elements";
    header.appendChild(elements);
    let description = document.createElement("th");
    description.innerText = "Description";
    header.appendChild(description);
    table.appendChild(header);

    let searchstring = search.value.toLowerCase();
    let cards = CARDS;

    [cards, searchstring] = filter(cards, searchstring, "type");
    [cards, searchstring] = filter(cards, searchstring, "cost");
    [cards, searchstring] = filter(cards, searchstring, "name");
    [cards, searchstring] = filter(cards, searchstring, "speed");
    [cards, searchstring] = filter(cards, searchstring, "range");
    [cards, searchstring] = filter(cards, searchstring, "target");
    [cards, searchstring] = filter(cards, searchstring, "element");
    [cards, searchstring] = filter(cards, searchstring, "description");

    cards.filter(e => {
        let contains = true;
        for (const word of searchstring.split(" ")) {
            contains = contains && e.toSearchString().toLowerCase().indexOf(word) >= 0;
        }
        return contains;
    }).forEach(e => table.appendChild(e.toTableRow()));

    // clear old content
    if (result.firstChild) {
        result.removeChild(result.firstChild);
    }
    result.appendChild(table);
}

search.oninput = _ => update();

function getFilter(search: string, name: string): [string | null, string] {
    let idx = search.indexOf(name + ":");
    if (idx >= 0) {
        let start = idx + name.length + 1;
        let end;
        let rest_off;
        if (search[start] == '"') {
            start += 1;
             end = search.indexOf('"', start);
             rest_off = 2;
        } else {
            end = search.indexOf(' ', start);
            rest_off = 1;
        }
        if (end == -1) {
            end = search.length;
        }
        console.log("start: ", start);
        console.log("end: ", end);
        console.log("rest_off: ", rest_off);
        console.log("res: '" + search.substring(0, idx) + search.substring(end + rest_off, search.length) + "'");
        return [search.substring(start, end), search.substring(0, idx) + search.substring(end + rest_off, search.length)];
    }
    return [null, search];
}

function filter(cards: Card[], searchstring: string, property: string): [Card[], string] {
    let filter: string | null = "";
    let search: string = searchstring;
    while (filter != null) {
        [filter, search] = getFilter(search, property);
        if (filter) {
            console.log("filter: '" + filter + "'");
            cards = cards.filter(c => {
                if ((c as any)[property] != null) {
                }
                return (c as any)[property] != null && (c as any)[property].toString().toLowerCase().indexOf(filter) >= 0;
            });
        }
    }
    return [cards, search];
}

const CARDS = [
    // Spirit Cards
    new Card(Spirit.LightngingsSwiftStrike, "Shatter Homesteads", 2, Speed.Slow, new Ranges(Source.SacredSite, 2), LandAny,
        [Elements.Fire, Elements.Air], "1 Fear. Destroy 1 Village."),
    new Card(Spirit.LightngingsSwiftStrike, "Raging Storm", 3, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air, Elements.Water], "1 Damage to each Invader."),
    new Card(Spirit.LightngingsSwiftStrike, "Lighning's Boon", 1, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Fire, Elements.Air], "Target Spirit may use up to 2 Slow Powers as if they were Fast Powers this turn"),
    new Card(Spirit.LightngingsSwiftStrike, "Harbingers of the Lightning", 0, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air], "Push up to 2 Dahan. 1 Fear if you pushed any Dahan into a land with Town / City"),
    new Card(Spirit.RiverSurgesInSunlight, "Flash Floods", 2, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Water], "1 Damage. If target land is Coastal, +1 Damage."),
    new Card(Spirit.RiverSurgesInSunlight, "Wash Away", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Water, Elements.Earth], "Push up to 3 Explorers / Towns"),
    new Card(Spirit.RiverSurgesInSunlight, "Boon of Vigor", 0, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Water, Elements.Planet], "If you target yourself, gain 1 Energy. If you target another Spirit, they gain 1 Energy per Power Card they played this turn."),
    new Card(Spirit.RiverSurgesInSunlight, "River's Bounty", 0, Speed.Slow, new Ranges(Source.Site, 0), LandAny,
        [Elements.Sun, Elements.Water, Elements.Animal], "Gather up to 2 Dahan. If there are now at least 2 Dahan, add 1 Dahan and gain 1 Energy."),
    new Card(Spirit.ShadowsFlickerLikeFlame, "Concealing Shadows", 0, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Air], "1 Fear. Dahan take no damage from Ravaging Invaders this turn."),
    new Card(Spirit.ShadowsFlickerLikeFlame, "Favors Called Due", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Moon, Elements.Air, Elements.Animal], "Gather up to 4 Dahan. If Invaders are present and Dahan now outnumber them, 3 Fear."),
    new Card(Spirit.ShadowsFlickerLikeFlame, "Mantle of Dread", 1, Speed.Slow, null, TargetSpirit.Any,
        [Elements.Moon, Elements.Fire, Elements.Air], "2 Fear. Target Spirit may Push 1 Explorer and 1 Town from one of their lands."),
    new Card(Spirit.ShadowsFlickerLikeFlame, "Crops Wither and Fade", 1, Speed.Slow, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Fire, Elements.Planet], "2 Fear. Replace 1 Town with 1 Explorer. *or* Replace 1 City with 1 Town."),
    new Card(Spirit.VitalStrengthOfTheEarth, "Guard the Healing Land", 3, Speed.Fast, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Water, Elements.Earth, Elements.Planet], "Remove 1 Blight. Defend 4."),
    new Card(Spirit.VitalStrengthOfTheEarth, "A Year of Perfect Stillness", 3, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Earth], "Invaders skipp all Actions in target land this turn."),
    new Card(Spirit.VitalStrengthOfTheEarth, "Rituals of Destruction", 3, Speed.Slow, new Ranges(Source.SacredSite, 1), TargetProperty.Dahan,
        [Elements.Sun, Elements.Moon, Elements.Fire, Elements.Earth, Elements.Planet], "2 Damage. If target land has at least 3 Dahan, +3 Damage and 2 Fear."),
    new Card(Spirit.VitalStrengthOfTheEarth, "Draw of the Fruitful Earth", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Earth, Elements.Planet, Elements.Animal], "Gather up to 2 Explorer. Gather up to 2 Dahan."),
    new Card(Spirit.Thunderspeaker, "Manifestation of Power and Glory", 3, Speed.Slow, new Ranges(Source.Site, 0), TargetProperty.Dahan,
        [Elements.Sun, Elements.Fire, Elements.Air], "1 Fear. Each Dahan deals damage equal to the number of your Site in target land."),
    new Card(Spirit.Thunderspeaker, "Words of Warning", 1, Speed.Fast, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Sun, Elements.Air, Elements.Animal], "Defend 3. During Ravage, Dahan in target land deal damage simultaneously with Invaders."),
    new Card(Spirit.Thunderspeaker, "Sudden Ambush", 2, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air, Elements.Animal], "You may Gather 1 Dahan. Each Dahan destroys 1 Explorer."),
    new Card(Spirit.Thunderspeaker, "Voice of Thunder", 0, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Air], "Push up to 4 Dahan. *or* If Invaders are Present, 2 Fear."),
    new Card(Spirit.OceansHungryGrasp, "Call of the Deeps", 0, Speed.Fast, new Ranges(Source.Site, 0), Land.Coastal,
        [Elements.Moon, Elements.Air, Elements.Water], "Gather 1 Explorer. If target land is the Ocean, you may Gather another Explorer."),
    new Card(Spirit.OceansHungryGrasp, "Grasping Tide", 1, Speed.Fast, new Ranges(Source.Site, 1), Land.Coastal,
        [Elements.Moon, Elements.Water], "2 Fear. Defend 4."),
    new Card(Spirit.OceansHungryGrasp, "Swallow the Land-Dwellers", 0, Speed.Slow, new Ranges(Source.Site, 0), Land.Coastal,
        [Elements.Water, Elements.Earth], "Drown 1 Explorer, 1 Town, and 1 Dahan."),
    new Card(Spirit.OceansHungryGrasp, "Tidal Boon", 1, Speed.Slow, null, TargetSpirit.Another,
        [Elements.Moon, Elements.Water, Elements.Earth], "Target Spirit gains 2 Energy and may Push 1 Town and up to 2 Dahan from one of their lands. If Dahan are pushed to your ocean, you may move them to any Coastal land instead of Drowning them."),
    new Card(Spirit.BringerOfDreamsAndNightmares, "Predatory Nightmares", 2, Speed.Slow, new Ranges(Source.SacredSite, 1), TargetProperty.Invaders,
        [Elements.Moon, Elements.Fire, Elements.Earth, Elements.Animal], "2 Damage. Push up to 2 Dahan. (When your powers would destroy Invaders, instead they generate Fear and/or Push those Invaders.)"),
    new Card(Spirit.BringerOfDreamsAndNightmares, "Dread Apparitions", 2, Speed.Fast, new Ranges(Source.Site, 1), TargetProperty.Invaders,
        [Elements.Moon, Elements.Air], "When Powers generate Fear in target land, Defend 1 per Fear. 1 Fear. (Fear from To Dream a Thousand Death counts. Fear from Destroying Town / City does not."),
    new Card(Spirit.BringerOfDreamsAndNightmares, "Call on Midnight's Dreams", 0, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Animal], "If target land has Dahan, gain a Major Power. If you Forget this Power, gain Energy equal to Dahan and you may play the Major Power immediately, paying its cost. *or* If Invaders are present, 2 Fear."),
    new Card(Spirit.BringerOfDreamsAndNightmares, "Dreams of the Dahan", 0, Speed.Fast, new Ranges(Source.Site, 2), LandAny,
        [Elements.Moon, Elements.Air], "Gather up to 2 Dahan. *or* If target land has Town / City, 1 Fear for each Dahan, to a maximum of 3 Fear."),
    new Card(Spirit.ASpreadOfRampantGreen, "Overgrow in a Night", 2, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Moon, Elements.Planet], "Add 1 Site. *or* If target land has your Site and Invaders, 3 Fear."),
    new Card(Spirit.ASpreadOfRampantGreen, "Gift of Proliferation", 1, Speed.Fast, null, TargetSpirit.Another,
        [Elements.Moon, Elements.Planet], "Target Spirit adds 1 Site up to 1 Range from their Site."),
    new Card(Spirit.ASpreadOfRampantGreen, "Fields Choked with Growth", 0, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Water, Elements.Planet], "Push 1 Town. *or* Push 3 Dahan"),
    new Card(Spirit.ASpreadOfRampantGreen, "Stem the Flow of Fresh Water", 0, Speed.Slow, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Water, Elements.Planet], "1 Damage to 1 Town or 1 City. If target land is M/S, instead, 1 Damage to each Town / City."),

    // Colored Corners
    // green corner
    new Card(CardType.Minor, "Savage Mawbeasts", 0, Speed.Slow, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Fire, Elements.Animal], "If target land is J/W, 1 Fear and 1 Damage. *If you have* 3 Animal: 1 Damage."),
    new Card(CardType.Minor, "Voracious Growth", 1, Speed.Slow, new Ranges(Source.SacredSite, 1), [Land.Jungle, Land.Wetland],
        [Elements.Water, Elements.Planet], "2 Damage. *or* Remove 1 Blight."),
    new Card(CardType.Minor, "Rouse the Trees and Stones", 1, Speed.Slow, new Ranges(Source.SacredSite, 1), TargetProperty.NoBlight,
        [Elements.Fire, Elements.Earth, Elements.Planet], "2 Damage. Push 1 Explorer."),
    // blue corner
    new Card(CardType.Minor, "Encompassing Ward", 1, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Water, Elements.Earth], "Defend 2 in every land where target Spirit has Site."),
    new Card(CardType.Minor, "Song of Sanctity", 1, Speed.Slow, new Ranges(Source.Site, 1), [Land.Mountain, Land.Jungle],
        [Elements.Sun, Elements.Water, Elements.Planet], "If target land has 1 Explorer, Push all Explorer. Otherwise, remove 1 Blight."),
    new Card(CardType.Minor, "Uncanny Melting", 1, Speed.Slow, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Sun, Elements.Moon, Elements.Water], "If Invaders are present, 1 Fear. If target land is S/W, remove 1 Blight"),
    // red corner
    new Card(CardType.Minor, "Shadows of the Burning Forest", 0, Speed.Slow, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Fire, Elements.Planet], "If Invaders are present, 2 Fear. If target land is M/J, Push 1 Explorer and 1 Town."),

    // Minors inside color cornered block
    new Card(CardType.Minor, "Steam Vents", 1, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Fire, Elements.Air, Elements.Water, Elements.Earth], "Destroy 1 Explorer. *If you have* 3 Earth: You may instead destroy 1 Town."),
    new Card(CardType.Minor, "Veil the Night's Hunt", 1, Speed.Fast, new Ranges(Source.Site, 2), TargetProperty.Dahan,
        [Elements.Moon, Elements.Air, Elements.Animal], "Each Dahan deals 1 Damage to a different Invader. *or* Push up to 3 Dahan."),
    new Card(CardType.Minor, "Elemental Boon", 1, Speed.Fast, null, TargetSpirit.Any,
        [], "Target Spirit gains 3 different Elements of their choice. If you target another Spirit, you also gain the chosen Elements."),

    // Second Badge
    // Minors
    new Card(CardType.Minor, "Devouring Ants", 1, Speed.Slow, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Sun, Elements.Earth, Elements.Animal], "1 Fear. 1 Damage. Destroy 1 Dahan. If target land is J/S, +1 Damage."),
    new Card(CardType.Minor, "Dark and Tangled Woods", 1, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Moon, Elements.Earth, Elements.Planet], "2 Fear. If target and is M/J, Defend 3."),
    new Card(CardType.Minor, "Sap the Strength of Multitudes", 0, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Water, Elements.Animal], "Defend 5. *If you have* 1 Air: Increase this Power's Range by 1"),
    new Card(CardType.Minor, "Drift down into Slumber", 0, Speed.Fast, new Ranges(Source.Site, 2), LandAny,
        [Elements.Air, Elements.Earth, Elements.Planet], "Defend 1. If target land is J/S, instead, Defend 4."),
    new Card(CardType.Minor, "Land of Haunts and Embers", 0, Speed.Fast, new Ranges(Source.Site, 2), LandAny,
        [Elements.Moon, Elements.Fire, Elements.Air], "2 Fear. Push up to 2 Explorer / Town. If target land has Blight, +2 Fear. Push up to 2 more Explorer / Town. Add 1 Blight."),
    new Card(CardType.Minor, "Nature's Resilience", 1, Speed.Fast, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Earth, Elements.Planet, Elements.Animal], "Defend 6. *If you have* 2 Water: You may instead remove 1 Blight."),
    new Card(CardType.Minor, "Visions of Fiery Doom", 1, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Fire], "1 Fear. Push 1 Explorer / Town. *If you have* 2 Fire: +1 Fear."),
    new Card(CardType.Minor, "Pull Beneath the Hungry Earth", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Moon, Elements.Water, Elements.Earth], "If target land has your Site, 1 Fear and 1 Damage. If target land is S/W, 1 Damage."),
    new Card(CardType.Minor, "Call of the Dahan Ways", 1, Speed.Slow, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Moon, Elements.Water, Elements.Animal], "Replace 1 Explorer with 1 Dahan. *If you have* 2 Moon: You may instead replace 1 Town with 1 Dahan."),
    new Card(CardType.Minor, "Call to Bloodshed", 1, Speed.Slow, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Sun, Elements.Fire, Elements.Animal], "1 Damager per Dahan. *or* Gather up to 3 Dahan."),
    new Card(CardType.Minor, "Call to Isolation", 0, Speed.Fast, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Sun, Elements.Air, Elements.Animal], "Push 1 Explorer / Town per Dahan. *or* Push 1 Dahan."),
    new Card(CardType.Minor, "Call to Migrate", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air, Elements.Animal], "Gather up to 3 Dahan. Push up to 3 Dahan."),
    new Card(CardType.Minor, "Call to Tend", 1, Speed.Slow, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Water, Elements.Planet, Elements.Animal], "Remove 10Blight. *or* Push up to 3 Dahan."),
    new Card(CardType.Minor, "Quicken the Earth's Struggles", 1, Speed.Fast, new Ranges(Source.SacredSite, 0), LandAny,
        [Elements.Moon, Elements.Fire, Elements.Earth, Elements.Animal], "1 Damage to each Town / City. *or* Defend 10."),
    new Card(CardType.Minor, "Delusions of Danger", 1, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Moon, Elements.Air], "Push 1 Explorer. *or* 2 Fear."),
    new Card(CardType.Minor, "Drought", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Fire, Elements.Earth], "Destroy 3 Town. 1 Damage to each Town / City. Add 1 Blight. *If you have* 3 Sun: Destroy 1 City."),
    new Card(CardType.Minor, "Gift of Constancy", 0, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Earth], "Target Spirit gains 2 Energy. At end of turn, target Spirit may Reclaim 1 Power Card instead of discarding it. If you target another Spirit, you mal also Reclaim 1 Power Card instead of discarding it."),
    new Card(CardType.Minor, "Enticing Splendor", 0, Speed.Fast, new Ranges(Source.Site, 0), TargetProperty.NoBlight,
        [Elements.Sun, Elements.Air, Elements.Planet], "Gather 1 Explorer / Town. *or* Gather up to 2 Dahan."),
    new Card(CardType.Minor, "Entrancing Apparitions", 1, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Moon, Elements.Air, Elements.Water], "Defend 2. If no Invaders are present, gather up to 2 Explorer."),
    new Card(CardType.Minor, "Gift of Living Energy", 0, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Fire, Elements.Planet], "Target Spirit gains 1 Energy, +1 Energy if target Spirit is not yourself. If you have at least 2 SacredSite, target Spirit gains +1 Energy."),
    new Card(CardType.Minor, "Gift of Power", 0, Speed.Slow, null, TargetSpirit.Any,
        [Elements.Moon, Elements.Water, Elements.Earth, Elements.Planet], "Target Spirit gains a Minor Power."),
    new Card(CardType.Minor, "Gnawing Rootbiters", 0, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Earth, Elements.Animal], "Push up to 2 Town."),
    new Card(CardType.Minor, "Lure of the Unknown", 0, Speed.Fast, new Ranges(Source.Site, 2), TargetProperty.NoInvaders,
        [Elements.Moon, Elements.Fire, Elements.Air, Elements.Planet], "Gather 1 Explorer / Town"),
    new Card(CardType.Minor, "Purifying Flame", 1, Speed.Slow, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Sun, Elements.Fire, Elements.Air, Elements.Planet], "1 Damage per Blight. If target land is M/S, you may instead remove 1 Blight."),
    new Card(CardType.Minor, "Rain of Blood", 0, Speed.Slow, new Ranges(Source.SacredSite, 1), TargetProperty.Invaders,
        [Elements.Air, Elements.Water, Elements.Animal], "2 Fear. If target land has at least 2 Town / City, +1 Fear."),
    new Card(CardType.Minor, "Reaching Grasp", 0, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Air, Elements.Water], "Target Spirit gets +2 Range with all their Powers."),
    // Majors
    new Card(CardType.Major, "Accelerated Rot", 4, Speed.Slow, new Ranges(Source.Site, 2), [Land.Jungle, Land.Wetland],
        [Elements.Sun, Elements.Water, Elements.Planet], "2 Fear. 4 Damage. *If you have* 3 Sun, 2 Water, 3 Planet: +5 Damage. Remove 1 Blight."),
    new Card(CardType.Major, "Cleansing Floods", 5, Speed.Slow, new Ranges(Source.Site, 1, [Land.Wetland]), LandAny,
        [Elements.Sun, Elements.Water], "4 Damage. Remove 1 Blight. *If you have* 4 Water: +10 Damage."),
    new Card(CardType.Major, "Pillar of Living Flame", 5, Speed.Slow, new Ranges(Source.SacredSite, 2), LandAny,
        [Elements.Fire], "3 Fear. 5 Damage. If target land is J/W, add 1 Blight. *If you have* 40Fire: +2 Fear and +5 Damage."),
    new Card(CardType.Major, "Poisoned Land", 3, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Earth, Elements.Planet, Elements.Animal], "1 Fear. 7 Damage. Add 1 Blight and destroy all Dahan. *If you have* 3 Earth, 2 Planet, 2 Fire: Per Blight, +1 Fear and +4 Damage."),
    new Card(CardType.Major, "Terrifying Nightmares", 4, Speed.Fast, new Ranges(Source.Site, 2), LandAny,
        [Elements.Moon, Elements.Air], "2 Fear. Push up to 4 Explorer / Town. *If you have* 4 Moon: +4 Fear."),
    new Card(CardType.Major, "The Trees and Stones Speak of War", 2, Speed.Fast, new Ranges(Source.Site, 1), TargetProperty.Dahan,
        [Elements.Sun, Elements.Earth, Elements.Planet], "1 Damage and Defend 2 per Dahan in target land. *If you have* 2 Sun, 2 Earth, 2 Planet: You may Push up to 2 Dahan, moving the Defend effect with them"),
    new Card(CardType.Major, "Entwined Power", 2, Speed.Fast, null, TargetSpirit.Another,
        [Elements.Moon, Elements.Water, Elements.Planet], "You and target Spirit may use each other's Site to target Powers. Target Spirit gains a Power Card. You take one of the power Cards they did not keep. *If you have* 2 Water, 4 Planet: You and target Spirit each gain 3 Energy and may gift each other 10Power from hand."),
    new Card(CardType.Major, "Paralyzing Frigh", 4, Speed.Fast, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Air, Elements.Earth], "4 Fear. Invaders skip all Actions in target land this turn. *If you have* 2 Air, 3 Earth: +4 Fear."),
    new Card(CardType.Major, "Powerstorm", 3, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Fire, Elements.Air], "Target Spirit gains 3 Energy. Once this turn, target may Repeat a Power Card by paying its cost again. *If you have* 2 Sun, 2 Fire, 3 Air: Target may repeat up to 3 total Power Cards by paying their costs."),
    new Card(CardType.Major, "Talons of Lightning", 6, Speed.Fast, new Ranges(Source.Site, 1), [Land.Mountain, Land.Wetland],
        [Elements.Fire, Elements.Air], "3 Fear. 5 Damage. *If you have* 3 Fire, 3 Air: Destroy 1 Town in each adjacent land. Increase this power's Range to 3 Range."),
    new Card(CardType.Major, "The Jungle Hungers", 3, Speed.Slow, new Ranges(Source.Site, 1, [Land.Jungle]), LandAny,
        [Elements.Moon, Elements.Planet], "Destroy all Explorer and all Town. Destroy all Dahan. *If you have* 2 Moon, 3 Planet: Destroy 1 City. Do not destroy any Dahan."),
    new Card(CardType.Major, "The land Thrashes in Furious Pain", 4, Speed.Slow, new Ranges(Source.Site, 2), TargetProperty.Blight,
        [Elements.Moon, Elements.Fire, Elements.Earth], "2 Damage per Blight in target land. +1 Damage per Blight in adjacent lands. *If you have* 3 Moon, 3 Earth: Repeat on an adjacent land."),
    new Card(CardType.Major, "Tsunami", 6, Speed.Slow, new Ranges(Source.SacredSite, 2), Land.Coastal,
        [Elements.Water, Elements.Earth], "2 Fear. 8 Damage. Destroy 2 Dahan. *If you have* 3 Water, 2 Earth: +1 Fear, 4 Damage and Destroy 1 Dahan in each other Coastal land on the same board."),
    new Card(CardType.Major, "Vigor of the Breaking Dawn", 3, Speed.Fast, new Ranges(Source.Site, 2), TargetProperty.Dahan,
        [Elements.Sun, Elements.Animal], "2 Damage per Dahan in target land. *If you have* 3 Sun, 2 Animal: You may Push up to 2 Dahan. In lands you Pushed Dahan to, 2 Damage per Dahan."),
    new Card(CardType.Major, "Vengeance of the Dead", 3, Speed.Fast, new Ranges(Source.Site, 3), LandAny,
        [Elements.Moon, Elements.Fire, Elements.Animal], "3 Fear. During the rest of this turn, 1 Damage in target land for each Town / City / Dahan destroyed there. *If you have* 3 Animal: Damage from this Power may be dealt into adjacent lands."),
    new Card(CardType.Major, "Wrap in Wings of Sunlight", 3, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Sun, Elements.Air, Elements.Animal], "Move up to 5 Dahan from target land to any land. Defend 5 in that land. *If you have* 2 Sun, 2 Air, 2 Animal: First, Gather up to 3 Dahan."),
    new Card(CardType.Major, "Blazing Renewal", 5, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Fire, Elements.Earth, Elements.Planet], "Target Spirit places 2 of their destroyed Site into a single land, up to 2 Range from your Site. If any Site was returned, 2 damage to each Town / City in that land. *If you have* 3 Fire, 3 Earth, 2 Planet: 4 Damage."),
    new Card(CardType.Major, "Winds of Rust and Atrophy", 3, Speed.Fast, new Ranges(Source.SacredSite, 3), LandAny,
        [Elements.Air, Elements.Water, Elements.Animal], "1 Fear and Defend 6. Replace 1 City with 1 Town or 1 Town with 1 Explorer. *If you have* 3 Air, 3 Water, 2 Animal: Repeat this Power."),
    new Card(CardType.Major, "Indomitable Claim", 4, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Earth], "Add 1 Site in target land even if you normally could not due to land type. Defend 20. *If you have* 2 Sun, 3 Earth: 3 Fear if Invaders are present. Invaders skip all Actions in target land this turn."),
    new Card(CardType.Major, "Mists of Oblivion", 4, Speed.Slow, new Ranges(Source.Site, 3), LandAny,
        [Elements.Moon, Elements.Air, Elements.Water], "1 Damage to each Invader in target land. 1 Fear per Town / City destroyed by this Power, to a maximum of 4. *If you have* 2 Moon, 3 Air, 2 Water: +3 Damage."),
    new Card(CardType.Major, "Infinite Vitality", 3, Speed.Fast, new Ranges(Source.SacredSite, 1), LandAny,
        [Elements.Earth, Elements.Planet, Elements.Animal], "Dahan have +40Health while in target land. Whenever Blight would be added to target land, instead leave it on the card. *If you have* 4 Earth: Dahan ignore Damage and Destruction effects. Remove 1 Blight from target or adjacent land."),
    new Card(CardType.Major, "Dissolve the bonds", 4, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Water, Elements.Animal], "Replace 1 City with 2 Explorer. Replace 1 Town with 1 Explorer. Replace 1 Dahan with 1 Explorer. Push all Explorer from target land to as many different lands as possible. *If you have* 2 Fire, 2 Water, 3 Animal: Before Pushing, Explorer and Town / City do Damage to each other."),
];

update();
