const KINDER = require("./kinder.json");
const calculator = require("./calculator");
const render = require("./render");
const moment = require("moment");
const fs = require("fs");
const chalk = require("chalk");

function filterKinderOhneZusage() {
  return KINDER.filter(kind => {
    return kind.zusage !== true;
  });
}

KINDER.forEach(kind => {
  let einschulung = moment(kind.geburtsdatum, "DD-MM-YYYY").add(6, "years");
  if (einschulung.month() > 6) {
    einschulung.add(1, "year");
  }
  kind.einschulung = einschulung.year();
});

const KINDER_OHNE_ZUSAGE = filterKinderOhneZusage();
// KINDER_OHNE_ZUSAGE.splice(10);

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

chellangeKinder(0);
// resultCollector(calculator(KINDER));

// for (let i = 0; i < KINDER_OHNE_ZUSAGE.length; i++) {
//   resultCollector(calculator(KINDER));
//   outlineSelection(KINDER_OHNE_ZUSAGE);
//   for (let j = i; j < KINDER_OHNE_ZUSAGE.length; j++) {
//     chellangeKinder(j);
//   }
//   KINDER_OHNE_ZUSAGE[i].willZusage = false;
// }

resultKeys.sort().reverse();
fs.writeFileSync(`../results/${moment.now()}-30.json`, resultKeys);
for (let i = 0; i < resultKeys.length; i++) {
  console.log("-----------------------------------");
  console.log(resultKeys[i]);
  resultValues[resultKeys[i]].forEach(result => {
    render(result);
  });
  console.log("-----------------------------------");
}
