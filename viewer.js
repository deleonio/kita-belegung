const performance = require("perf_hooks").performance;
const start = performance.now();
const render = require("./render.new");
const prepare = require("./prepare");
const util = require("util");
const moment = require("moment");
const fs = require("fs");
// let result = fs.readFileSync("../results/1567874497451.33.json", "UTF-8");
// let result = fs.readFileSync("../results/1567875137817.36.json", "UTF-8");
// let result = fs.readFileSync("../results/1568858624243.-.json", "UTF-8");
let result = fs.readFileSync("../results/1568943707885.final.json", "UTF-8");

const readline = require("readline");
let index = 0;

result = JSON.parse(result);
let maxAuslastung = 0;
for (let auslastung in result) {
  if (result.hasOwnProperty(auslastung)) {
    if (maxAuslastung < auslastung) {
      maxAuslastung = auslastung;
    }
  }
}

function getInSekunden() {
  return (performance.now() - start) / 1000;
}

function getInMinuten() {
  return getInSekunden() / 60;
}

function outlineSelection(kinder) {
  outline = "";
  counter = 0;
  kinder.forEach(kind => {
    if (kind.zusage === true || kind.willZusage === true) {
      outline += "#";
      counter++;
    } else {
      outline += "-";
    }
  });
  console.log(outline + " | " + counter);
}

function summieren(zusagen) {
  let summe = 0;
  for (let jahr in zusagen) {
    if (zusagen.hasOwnProperty(jahr)) {
      for (let monat in zusagen[jahr]) {
        if (zusagen[jahr].hasOwnProperty(monat)) {
          summe += zusagen[jahr][monat];
        }
      }
    }
  }
  return summe;
}

console.log(
  "Anzahl möglicher Kombinationen mit maximaler Auslastung (nicht optimiert):",
  result[maxAuslastung].length
);
let theMaxAuslastung = 0;
let theMaxBelegung = [];
result[maxAuslastung].forEach((kinder, index) => {
  kinder = JSON.parse(kinder);
  kinder = prepare(kinder);

  let zusagen = render(kinder, false);
  let auslastung = summieren(zusagen);
  if (theMaxAuslastung <= auslastung) {
    if (theMaxAuslastung < auslastung) {
      theMaxBelegung = [];
    }
    theMaxAuslastung = auslastung;
    theMaxBelegung.push(kinder);
  }
});

for (let i = 1; i < theMaxBelegung.length; i++) {
  theMaxBelegung[i].forEach((kind, index) => {
    if (theMaxBelegung[0][index].willZusage !== kind.willZusage) {
      theMaxBelegung[0][index].toggleZusage = true;
    }
  });
}

const finalBelegung = {};
finalBelegung[theMaxAuslastung] = [JSON.stringify(theMaxBelegung[0])];

// fs.writeFileSync(
//   `../results/${moment.now()}.final.json`,
//   JSON.stringify(finalBelegung)
// );

function renderErgebnis() {
  if (index < theMaxBelegung.length) {
    render(theMaxBelegung[index], true);
    console.log(
      "Drücke n um Dir die alternativen Ergebnisse schrittweise anzeigen zu lassen."
    );
    if (index + 1 < theMaxBelegung.length) {
      index++;
    } else {
      index = 0;
      console.log();
      console.log("[ENDE ... Ergebnisse werden wieder von vorne aufgelistet!]");
    }
  }
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else if (key.name === "n") {
    renderErgebnis();
  }
});

console.log("Berechnungsdauer:", getInSekunden() + " s");
console.log(
  "Anzahl möglicher Kombinationen mit maximaler Auslastung (optimiert):",
  theMaxBelegung.length
);
renderErgebnis();
