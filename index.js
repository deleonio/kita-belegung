const KINDER = require("./kinder.json");
const KINDER_MIT_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage === true;
});
const KINDER_OHNE_ZUSAGE = KINDER.filter(kind => {
  return kind.zusage !== true;
});

const calculator = require("./calculator");
const render = require("./render");
const moment = require("moment");
const fs = require("fs");
const chalk = require("chalk");

function summieren(jahre) {
  let summe = 0;
  jahre.forEach(monate => {
    monate.forEach(monat => {
      summe += monat;
    });
  });
  return summe;
}

KINDER.forEach(kind => {
  let einschulung = moment(kind.geburtsdatum, "DD-MM-YYYY").add(6, "years");
  if (einschulung.month() > 6) {
    einschulung.add(1, "year");
  }
  kind.einschulung = moment(`01.08.${einschulung.year()}`, "DD-MM-YYYY");
  kind.kitaaufnahme = moment(kind.geburtsdatum, "DD-MM-YYYY").add(30, "month");
});

let resultKeys = [];
let resultValues = [];
function resultCollector(result) {
  if (result === null) {
    return;
  }
  resultKeys.push(result.auslastung);
  resultValues[result.auslastung] = resultValues[result.auslastung] || [];
  resultValues[result.auslastung].push(result.kinder);
}

function outlineSelection(kinder, result) {
  outline = "";
  kinder.forEach(kind => {
    if (kind.willZusage) {
      outline += "#";
    } else {
      outline += "-";
    }
  });
  if (result === null) {
    console.log(chalk.grey(outline));
  } else {
    // console.log(chalk.green(outline));
    console.log(outline);
  }
}

function chellangeKinder(index) {
  try {
    let result = calculator(KINDER);
    resultCollector(result);
    outlineSelection(KINDER_OHNE_ZUSAGE, result);
  } catch (e) {}
  for (let i = index + 1; i < KINDER_OHNE_ZUSAGE.length; i++) {
    chellangeKinder(i);
  }
  KINDER_OHNE_ZUSAGE[index].willZusage = true;
  if (index + 1 < KINDER_OHNE_ZUSAGE.length) {
    chellangeKinder(index + 1);
  } else {
    try {
      let result = calculator(KINDER);
      resultCollector(result);
      outlineSelection(KINDER_OHNE_ZUSAGE, result);
    } catch (e) {}
  }
  //   for (let i = 0; i < KINDER_OHNE_ZUSAGE.length; i++) {
  //     KINDER_OHNE_ZUSAGE[i].willZusage = true;
  //     resultCollector(calculator(KINDER));
  //     outlineSelection(KINDER_OHNE_ZUSAGE);
  //     KINDER_OHNE_ZUSAGE[i].willZusage = false;
  //   }
  KINDER_OHNE_ZUSAGE[index].willZusage = false;
}

// chellangeKinder(0);

// let zusagen = calculator(KINDER);
console.log(summieren(calculator(KINDER)));
console.log(summieren(calculator(KINDER_MIT_ZUSAGE)));
console.log(summieren(calculator(KINDER_OHNE_ZUSAGE)));
// resultCollector(calculator(KINDER));

// for (let i = 0; i < KINDER_OHNE_ZUSAGE.length; i++) {
//   resultCollector(calculator(KINDER));
//   outlineSelection(KINDER_OHNE_ZUSAGE);
//   for (let j = i; j < KINDER_OHNE_ZUSAGE.length; j++) {
//     chellangeKinder(j);
//   }
//   KINDER_OHNE_ZUSAGE[i].willZusage = false;
// }

// resultKeys.sort().reverse();
// fs.writeFileSync(`../results/${moment.now()}-30.json`, resultValues);
// console.log(resultKeys[0]);
// resultValues[resultKeys[0]].forEach(result => {
//   render(result);
// });
