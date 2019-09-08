const performance = require("perf_hooks").performance;
const start = performance.now();
const render = require("./render.new");
const prepare = require("./prepare");
const calculator = require("./calculator.extended");
const util = require("util");
const fs = require("fs");
// let result = fs.readFileSync("../results/1567874497451.33.json", "UTF-8");
// let result = fs.readFileSync("../results/1567875137817.36.json", "UTF-8");
let result = fs.readFileSync("../results/1567873165082.json", "UTF-8");
// result = result.replace(/\[object Object\]/g, 'null');

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
  "Anzahl möglicher Kombinationen mit maximaler Auslastung:",
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
    // console.log(index, theMaxAuslastung);
    theMaxBelegung.push(kinder);
  }
  // console.log(zusagen);

  // console.log(typeof kinder);
  // console.log(util.inspect(kinder, true, null, true));
  // render(kinder, true);
});
theMaxBelegung.forEach(kinder => {
  render(kinder, true);
});
console.log();
console.log(
  "Anzahl möglicher Kombinationen mit maximaler Auslastung:",
  theMaxBelegung.length
);
console.log("Berechnungsdauer:", getInSekunden() + " s");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else if (key.name === "n") {
    if (index < theMaxBelegung.length) {
      render(theMaxBelegung[index], true);
      outlineSelection(theMaxBelegung[index]);
      if (index + 1 < theMaxBelegung.length) {
        index++;
      } else {
        index = 0;
        console.log();
        console.log(
          "[ENDE ... Ergebnisse werden wieder von vorne aufgelistet!]"
        );
        console.log();
      }
    }
  }
});
console.log("Drücke n um Dir die Ergebnisse schrittweise anzeigen zu lassen.");
