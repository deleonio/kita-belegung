const CACHE = {};

function getCacheHash(kinder) {
  let hash = "";
  kinder.forEach(kind => {
    if (kind.zusage === true || kind.willZusage === true) {
      hash += "+";
    } else {
      hash += "-";
    }
  });
  return hash;
}

module.exports = KINDER => {
  const moment = require("moment");
  const hash = getCacheHash(KINDER);
  // console.log(hash);

  if (CACHE.hasOwnProperty(hash) || CACHE[hash] === null) {
    throw new Error("BREAK!");
  } else {
    CACHE[hash] = null;
  }

  function inKita(kind, stichtag) {
    return (
      moment(kind.geburtsdatum, "DD-MM-YYYY").add(30, "month") <=
        moment(stichtag, "DD-MM-YYYY") &&
      moment(`01.08.${kind.einschulung}`, "DD-MM-YYYY") >
        moment(stichtag, "DD-MM-YYYY")
    );
  }

  function summieren(zahlen, bezeichnung) {
    let summe = 0;
    for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
      for (let monat = 1; monat <= 12; monat++) {
        summe += zahlen[jahr][monat];
      }
    }
    return summe;
  }

  const LAUFZEIT = 6;
  const COUNTER = [];
  const ZUSAGEN = [];

  heute = moment();
  for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
    COUNTER[jahr] = [];
    ZUSAGEN[jahr] = [];
  }
  for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
    for (let monat = 1; monat <= 12; monat++) {
      COUNTER[jahr][monat] = 0;
      ZUSAGEN[jahr][monat] = 0;
      if (monat < 10) {
      }
    }
  }
  KINDER.forEach(kind => {
    for (let jahr = heute.year(); jahr < heute.year() + LAUFZEIT; jahr++) {
      for (let monat = 1; monat <= 12; monat++) {
        if (inKita(kind, moment([jahr, monat - 1, 1]))) {
          COUNTER[jahr][monat]++;
          if (kind.zusage === true || kind.willZusage === true) {
            ZUSAGEN[jahr][monat]++;
          }
          if (ZUSAGEN[jahr][monat] > 29) {
            return null;
            // throw new Error('FAULT!');
          }
        }
      }
    }
  });

  CACHE[hash] = {
    auslastung: summieren(ZUSAGEN, "Zusagen"),
    nachfrag: summieren(COUNTER, "Nachfrage"),
    kinder: JSON.parse(JSON.stringify(KINDER)),
  };

  return CACHE[hash];
};
