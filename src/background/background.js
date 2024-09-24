/*
Default settings. Initialize storage to these values.
*/
let datePrefrences = {
  longMonth: true,
  twoDigitYear: false,
  showTime: true,
  weekDay: false,
  englishNumbers: false,
};

/*
Generic error logger.
*/
function onError(e) {
  console.error(e);
}

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.datePrefrences) {
    browser.storage.local.set({ datePrefrences: datePrefrences });
  } else {
    datePrefrences = storedSettings.datePrefrences;
  }
}

function repaint(newSettings) {
  browser.customColumns.remove("persianDateColumn");
  browser.customColumns.add(
    "persianDateColumn",
    "Persian Date",
    "persianDate",
    newSettings
  );
}

browser.storage.local.get().then(checkStoredSettings, onError);

browser.customColumns.add(
  "persianDateColumn",
  "Persian Date",
  "persianDate",
  datePrefrences
);
