const longMonthInput = document.querySelector("#longMonth");
const twoDigitYearInput = document.querySelector("#twoDigitYear");
const showTimeInput = document.querySelector("#showTime");
const weekDayInput = document.querySelector("#weekDay");
const englishNumbersInput = document.querySelector("#englishNumbers");

/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {
  const newSettings = {
    longMonth: longMonthInput.checked,
    twoDigitYear: twoDigitYearInput.checked,
    showTime: showTimeInput.checked,
    weekDay: weekDayInput.checked,
    englishNumbers: englishNumbersInput.checked,
  };
  browser.storage.local.set({
    datePrefrences: newSettings,
  });
  browser.extension.getBackgroundPage().repaint(newSettings);
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  longMonthInput.checked = restoredSettings.datePrefrences.longMonth;
  twoDigitYearInput.checked = restoredSettings.datePrefrences.twoDigitYear;
  showTimeInput.checked = restoredSettings.datePrefrences.showTime;
  weekDayInput.checked = restoredSettings.datePrefrences.weekDay;
  englishNumbersInput.checked = restoredSettings.datePrefrences.englishNumbers;
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
browser.storage.local.get().then(updateUI, onError);

/*
On blur, save the currently selected settings.
*/
longMonthInput.addEventListener("change", storeSettings);
twoDigitYearInput.addEventListener("change", storeSettings);
showTimeInput.addEventListener("change", storeSettings);
weekDayInput.addEventListener("change", storeSettings);
englishNumbersInput.addEventListener("change", storeSettings);
