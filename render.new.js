module.exports = (KINDER, show) => {
  const moment = require("moment");
  const chalk = require("chalk");
  const fs = require("fs");

  show = show === true;

  function inKitaExtended(jahr, monat) {
    for (let i = jahr; i < heute.year() + LAUFZEIT; i++) {
      for (let j = monat; j <= 12; j++) {
        monat = 1;
        if (ZUSAGEN[i][j] >= 29) {
          return false;
        }
      }
    }
    return true;
  }

  function inKita(kind, jahr, monat) {
    let stichtag = moment([jahr, monat - 1, 1]);
    let auslastung = ZUSAGEN[jahr][monat];
    return (
      (kind.kitaaufnahme <= stichtag ||
        (kind.kitaaufnahme234 <= stichtag &&
          auslastung < 29 &&
          inKitaExtended(jahr, monat))) &&
      kind.einschulung > stichtag
    );
  }

  function fruehstensInKita(kind, jahr, monat) {
    let stichtag = moment([jahr, monat - 1, 1]);
    return (
      kind.kitaaufnahme234 <= stichtag &&
      kind.einschulung > stichtag
    );
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
  let OUTLINT = "\n";

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
        if (inKita(kind, jahr, monat)) {
          COUNTER[jahr][monat]++;
          if ((kind.zusage === true || kind.willZusage === true) && kind.absage !== true) {
            ZUSAGEN[jahr][monat]++;
          }
          outline += "##";
        } else if(fruehstensInKita(kind, jahr, monat)) {
          outline += "..";
        } else {
          outline += "  ";
        }
        outline += "|";
      }
    }
    if (kind.willZusage === true) {
      outline = chalk.cyan(outline);
    } else if (kind.zusage === true) {
      outline = chalk.green(outline);
    } else {
      outline = chalk.red(outline);
    }

    let name = `${kind.vorname} ${kind.nachname}`;
    if (kind.geschwisterkind === true) {
      name += "*";
    }

    if (kind.willZusage === true) {
      name = chalk.bgCyan(name);
    } else if (kind.zusage === true) {
      name = chalk.green(name);
    } else {
      name = chalk.bgRed(name);
    }
    OUTLINT += `${outline} ${name}`;
  });
  OUTLINT += "\n|\n";

  outline(ZUSAGEN, "Zusagen");
  outline(COUNTER, "Nachfrage");
  if (show === true) {
    console.log(OUTLINT);
    console.log()
    console.log(`Legende: ${chalk.bgCyan('Zusagen')} | ${chalk.bgRed('Absagen')} | # potenzielle Betreuung | . potenziell frühzeitigere Betreuung | * Geschwisterkind`)
    console.log()
  }
  return ZUSAGEN;
};
