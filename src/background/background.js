"use strict";

/*
Default settings. Initialize storage to these values.
*/
var datePrefrences = {
  longMonth: true,
  showTime: true,
  weekDay: false,
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
    browser.storage.local.set({ datePrefrences });
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

/* globals browser */
var init = async () => {
  browser.MahourDate.addWindowListener("hich");
};

init();
