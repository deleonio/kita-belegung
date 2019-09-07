module.exports = (KINDER, zusagen) => {
  const performance = require("perf_hooks").performance;
  const moment = require("moment");
  const laufzeit = 6;
  const heute = moment();
  const start = performance.now();

  if (Array.isArray(zusagen) === false) {
    zusagen = [];
    for (let jahr = heute.year(); jahr < heute.year() + laufzeit; jahr++) {
      zusagen[jahr] = [];
      for (let monat = 1; monat <= 12; monat++) {
        zusagen[jahr][monat] = 0;
      }
    }
  }

  function inKita(kind, stichtag) {
    return (
      moment(kind.geburtsdatum, "DD-MM-YYYY").add(30, "month") <=
        moment(stichtag, "DD-MM-YYYY") &&
      moment(`01.08.${kind.einschulung}`, "DD-MM-YYYY") >
        moment(stichtag, "DD-MM-YYYY")
    );
  }

  KINDER.forEach(kind => {
    for (let jahr = heute.year(); jahr < heute.year() + laufzeit; jahr++) {
      for (let monat = 1; monat <= 12; monat++) {
        if (inKita(kind, moment([jahr, monat - 1, 1]))) {
          if (kind.zusage === true || kind.willZusage === true) {
            zusagen[jahr][monat]++;
          }
          if (zusagen[jahr][monat] > 29) {
            return null;
            // throw new Error('FAULT!');
          }
        }
      }
    }
  });

  console.log(performance.now() - start, 'ms');
  return zusagen;
};
