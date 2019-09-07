module.exports = KINDER => {
  const moment = require("moment");
  const chalk = require("chalk");
  const fs = require("fs");

  

  function inKita(kind, stichtag) {
    return kind.kitaaufnahme <= stichtag && kind.einschulung > stichtag;
  }

  function outline(zahlen, bezeichnung) {
    let summe = 0;
    OUTLINT += "\n|";
    for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
      for (let monat = 1; monat <= 12; monat++) {
        if (`${zahlen[jahr][monat]}`.length === 1) {
          OUTLINT += " ";
        }
        if (zahlen[jahr][monat] > 29) {
          OUTLINT += chalk.red(zahlen[jahr][monat]);
        } else if (zahlen[jahr][monat] > 24) {
          OUTLINT += chalk.yellow(zahlen[jahr][monat]);
        } else {
          OUTLINT += zahlen[jahr][monat];
        }
        summe += zahlen[jahr][monat];
        OUTLINT += "|";
      }
    }
    OUTLINT += ` ${bezeichnung} (${summe})`;
    return summe;
  }

  const LAUFZEIT = 6;
  const COUNTER = [];
  const ZUSAGEN = [];
  let OUTLINT = "\n\n";

  const START = moment().year();
  OUTLINT += "\n|";
  heute = moment();
  for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
    OUTLINT += `               ${jahr}                |`;
    COUNTER[jahr] = [];
    ZUSAGEN[jahr] = [];
  }
  OUTLINT += "\n|";
  for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
    for (let monat = 1; monat <= 12; monat++) {
      COUNTER[jahr][monat] = 0;
      ZUSAGEN[jahr][monat] = 0;
      if (monat < 10) {
        OUTLINT += " ";
      }
      OUTLINT += monat;
      OUTLINT += "|";
    }
  }
  KINDER.forEach(kind => {
    let outline = "\n|";
    for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
      for (let monat = 1; monat <= 12; monat++) {
        if (inKita(kind, moment([jahr, monat - 1, 1]))) {
          COUNTER[jahr][monat]++;
          if (kind.zusage === true || kind.willZusage === true) {
            ZUSAGEN[jahr][monat]++;
          }
          if (ZUSAGEN[jahr][monat] > 29) {
            return { auslastung: null };
            outline += chalk.red("##");
          } else if (ZUSAGEN[jahr][monat] > 24) {
            outline += chalk.yellow("##");
          } else {
            outline += "##";
          }
        } else {
          outline += "  ";
        }
        outline += "|";
      }
    }
    if (kind.zusage === true) {
      OUTLINT += chalk.green(outline + ` ${kind.vorname} ${kind.nachname}`);
    } else if (kind.willZusage === true) {
      OUTLINT += chalk.red(outline + ` ${kind.vorname} ${kind.nachname}`);
    } else if (kind.geschwisterkind === true) {
      OUTLINT += chalk.blue(outline + ` ${kind.vorname} ${kind.nachname}`);
    } else {
      OUTLINT += outline + ` ${kind.vorname} ${kind.nachname}`;
    }
  });
  OUTLINT += "\n|\n";

  outline(ZUSAGEN, "Zusagen");
  outline(COUNTER, "Nachfrage");
  console.log(OUTLINT)
};
