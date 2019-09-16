module.exports = (kinder, MODUS, zusagen) => {
  const performance = require("perf_hooks").performance;
  const moment = require("moment");
  const laufzeit = 6;
  const heute = moment();
  const start = performance.now();

  if (Array.isArray(zusagen) === false) {
    zusagen = {};
    for (let jahr = heute.year(); jahr < heute.year() + laufzeit; jahr++) {
      zusagen[jahr] = {};
      for (let monat = 1; monat <= 12; monat++) {
        zusagen[jahr][monat] = 0;
      }
    }
  }

  function inKita(kind, stichtag) {
    return (
      ((MODUS === "36" && kind.kitaaufnahme3 <= stichtag) ||
        (MODUS === "33" && kind.kitaaufnahme234 <= stichtag) ||
        (MODUS === "-" && kind.kitaaufnahme <= stichtag)) &&
      kind.einschulung > stichtag
    );
  }

  let sticktag;
  for (let jahr in zusagen) {
    if (zusagen.hasOwnProperty(jahr)) {
      for (let monat in zusagen[jahr]) {
        if (zusagen[jahr].hasOwnProperty(monat)) {
          sticktag = moment([jahr, monat - 1, 1]);
          kinder.forEach(kind => {
            if (inKita(kind, sticktag)) {
              if ((kind.zusage === true || kind.willZusage === true) && kind.absage !== true) {
                zusagen[jahr][monat]++;
                if (zusagen[jahr][monat] > 29) {
                  throw new Error("SKIP!");
                }
              }
            }
          });
        }
      }
    }
  }

  // console.log(performance.now() - start, "ms");
  return zusagen;
};
