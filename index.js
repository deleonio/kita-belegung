const performance = require("perf_hooks").performance;
const start = performance.now();
let KINDER = require("./kinder.v2.json");
const prepare = require("./prepare");
const KINDER_MIT_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage === true && kind.absage !== true;
});
const KINDER_MIT_ABSAGE = KINDER.filter(kind => {
  return kind.absage === true;
});
const KINDER_OHNE_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage !== true && kind.absage !== true;
});

const MODUS = "-";
console.log("MODUS", MODUS);

const calculator = require("./calculator");
const render = require("./render.new");
const moment = require("moment");
const fs = require("fs");

process.on("exit", () => {
  console.log(`${numberFormat.format(performance.now() - start)} ms`);
  resultKeys.sort().reverse();
  fs.writeFileSync(
    `../results/${moment.now()}.${MODUS}.json`,
    JSON.stringify(resultValues)
  );
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

KINDER = prepare(KINDER);

let maxAuslastung = 0;
let resultKeys = [];
let resultValues = {};
function resultCollector(kinder, auslastung) {
  const gesamtAuslastung = summieren(auslastung);
  if (maxAuslastung <= gesamtAuslastung) {
    if (maxAuslastung < gesamtAuslastung) {
      resultValues = {};
      resultValues[gesamtAuslastung] = [];
      outlineSelection(KINDER_OHNE_ZUSAGE, gesamtAuslastung);
    }
    maxAuslastung = gesamtAuslastung;
    if (resultKeys.indexOf(gesamtAuslastung) === -1) {
      resultKeys.push(gesamtAuslastung);
    }
    resultValues[gesamtAuslastung].push(JSON.stringify(kinder));
  }
}

function getInSekunden() {
  return (performance.now() - start) / 1000;
}

function getInMinuten() {
  return getInSekunden() / 60;
}

function getHashes(kinder) {
  hashes = "";
  kinder.forEach(kind => {
    if (kind.willZusage) {
      hashes += "#";
    } else {
      hashes += "-";
    }
  });
  return hashes;
}

function outlineSelection(kinder, auslastung) {
  console.log(
    getHashes(kinder) +
      " | " +
      auslastung +
      " | " +
      `${numberFormat.format(getInSekunden())} s`
  );
}

function testConstellation(basisAuslastung, kinderWillZusage) {
  testAuslastung = JSON.parse(JSON.stringify(basisAuslastung));
  for (let jahr in testAuslastung) {
    if (testAuslastung.hasOwnProperty(jahr)) {
      for (let monat in testAuslastung[jahr]) {
        if (testAuslastung[jahr].hasOwnProperty(monat)) {
          kinderWillZusage.forEach(kind => {
            if (kind.zusage === true || kind.willZusage === true) {
              testAuslastung[jahr][monat] += kind.auslastung[jahr][monat];
              if (testAuslastung[jahr][monat] > 29) {
                let hashes = getHashes(kinder);
                hashes = hashes.replace(/^-*/, "");
                BLACK_LIST.push(new RegExp(`${hashes}$`));
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

const BLACK_LIST = [];
function isNotInBlackList(kinder) {
  const hashes = getHashes(kinder);
  return (
    BLACK_LIST.find(blackHash => {
      return blackHash.test(hashes);
    }) === undefined
  );
}

function challengeKinder(index) {
  KINDER_OHNE_ZUSAGE[index].willZusage = false;
  if (isNotInBlackList(KINDER_OHNE_ZUSAGE)) {
    if (index + 1 < KINDER_OHNE_ZUSAGE.length) {
      challengeKinder(index + 1);
    } else {
      try {
        resultCollector(
          KINDER,
          testConstellation(BASIS_AUSLASTUNG, KINDER_OHNE_ZUSAGE)
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
          testConstellation(BASIS_AUSLASTUNG, KINDER_OHNE_ZUSAGE)
        );
      } catch (e) {
        // render(KINDER);
        // throw e;
      }
    }
    KINDER_OHNE_ZUSAGE[index].willZusage = false;
  }
}

const numberFormat = new Intl.NumberFormat("de-DE", { style: "decimal" });
const BASIS_AUSLASTUNG = calculator(KINDER_MIT_ZUSAGE, MODUS);

console.log("KINDER:", KINDER.length);
console.log("KINDER_MIT_ZUSAGE:", KINDER_MIT_ZUSAGE.length);
console.log("KINDER_MIT_ABSAGE:", KINDER_MIT_ABSAGE.length);
console.log(
  "KINDER_OHNE_ZUSAGE:",
  KINDER_OHNE_ZUSAGE.length,
  `(${numberFormat.format(
    Math.pow(2, KINDER_OHNE_ZUSAGE.length)
  )} Kombinationen)`
);

KINDER_OHNE_ZUSAGE.forEach((kind, index) => {
  kind.willZusage = true;
  kind.auslastung = calculator([kind], MODUS);
  kind.willZusage = false;
});

challengeKinder(0);
render(KINDER);
