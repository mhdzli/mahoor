// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.
var { AppConstants } = ChromeUtils.import(
  "resource://gre/modules/AppConstants.jsm"
);
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

const jalaliDateColumnHandler = {
  init(win) {
    this.win = win;
  },
  getCellText(row, col) {
    var date = new Date(this.getJalaliDate(this.win.gDBView.getMsgHdrAt(row)));
    var currentDate = new Date();

    //fixed options
    var yearStyle = "2-digit";
    var dayStyle = "2-digit";

    var locale = "fa-IR-u-nu-" + numbersStyle + "-ca-persian";

    var year = date.toLocaleString(locale, { year: yearStyle });
    var month = date.toLocaleString(locale, { month: monthStyle });
    var day = date.toLocaleString(locale, { day: dayStyle });
    var weekDay =
      weekDayStyle != "hidden"
        ? date.toLocaleString(locale, { weekday: weekDayStyle })
        : "";
    var time =
      timeStyle != "hidden"
        ? date.toLocaleString(locale, {
            hour: timeStyle,
            minute: timeStyle,
            hour12: false,
          }) + " ،"
        : "";

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

    var placehodler;
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

    dateString = placeholder
      .replace("YY", year)
      .replace("MM", month)
      .replace("DD", day)
      .replace("WD", weekDay)
      .replace("TT", time);

    return dateString;
  },
  getSortStringForRow(hdr) {
    return this.getJalaliDate(hdr);
  },
  isString() {
    return true;
  },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  getImageSrc(row, col) {
    return null;
  },
  getSortLongForRow(hdr) {
    return 0;
  },
  getJalaliDate(aHeader) {
    return aHeader.date / 1000;
  },
};

const columnOverlay = {
  init(win) {
    this.win = win;
    this.addColumns(win);
  },

  destroy() {
    this.destroyColumns();
  },

  observe(aMsgFolder, aTopic, aData) {
    try {
      jalaliDateColumnHandler.init(this.win);
      this.win.gDBView.addColumnHandler(
        "jalaliDateColumn",
        jalaliDateColumnHandler
      );
    } catch (ex) {
      console.error(ex);
      throw new Error("Cannot add column handler");
    }
  },

  addColumn(win, columnId, columnLabel) {
    if (win.document.getElementById(columnId)) return;

    const treeCol = win.document.createXULElement("treecol");
    treeCol.setAttribute("id", columnId);
    treeCol.setAttribute("persist", "hidden ordinal sortDirection width");
    treeCol.setAttribute("flex", "2");
    treeCol.setAttribute("closemenu", "none");
    treeCol.setAttribute("label", columnLabel);
    treeCol.setAttribute("tooltiptext", "Sort by Persian date");

    const threadCols = win.document.getElementById("threadCols");
    threadCols.appendChild(treeCol);

    // Restore persisted attributes.
    let attributes = Services.xulStore.getAttributeEnumerator(
      this.win.document.URL,
      columnId
    );
    for (let attribute of attributes) {
      let value = Services.xulStore.getValue(
        this.win.document.URL,
        columnId,
        attribute
      );
      // See Thunderbird bug 1607575 and bug 1612055.
      if (
        attribute != "ordinal" ||
        parseInt(AppConstants.MOZ_APP_VERSION, 10) < 74
      ) {
        treeCol.setAttribute(attribute, value);
      } else {
        treeCol.ordinal = value;
      }
    }

    Services.obs.addObserver(this, "MsgCreateDBView", false);
  },

  addColumns(win) {
    this.addColumn(win, "jalaliDateColumn", "Date (Persian)");
  },

  destroyColumn(columnId) {
    const treeCol = this.win.document.getElementById(columnId);
    if (!treeCol) return;
    treeCol.remove();
  },

  destroyColumns() {
    this.destroyColumn("jalaliDateColumn");
    Services.obs.removeObserver(this, "MsgCreateDBView");
  },
};

var MahourDateHeaderView = {
  init(win) {
    this.win = win;
    columnOverlay.init(win);

    // Usually the column handler is added when the window loads.
    // In our setup it's added later and we may miss the first notification.
    // So we fire one ourserves.
    if (
      win.gDBView &&
      win.document.documentElement.getAttribute("windowtype") == "mail:3pane"
    ) {
      Services.obs.notifyObservers(null, "MsgCreateDBView");
    }
  },

  destroy() {
    columnOverlay.destroy();
  },
};
