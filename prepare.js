const moment = require("moment");

module.exports = kinder => {
  kinder.forEach(kind => {
    let kitaaufnahme = moment(kind.geburtsdatum, "DD-MM-YYYY").add(3, "years");
    kind.geburtsdatum2 = moment(kind.geburtsdatum, "DD-MM-YYYY");
    if (kitaaufnahme.month() > 6) {
      kitaaufnahme.add(1, "year");
    }
    kind.kitaaufnahme234 = moment(kind.geburtsdatum, "DD-MM-YYYY").add(
      33,
      "month"
    );
    kind.kitaaufnahme3 = moment(kind.geburtsdatum, "DD-MM-YYYY").add(
      36,
      "month"
    );
    kind.kitaaufnahme = moment(`01.08.${kitaaufnahme.year()}`, "DD-MM-YYYY");
    let einschulung = moment(kind.geburtsdatum, "DD-MM-YYYY").add(6, "years");
    if (einschulung.month() > 6) {
      einschulung.add(1, "year");
    }
    kind.einschulung = moment(`01.08.${einschulung.year()}`, "DD-MM-YYYY");
    // if (kind.zusage === true && kind.willZusage === true) {
    //   kind.zusage = false;
    // }
    kind.einschulungJahr = einschulung.year();
  });

  for (let n = kinder.length; n > 0; --n) {
    for (let i = 0; i < n - 1; ++i) {
      if (kinder[i].geburtsdatum2 > kinder[i + 1].geburtsdatum2) {
        let kind = kinder[i];
        kinder[i] = kinder[i + 1];
        kinder[i + 1] = kind;
      }
    }
  }

  let aktuellesJahr = 0;
  let kinderZusage = [];
  let kinderOhneZusage = [];
  kinder.forEach(kind => {
    if (aktuellesJahr < kind.einschulungJahr) {
      aktuellesJahr = kind.einschulungJahr;
      kinderOhneZusage.forEach(kind => {
        kinderZusage.push(kind);
      });
      kinderOhneZusage = [];
    }
    if (kind.zusage === true) {
      kinderZusage.push(kind);
    } else {
      kinderOhneZusage.push(kind);
    }
  });
  kinderOhneZusage.forEach(kind => {
    kinderZusage.push(kind);
  });

  return kinderZusage;
};
