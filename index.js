const performance = require("perf_hooks").performance;
const start = performance.now();
const KINDER = require("./kinder.json");
const KINDER_MIT_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage === true;
});
const KINDER_OHNE_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage !== true;
});
// KINDER_OHNE_ZUSAGE.splice(14);
const AUSLASTUNG_BEI_ZUSAGE = [];

const calculator = require("./calculator");
const render = require("./render.new");
const moment = require("moment");
const fs = require("fs");
const chalk = require("chalk");

process.on("exit", () => {
  console.log(`${numberFormat.format(performance.now() - start)} ms`);
  resultKeys.sort().reverse();
  fs.writeFileSync(`../results/${moment.now()}-30.json`, resultValues);
  console.log(resultKeys[0]);
  resultValues[resultKeys[0]].forEach(result => {
    let kinder = JSON.parse(result);
    prepareMoment(kinder);
    render(kinder);
  });
});

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

function prepareMoment(kinder) {
  kinder.forEach(kind => {
    let kitaaufnahme = moment(kind.geburtsdatum, "DD-MM-YYYY").add(3, "years");
    if (kitaaufnahme.month() > 6) {
      kitaaufnahme.add(1, "year");
    }
    // kind.kitaaufnahme = moment(kind.geburtsdatum, "DD-MM-YYYY").add(30, "month");
    kind.kitaaufnahme = moment(`01.08.${kitaaufnahme.year()}`, "DD-MM-YYYY");
    let einschulung = moment(kind.geburtsdatum, "DD-MM-YYYY").add(6, "years");
    if (einschulung.month() > 6) {
      einschulung.add(1, "year");
    }
    kind.einschulung = moment(`01.08.${einschulung.year()}`, "DD-MM-YYYY");
  });
}
prepareMoment(KINDER);

let maxAuslastung = 0;
let resultKeys = [];
let resultValues = {};
function resultCollector(kinder, auslastung) {
  const gesamtAuslastung = summieren(auslastung);
  if (maxAuslastung <= gesamtAuslastung) {
    maxAuslastung = gesamtAuslastung;
    if (resultKeys.indexOf(gesamtAuslastung) === -1) {
      resultKeys.push(gesamtAuslastung);
    }
    resultValues[gesamtAuslastung] = resultValues[gesamtAuslastung] || [];
    resultValues[gesamtAuslastung].push(JSON.stringify(kinder));
    outlineSelection(KINDER_OHNE_ZUSAGE, gesamtAuslastung);
  }
}

function outlineSelection(kinder, auslastung) {
  outline = "";
  kinder.forEach(kind => {
    if (kind.willZusage) {
      outline += "#";
    } else {
      outline += "-";
    }
  });
  console.log(outline + " | " + auslastung);
}

function testConstelation(basisAuslastung, kinderWillZusage) {
  testAuslastung = JSON.parse(JSON.stringify(basisAuslastung));
  for (let jahr in testAuslastung) {
    if (testAuslastung.hasOwnProperty(jahr)) {
      for (let monat in testAuslastung[jahr]) {
        if (testAuslastung[jahr].hasOwnProperty(monat)) {
          kinderWillZusage.forEach(kind => {
            if (kind.zusage === true || kind.willZusage === true) {
              testAuslastung[jahr][monat] += kind.auslastung[jahr][monat];
              if (testAuslastung[jahr][monat] > 29) {
                throw new Error("FAULT");
              }
            }
          });
        }
      }
    }
  }
  return testAuslastung;
}

function challengeKinder(index) {
  if (index + 1 < KINDER_OHNE_ZUSAGE.length) {
    challengeKinder(index + 1);
  } else {
    try {
      resultCollector(
        KINDER,
        testConstelation(BASIS_AUSLASTUNG, KINDER_OHNE_ZUSAGE)
      );
    } catch (e) {
      // render(KINDER);
      // throw e;
    }
  }
  KINDER_OHNE_ZUSAGE[index].willZusage = true;
  if (index + 1 < KINDER_OHNE_ZUSAGE.length) {
    challengeKinder(index + 1);
  } else {
    try {
      resultCollector(
        KINDER,
        testConstelation(BASIS_AUSLASTUNG, KINDER_OHNE_ZUSAGE)
      );
    } catch (e) {
      // render(KINDER);
      // throw e;
    }
  }
  KINDER_OHNE_ZUSAGE[index].willZusage = false;
}

// let zusagen = calculator(KINDER);
// resultCollector(calculator(KINDER));

// for (let i = 0; i < KINDER_OHNE_ZUSAGE.length; i++) {
//   resultCollector(calculator(KINDER));
//   outlineSelection(KINDER_OHNE_ZUSAGE);
//   for (let j = i; j < KINDER_OHNE_ZUSAGE.length; j++) {
//     challengeKinder(j);
//   }
//   KINDER_OHNE_ZUSAGE[i].willZusage = false;
// }

// resultKeys.sort().reverse();
// fs.writeFileSync(`../results/${moment.now()}-30.json`, resultValues);
// console.log(resultKeys[0]);
// resultValues[resultKeys[0]].forEach(result => {
//   render(result);
// });

/// #####################################################################################

const numberFormat = new Intl.NumberFormat("de-DE", { style: "decimal" });
const BASIS_AUSLASTUNG = calculator(KINDER_MIT_ZUSAGE);

console.log(summieren(calculator(KINDER)));
console.log(summieren(calculator(KINDER_MIT_ZUSAGE)));
console.log(summieren(calculator(KINDER_OHNE_ZUSAGE)));

console.log("KINDER:", KINDER.length);
console.log("KINDER_MIT_ZUSAGE:", KINDER_MIT_ZUSAGE.length);
console.log(
  "KINDER_OHNE_ZUSAGE:",
  KINDER_OHNE_ZUSAGE.length,
  `(${numberFormat.format(
    Math.pow(2, KINDER_OHNE_ZUSAGE.length)
  )} Kombinationen)`
);
KINDER_OHNE_ZUSAGE.forEach((kind, index) => {
  kind.willZusage = true;
  kind.auslastung = calculator([kind]);
  console.log(summieren(kind.auslastung));
  calculator([]);
  kind.willZusage = false;
});

challengeKinder(0);
// render(KINDER);