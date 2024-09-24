function loadSystemModule(newPath, oldPath) {
  const errors = [];
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

const { ExtensionSupport } = loadSystemModule(
  "resource:///modules/ExtensionSupport.sys.mjs",
  "resource:///modules/ExtensionSupport.jsm"
);
const { ExtensionCommon } = loadSystemModule(
  "resource://gre/modules/ExtensionCommon.sys.mjs",
  "resource://gre/modules/ExtensionCommon.jsm"
);
const { ThreadPaneColumns } = (function () {
  const errors = [];
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
})();

const ids = [];

const persianDateConverter = (
  datePrefrences,
  date,
  currentDate = new Date()
) => {
  //add-on options
  const monthStyle = datePrefrences.longMonth ? "long" : "2-digit";
  const yearStyle = datePrefrences.twoDigitYear ? "2-digit" : "numeric";
  const timeStyle = datePrefrences.showTime ? "2-digit" : "hidden";
  const weekDayStyle = datePrefrences.weekDay ? "long" : "hidden";
  const numbersStyle = datePrefrences.englishNumbers ? "latn" : "arabext";

  //fixed options
  const dayStyle = "2-digit";

  const locale = "fa-IR-u-nu-" + numbersStyle + "-ca-persian";

  const yesterdayDate = new Date();
  yesterdayDate.setDate(currentDate.getDate() - 1);

  const year = date.toLocaleString(locale, { year: yearStyle });
  const month = date.toLocaleString(locale, { month: monthStyle });
  const day = date.toLocaleString(locale, { day: dayStyle });
  const weekDay =
    weekDayStyle != "hidden"
      ? date.toLocaleString(locale, { weekday: weekDayStyle })
      : "";
  let time =
    timeStyle != "hidden"
      ? date.toLocaleString(locale, {
          hour: timeStyle,
          minute: timeStyle,
          hour12: false,
        }) + " ،"
      : "";
  //Fix for a bug that doesn't prepend zero to Farsi
  if (time.length != 7 && timeStyle != "hidden") {
    const zero = numbersStyle === "arabext" ? "۰" : "0";
    time = zero + time;
  }

  let isCurrentYear;
  if (currentDate.toLocaleString(locale, { year: yearStyle }) == year) {
    isCurrentYear = true;
  } else {
    isCurrentYear = false;
  }

  let isCurrentDay;
  if (date.toDateString() === currentDate.toDateString()) {
    isCurrentDay = true;
  } else {
    isCurrentDay = false;
  }

  let isYesterday;
  if (date.toDateString() === yesterdayDate.toDateString()) {
    isYesterday = true;
  } else {
    isYesterday = false;
  }

  let placeholder;
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

  const dateString = placeholder
    .replace("YY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("WD", weekDay)
    .replace("TT", time);

  return dateString;
};

var customColumns = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      customColumns: {
        async add(id, name, field, datePrefrences) {
          ids.push(id);

          function persianDate(message) {
            return persianDateConverter(
              datePrefrences,
              new Date(message.date / 1000)
            );
          }

          function getEmpty(message) {
            return "";
          }

          const callback = field == "persianDate" ? persianDate : getEmpty;
          const sort_callback = (message) => {
            return field == "persianDate"
              ? Math.floor(message.date / 1000000)
              : 0;
          };

          ThreadPaneColumns.addCustomColumn(id, {
            name: name,
            hidden: false,
            icon: false,
            resizable: true,
            sortable: true,
            textCallback: callback,
            sortCallback: sort_callback,
          });
        },

        async remove(id) {
          ThreadPaneColumns.removeCustomColumn(id);
          ids.remove(id);
        },
      },
    };
  }

  close() {
    for (const id of ids) {
      ThreadPaneColumns.removeCustomColumn(id);
    }
  }
};
