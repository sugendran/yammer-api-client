var DATE_RE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}) ([-+]{1})(\d{2})(\d{2})$/;

function parseDate(str) {
  var parts, offsetH, offsetM;
  
  parts = str ? str.match(DATE_RE) : [];

  if (parts.length != 10) { return; }

  offsetM = parseInt(parts.pop(), 10);
  offsetH = parseInt(parts.pop(), 10);
  if (parts.pop() == '-') {
    offsetH = -offsetH;
    offsetM = -offsetM;
  }

  parts[4] = parseInt(parts[4], 10) + offsetH;
  parts[5] = parseInt(parts[5], 10) + offsetM;

  parts.shift();

  return Date.UTC.apply(Date, parts);
}

module.exports = {
  parseDate: parseDate
}
