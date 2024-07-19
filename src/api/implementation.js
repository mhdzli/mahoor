function loadSystemModule(newPath, oldPath) {
    const errors = []
    try {
        return ChromeUtils.importESModule(newPath);
    } catch (ex) {
        errors.push(ex);
    }
    try {
        return ChromeUtils.import(oldPath);
    } catch (ex) {
        errors.push(ex);
    }
    throw new Error(`Could not load system module: ${errors}`);
}

const { ExtensionSupport } = loadSystemModule("resource:///modules/ExtensionSupport.sys.mjs", "resource:///modules/ExtensionSupport.jsm");
const { ExtensionCommon } = loadSystemModule("resource://gre/modules/ExtensionCommon.sys.mjs", "resource://gre/modules/ExtensionCommon.jsm");
const { ThreadPaneColumns } = function() {
    const errors = []
    for (const module of [
        "chrome://messenger/content/ThreadPaneColumns.mjs", // v128
        "chrome://messenger/content/thread-pane-columns.mjs", // v115.10
    ]) {
        try {
            return ChromeUtils.importESModule(module);
        } catch (ex) {
            errors.push(ex);
        }
    }
    throw new Error(`Could not load system module: ${errors}`);
}();


const ids = [];

var customColumns = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      customColumns: {
        async add(id, name, field, datePrefrences) {
          ids.push(id);

          var monthStyle = datePrefrences.longMonth ? "long" : "2-digit";
          var timeStyle = datePrefrences.showTime ? "2-digit" : "hidden";
          var weekDayStyle = datePrefrences.weekDay ? "long" : "hidden";
          var numbersStyle = datePrefrences.englishNumbers ? "latn" : "arabext";

          function persianDate(message) {

            //fixed options
            var yearStyle = "2-digit";
            var dayStyle = "2-digit";

            var locale = "fa-IR-u-nu-" + numbersStyle + "-ca-persian";

            var date = new Date(message.date / 1000)
            var currentDate = new Date();

            var year = date.toLocaleString(locale, { year: yearStyle } );
            var month = date.toLocaleString(locale, { month: monthStyle });
            var day = date.toLocaleString(locale, { day: dayStyle });
            var weekDay = weekDayStyle != "hidden" ? date.toLocaleString(locale, { weekday: weekDayStyle }) : "";
            var time = timeStyle != "hidden" ? date.toLocaleString(locale, { hour: timeStyle, minute: timeStyle, hour12: false, }) + " ،" : "";

            //Fix for a bug that doesn't prepend zero to Farsi
            if (time.length != 7 && timeStyle != "hidden") {
              var zero = numbersStyle === "arabext" ? "۰" : "0";
              time = zero + time;
            }
            var isCurrentYear;
            if (currentDate.toLocaleString(locale, { year: yearStyle }) == year) {
              isCurrentYear = true;
            } else {
              isCurrentYear = false;
            }
            var isCurrentDay;
            if (date.toDateString() === currentDate.toDateString()) {
              isCurrentDay = true;
            } else {
              isCurrentDay = false;
            }
            var isYesterday;
            var yesterdayDate = new Date();
            yesterdayDate.setDate(currentDate.getDate() - 1);
            if (date.toDateString() === yesterdayDate.toDateString()) {
              isYesterday = true;
            } else {
              isYesterday = false;
            }

            var placeholder;
            if (monthStyle === "long") {
              placeholder = "TT \u202BWD DD MM YY\u202C";
            } else {
              placeholder = "TT YY/MM/DD WD";
            }

            //remove year if it's current year
            if (isCurrentYear) {
              placeholder = placeholder.replace(/YY./, "");
            }
            //only show time if it's current day or yesterday
            if (isCurrentDay) {
              placeholder = "TT امروز";
            } else if (isYesterday) {
              placeholder = "TT دیروز";
            }

           var dateString = placeholder.replace("YY", year).replace("MM", month).replace("DD", day).replace("WD", weekDay).replace("TT", time);

            return dateString;
          }

          function getEmpty(message) {
            return "";
          }

          var callback = field == "persianDate" ? persianDate : getEmpty;

          ThreadPaneColumns.addCustomColumn(id, {
            name: name,
            hidden: false,
            icon: false,
            resizable: true,
            sortable: false,
            textCallback: callback
          });
        },

        async remove(id) {
          ThreadPaneColumns.removeCustomColumn(id);
          ids.remove(id);
        }
      },
    };
  }

  close() {
    for (const id of ids)
    {
      ThreadPaneColumns.removeCustomColumn(id);
    }
  }
};

