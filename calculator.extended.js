module.exports = (kinder, zusagen) => {
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
        
  function inKitaExtended(jahr, monat) {
    for (let i = jahr; i < heute.year() + LAUFZEIT; i++) {
      for (let j = monat; j <= 12; j++) {
        monat = 1;
        if (zusagen[i][j] >= 29) {
          return false;
        }
      }
    }
    return true;
  }

  function inKita(kind, jahr, monat) {
    let stichtag = moment([jahr, monat - 1, 1]);
    let auslastung = zusagen[jahr][monat];
    return (
      (kind.kitaaufnahme <= stichtag ||
        (kind.kitaaufnahme234 <= stichtag &&
          auslastung < 29 &&
          inKitaExtended(jahr, monat))) &&
      kind.einschulung > stichtag
    );
  }

  let sticktag;
  for (let jahr in zusagen) {
    if (zusagen.hasOwnProperty(jahr)) {
      for (let monat in zusagen[jahr]) {
        if (zusagen[jahr].hasOwnProperty(monat)) {
          sticktag = moment([jahr, monat -1, 1]);
          kinder.forEach(kind => {
            if (inKita(kind, sticktag)) {
              if (kind.zusage === true || kind.willZusage === true) {
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
