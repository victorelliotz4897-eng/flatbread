const rawLocations = [
  { name: "Lake Placid", date: "October-November 2020", address: "32 Harbor Ln, Lake Placid, NY 12946", lat: 44.2796, lng: -73.9815 },
  { name: "Jack's Coal Fired Oven", date: "December 2020", address: "40 E 89th St, New York, NY 10128", lat: 40.7830, lng: -73.9534 },
  { name: "Sauce Restaurant", date: "January 2021", address: "78 Rivington St, New York, NY 10002", lat: 40.7201, lng: -73.9919 },
  { name: "Lucali", date: "February 2021", address: "575 Henry St, Brooklyn, NY 11231", lat: 40.7022, lng: -73.9997 },
  { name: "Emmy Squared (UES)", date: "March 2021", address: "1426 3rd Ave, New York, NY 10028", lat: 40.7805, lng: -73.9540 },
  { name: "Zazzy's Pizza", date: "April 2021", address: "173 Orchard St, New York, NY 10002", lat: 40.7185, lng: -73.9928 },
  { name: "Roberta's", date: "May 2021", address: "261 Moore St, Brooklyn, NY 11206", lat: 40.7020, lng: -73.9444 },
  { name: "Circa Brewing Co.", date: "June 2021", address: "141 Lawrence St, Brooklyn, NY 11201", lat: 40.6926, lng: -73.9896 },
  { name: "Grimaldi's Pizzeria", date: "July 2021", address: "1 Front St, Brooklyn, NY 11201", lat: 40.7025, lng: -73.9948 },
  { name: "Beach Haus Brewery", date: "August 2021", address: "801 Main St, Belmar, NJ 07719", lat: 40.1612, lng: -74.0083 },
  { name: "Ops", date: "September 2021", address: "346 Himrod St, Brooklyn, NY 11237", lat: 40.7060, lng: -73.9196 },
  { name: "Flatbread Company", date: "October 2021", address: "2952 White Mountain Hwy, North Conway, NH 03860", lat: 44.0308, lng: -71.1182 },
  { name: "Joe & Pat's NYC", date: "November 2021", address: "1758 Victory Blvd, Staten Island, NY 10314", lat: 40.5984, lng: -74.1618 },
  { name: "Ignazio's", date: "December 2021", address: "4 Water St, Brooklyn, NY 11201", lat: 40.6986, lng: -73.9938 },
  { name: "Arturo's Coal Oven Pizza", date: "January 2022", address: "106 W Houston St, New York, NY 10012", lat: 40.7264, lng: -74.0001 },
  { name: "Wheated", date: "February 2022", address: "905 Church Ave, Brooklyn, NY 11218", lat: 40.6360, lng: -73.9767 },
  { name: "John's of Bleecker Street", date: "March 2022", address: "278 Bleecker St, New York, NY 10014", lat: 40.7306, lng: -74.0034 },
  { name: "Emmett's", date: "April 2022", address: "50 MacDougal St, New York, NY 10012", lat: 40.7291, lng: -74.0013 },
  { name: "Dellarocco's", date: "May 2022", address: "214 Hicks St, Brooklyn, NY 11201", lat: 40.6921, lng: -73.9934 },
  { name: "L'Industrie Pizzeria", date: "June 2022", address: "254 S 2nd St, Brooklyn, NY 11211", lat: 40.7101, lng: -73.9654 },
  { name: "The Galley Pizza & Eatery", date: "July 2022", address: "1313 Memorial Dr, Asbury Park, NJ 07712", lat: 40.2204, lng: -74.0121 },
  { name: "Lombardi's", date: "August 2022", address: "32 Spring St, New York, NY 10012", lat: 40.7226, lng: -73.9955 },
  { name: "Luigi's Pizza", date: "September 2022", address: "686 5th Ave, Brooklyn, NY 11215", lat: 40.6829, lng: -73.9824 },
  { name: "Giuseppina's", date: "October 2022", address: "691 6th Ave, Brooklyn, NY 11215", lat: 40.6654, lng: -73.9764 },
  { name: "Ace's Pizza", date: "November 2022", address: "637 Driggs Ave, Brooklyn, NY 11211", lat: 40.7076, lng: -73.9467 },
  { name: "Scarr's Pizza", date: "December 2022", address: "35 Orchard St, New York, NY 10002", lat: 40.7162, lng: -73.9930 },
  { name: "Paulie Gee's", date: "January 2023", address: "60 Greenpoint Ave, Brooklyn, NY 11222", lat: 40.7303, lng: -73.9556 },
  { name: "Kesté Pizza e Vino", date: "February 2023", address: "77 Fulton St, New York, NY 10038", lat: 40.7102, lng: -74.0064 },
  { name: "Macoletta", date: "March 2023", address: "28-07 Ditmars Blvd, Astoria, NY 11105", lat: 40.7666, lng: -73.9104 },
  { name: "Leo", date: "April 2023", address: "123 Havemeyer St, Brooklyn, NY 11211", lat: 40.7026, lng: -73.9526 },
  { name: "Best Pizza", date: "May 2023", address: "33 Havemeyer St, Brooklyn, NY 11211", lat: 40.7038, lng: -73.9530 },
  { name: "Totonno's", date: "June 2023", address: "1524 Neptune Ave, Brooklyn, NY 11224", lat: 40.5781, lng: -73.9611 },
  { name: "Brooklyn DOP", date: "July 2023", address: "232 Union St, Brooklyn, NY 11231", lat: 40.6869, lng: -73.9999 },
  { name: "Sea Bright Pizzeria", date: "August 2023", address: "1124 Ocean Ave, Sea Bright, NJ 07760", lat: 40.3647, lng: -74.0490 },
  { name: "Biga Bite", date: "September 2023", address: "1 Clinton St, New York, NY 10002", lat: 40.7147, lng: -73.9935 },
  { name: "Juliana's", date: "October 2023", address: "19 Old Fulton St, Brooklyn, NY 11201", lat: 40.7031, lng: -73.9910 },
  { name: "Mama's TOO!", date: "November 2023", address: "2750 Broadway, New York, NY 10025", lat: 40.7990, lng: -73.9686 },
  { name: "Unregular Pizza", date: "December 2023", address: "135 4th Ave, New York, NY 10003", lat: 40.7317, lng: -73.9914 },
  { name: "Little Charli", date: "January 2024", address: "271 Bleecker St, New York, NY 10014", lat: 40.7299, lng: -73.9993 },
  { name: "Emily", date: "February 2024", address: "919 Fulton St, Brooklyn, NY 11238", lat: 40.6841, lng: -73.9669 },
  { name: "La Rose Pizza", date: "March 2024", address: "374 Metropolitan Ave, Brooklyn, NY 11211", lat: 40.7148, lng: -73.9521 },
  { name: "See No Evil Pizza", date: "April 2024", address: "42 W 38th St, New York, NY 10018", lat: 40.7528, lng: -73.9851 },
  { name: "Mo's General", date: "May 2024", address: "620 Lorimer St, Brooklyn, NY 11211", lat: 40.7106, lng: -73.9479 },
  { name: "Ribalta", date: "June 2024", address: "48 E 12th St, New York, NY 10003", lat: 40.7287, lng: -73.9920 },
  { name: "LTD Pizza and Bar", date: "July 2024", address: "225 Hudson St, New York, NY 10013", lat: 40.7196, lng: -74.0096 },
  { name: "Cello's Pizzeria", date: "August 2024", address: "36 St Marks Pl, New York, NY 10003", lat: 40.7287, lng: -73.9851 },
  { name: "Razza", date: "September 2024", address: "275 Grove St, Jersey City, NJ 07302", lat: 40.7186, lng: -74.0380 },
  { name: "Pasquale Jones", date: "October 2024", address: "187 Mulberry St, New York, NY 10012", lat: 40.7220, lng: -73.9954 },
  { name: "Nate's Detroit Pizza", date: "November 2024", address: "623 Vanderbilt Ave, Brooklyn, NY 11238", lat: 40.6810, lng: -73.9685 },
  { name: "Lazzara's Pizza Cafe", date: "December 2024", address: "221 W 38th St, New York, NY 10018", lat: 40.7548, lng: -73.9941 },
  { name: "Nolita Pizza", date: "January 2025", address: "6716 Broadway, New York, NY 10001", lat: 40.7712, lng: -73.9811 },
  { name: "Don Antonio's", date: "February 2025", address: "309 W 50th St, New York, NY 10019", lat: 40.7652, lng: -73.9819 },
  { name: "Ceres", date: "April 2025", address: "164 Mott St, New York, NY 10013", lat: 40.7190, lng: -74.0086 },
  { name: "Kid Pizza", date: "May 2025", address: "157 W 18th St, New York, NY 10011", lat: 40.7420, lng: -74.0011 },
  { name: "Chrissy's Pizza", date: "June 2025", address: "44 Nassau Ave, Brooklyn, NY 11222", lat: 40.7178, lng: -73.9580 },
  { name: "F&F Pizzeria", date: "July 2025", address: "459 Court St, Brooklyn, NY 11231", lat: 40.6906, lng: -73.9954 },
  { name: "Decades Pizza", date: "August 2025", address: "671 Seneca Ave, Ridgewood, NY 11385", lat: 40.7062, lng: -73.9007 },
  { name: "Serano's Italian", date: "September 2025", address: "132 W 31st St, New York, NY 10001", lat: 40.7487, lng: -73.9949 },
  { name: "Lucky Charlie", date: "October 2025", address: "638 Dean St, Brooklyn, NY 11238", lat: 40.6834, lng: -73.9796 },
  { name: "Turbo Pizza", date: "November 2025", address: "7 Greene Ave, Brooklyn, NY 11238", lat: 40.6871, lng: -73.9850 },
  { name: "Victoria Pizzeria", date: "December 2025", address: "2716 Gerritsen Ave, Brooklyn, NY 11229", lat: 40.5970, lng: -73.9593 },
  { name: "Andrea's Pizza", date: "January 2026", address: "50 2nd Ave, New York, NY 10003", lat: 40.7287, lng: -73.9893 }
];

const monthMap = {
  jan: "January",
  january: "January",
  feb: "February",
  february: "February",
  mar: "March",
  march: "March",
  apr: "April",
  april: "April",
  may: "May",
  jun: "June",
  june: "June",
  jul: "July",
  july: "July",
  aug: "August",
  august: "August",
  sep: "September",
  sept: "September",
  september: "September",
  oct: "October",
  october: "October",
  nov: "November",
  november: "November",
  dec: "December",
  december: "December"
};

function normalizeString(value) {
  return value
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseYear(value) {
  const year = Number(String(value).slice(-4));
  return year < 100 ? 2000 + (year % 100) : year;
}

function parseDate(rawDate) {
  const dateText = normalizeString(rawDate || "");

  const rangeMatch = dateText.match(/^([A-Za-z]{3,9})\s*[\-–—]\s*([A-Za-z]{3,9})\s*'\s*(\d{2,4})$/i);
  const rangeMatchNoApostrophe = dateText.match(/^([A-Za-z]{3,9})\s*[\-–—]\s*([A-Za-z]{3,9})\s+(\d{2,4})$/i);
  if (rangeMatch) {
    const start = monthMap[rangeMatch[1].toLowerCase()] ?? "October";
    const end = monthMap[rangeMatch[2].toLowerCase()] ?? "November";
    const year = parseYear(rangeMatch[3]);

    return {
      sortDate: new Date(year, monthIndex(rangeMatch[1]), 1),
      display: `${start} – ${end} ${year}`
    };
  }

  if (rangeMatchNoApostrophe) {
    const start = monthMap[rangeMatchNoApostrophe[1].toLowerCase()] ?? "October";
    const end = monthMap[rangeMatchNoApostrophe[2].toLowerCase()] ?? "November";
    const year = parseYear(rangeMatchNoApostrophe[3]);

    return {
      sortDate: new Date(year, monthIndex(rangeMatchNoApostrophe[1]), 1),
      display: `${start} – ${end} ${year}`
    };
  }

  const monthMatch = dateText.match(/^([A-Za-z]{3,9})\s*'\s*(\d{2,4})$/i);
  const monthMatchFull = dateText.match(/^([A-Za-z]{3,9})\s+(\d{2,4})$/i);
  if (monthMatch) {
    const month = monthMap[monthMatch[1].toLowerCase()] ?? "January";
    const year = parseYear(monthMatch[2]);

    return {
      sortDate: new Date(year, monthIndex(monthMatch[1]), 1),
      display: `${month} ${year}`
    };
  }
  if (monthMatchFull) {
    const month = monthMap[monthMatchFull[1].toLowerCase()] ?? "January";
    const year = parseYear(monthMatchFull[2]);

    return {
      sortDate: new Date(year, monthIndex(monthMatchFull[1]), 1),
      display: `${month} ${year}`
    };
  }

  const yearOnly = dateText.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    return {
      sortDate: new Date(year, 0, 1),
      display: `January ${year}`
    };
  }

  return {
    sortDate: new Date(),
    display: dateText
  };
}

function monthIndex(monthName) {
  const normalized = normalizeString(monthName).toLowerCase();
  const lookup = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    sep: 8,
    september: 8,
    october: 9,
    november: 10,
    december: 11
  };
  return lookup[normalized.slice(0, 3)] ?? lookup[normalized] ?? 0;
}

export const flatbreadLocations = (() => {
  const seen = new Set();

  const mapped = rawLocations
    .map((entry) => {
      const parsed = parseDate(entry.date);
      const key = `${normalizeString(entry.name).toLowerCase()}::${parsed.display}`;
      if (seen.has(key)) {
        return null;
      }
      seen.add(key);

      return {
        id: key,
        name: entry.name,
        date: parsed.display,
        dateRaw: entry.date,
        visitDate: parsed.sortDate,
        address: entry.address,
        lat: entry.lat,
        lng: entry.lng
      };
    })
    .filter(Boolean);

  return mapped.sort((a, b) => a.visitDate - b.visitDate);
})();
