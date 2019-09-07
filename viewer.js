const performance = require("perf_hooks").performance;
const start = performance.now();
const render = require("./render.new");
const prepare = require("./prepare");
const util = require("util");
const fs = require("fs");
let result = fs.readFileSync("../results/1567854604219.-.json", "UTF-8");
// result = result.replace(/\[object Object\]/g, 'null');

const readline = require("readline");
let index = 0;

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else if (key.name === "n") {
    if (index < result[maxAuslastung].length) {
      let kinder = JSON.parse(result[maxAuslastung][index]);
      kinder = prepare(kinder);
      console.log(
        kinder.filter(kind => {
          return kind.vorname === "Julian" || kind.vorname === "Luise";
        })
      );
      render(kinder);
      outlineSelection(kinder);
      index++;
    }
  }
  console.log(`You pressed the "${str}" key`);
  console.log();
  console.log(key);
  console.log();
});
console.log("Press any key...");

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

console.log(
  "Anzahl möglicher Kombinationen mit maximaler Auslastung:",
  result[maxAuslastung].length
);
result[maxAuslastung].forEach(kinder => {
  kinder = JSON.parse(kinder);
  // console.log(typeof kinder);
  // console.log(util.inspect(kinder, true, null, true));
  // render(kinder);
});
// console.log(result[maxAuslastung].length);
