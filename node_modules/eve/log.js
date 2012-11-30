(function () {
    var logs = [],
        logger = function (type) {
            return function (a) {
                if (a && a[0] && a[0].error) {
                    for (var i = 0, ii = a.length; i < ii; i++) {
                        logs.push({
                            text: a[i].error,
                            time: new Date,
                            type: type
                        });
                        checklimit();
                    }
                } else {
                    var args = Array.prototype.slice.call(arguments, 0);
                    logs.push({
                        text: args.join(", "),
                        time: new Date,
                        type: type
                    });
                    checklimit();
                }
            };
        },
        log = logger(0),
        date = {
            format: function (time) {
                return time.toDateString();
            }
        },
        checklimit = function () {
            logs.length > log.limit && logs.shift();
        },
        toString = function () {
            var out = "";
            for (var i = 0, ii = this.length; i < ii; i++) {
                var time = this[i].time,
                    text = this[i].text,
                    type = this[i].type;
                out += [" ", "\u2620", "\u26a0", "\u2691"][type] + " " + date.format(time, "hh:mm:ss") + " " + text + "\n";
            }
            return out;
        };
    log.error = logger(1);
    log.warn = logger(2);
    log.debug = logger(3);
    log.limit = 1e3;
    log.out = function (limit) {
        limit = limit || Infinity;
        var out = logs.slice(Math.max(0, logs.length - limit), logs.length);
        out.toString = toString;
        return out;
    };
    log.toString = function () {
        return this.out().toString();
    };
    eve("new.log", log);
    eve.on("new.date", function () {
        date.format = this.format;
    });
})();
// Date
(function () {
    var leadingzero = function (s) {
        return (s < 10) ? "0" + s : s;
    },
        date = {
        /**
         * Converts the value of the current Date object to its equivalent string representation.
         * Format Specifiers
        <pre>
        Format  Description                                                                  Example
        ------  ---------------------------------------------------------------------------  -----------------------
         s      The seconds of the minute between 1-59.                                      "1" to "59"
         ss     The seconds of the minute with leading zero if required.                     "01" to "59"

         m      The minute of the hour between 0-59.                                         "1"  or "59"
         mm     The minute of the hour with leading zero if required.                        "01" or "59"

         h      The hour of the day between 1-12.                                            "1"  to "12"
         hh     The hour of the day with leading zero if required.                           "01" to "12"

         H      The hour of the day between 1-23.                                            "1"  to "23"
         HH     The hour of the day with leading zero if required.                           "01" to "23"

         d      The day of the month between 1 and 31.                                       "1"  to "31"
         dd     The day of the month with leading zero if required.                          "01" to "31"
         ddd    Abbreviated day name.                                                        "Mon" to "Sun" 
         dddd   The full day name.                                                           "Monday" to "Sunday"

         M      The month of the year between 1-12.                                          "1" to "12"
         MM     The month of the year with leading zero if required.                         "01" to "12"
         MMM    Abbreviated month name.                                                      "Jan" to "Dec"
         MMMM   The full month name.                                                         "January" to "December"

         yy     Displays the year as a maximum two-digit number.                             "99" or "07"
         yyyy   Displays the full four digit year.                                           "1999" or "2007"

         t      Displays the first character of the A.M./P.M. designator.                    "A" or "P"
         tt     Displays the A.M./P.M. designator.                                           "AM" or "PM"
        </pre>
         * @param {String}   A format string consisting of one or more format spcifiers [Optional].
         * @return {String}  A string representation of the current Date object.
         */
        format: function (date, format, days, months, ampm) {
            days = days || "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");
            months = months || "January February March April May June July August September October November December".split(" ");
            ampm = ampm || ["AM", "PM"];

            var hours;
            return format ? format.replace(/d{1,4}|M{1,4}|y{1,4}|hh?|HH?|mm?|ss?|tt?/g, function (format) {
                switch (format) {
                case "hh":
                    hours = hours || date.getHours() < 13 ? date.getHours() : (date.getHours() - 12);
                    return leadingzero(hours);
                case "h":
                    hours = hours || date.getHours() < 13 ? date.getHours() : (date.getHours() - 12);
                    return hours;
                case "HH":
                    return leadingzero(date.getHours());
                case "H":
                    return date.getHours();
                case "mm":
                    return leadingzero(date.getMinutes());
                case "m":
                    return date.getMinutes();
                case "ss":
                    return leadingzero(date.getSeconds());
                case "s":
                    return date.getSeconds();
                case "yyyy":
                    return date.getFullYear();
                case "yy":
                    return (date.getFullYear() + "").substring(2, 4);
                case "dddd":
                    return days[date.getDay()];
                case "ddd":
                    return days[date.getDay()].substring(0, 3);
                case "dd":
                    return leadingzero(date.getDate());
                case "d":
                    return date.getDate();
                case "MMMM":
                    return months[date.getMonth()];
                case "MMM":
                    return months[date.getMonth()].substring(0, 3);
                case "MM":
                    return leadingzero(date.getMonth() + 1);
                case "M":
                    return date.getMonth() + 1;
                case "t":
                    return ampm[date.getHours() < 12].charAt();
                case "tt":
                    return ampm[date.getHours() < 12];
                }
            }
            ) : date.toDateString();
        }
    };
    eve("new.date", date);
})();