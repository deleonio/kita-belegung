const performance = require("perf_hooks").performance;
const start = performance.now();
const render = require("./render");
const util = require("util");
const fs = require("fs");
let result = fs.readFileSync("../results/1567847227927.json", "UTF-8");
// result = result.replace(/\[object Object\]/g, 'null');

console.log(typeof result);
result = JSON.parse(result);
console.log(typeof result);
console.log(Array.isArray(result));
let maxAuslastung = 0;
for (let auslastung in result) {
  if (result.hasOwnProperty(auslastung)) {
    if (maxAuslastung < auslastung) {
      maxAuslastung = auslastung;
    }
  }
}

console.log(
  "Anzahl möglicher Kombinationen mit maximaler Auslastung:",
  result[maxAuslastung].length
);
result[maxAuslastung].forEach(kinder => {
  kinder = JSON.parse(kinder);
  // console.log(typeof kinder);
  // console.log(util.inspect(kinder, true, null, true));
  render(kinder);
  // kinder.forEach(kind => {
  //   console.log(util.inspect(kind, true, null, true));
  // });
});
