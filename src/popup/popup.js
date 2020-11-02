let optionsButtonElement = document.getElementById("options-button");
var openPreferences;

function onOpened() {
  return window.close();
}

function onError(error) {
  console.log(`Error: ${error}`);
}

OptionsButtonClicked = function () {
  openPreferences = browser.runtime.openOptionsPage();
  openPreferences.then(onOpened, onError);
};

optionsButtonElement.addEventListener("mouseup", OptionsButtonClicked);

// /// Using popup as prefrences page ///
// const longMonthInput = document.querySelector("#longMonth");
// const showTimeInput = document.querySelector("#showTime");
// const weekDayInput = document.querySelector("#weekDay");
// const englishNumbersInput = document.querySelector("#englishNumbers");
//
// /*
// Store the currently selected settings using browser.storage.local.
// */
// function storeSettings() {
//   const newSettings = {
//     longMonth: longMonthInput.checked,
//     showTime: showTimeInput.checked,
//     weekDay: weekDayInput.checked,
//     englishNumbers: englishNumbersInput.checked,
//   };
//   browser.storage.local.set({
//     datePrefrences: newSettings,
//   });
//   var backPage = browser.extension.getBackgroundPage();
//   backPage.repaint(newSettings);
// }
//
// /*
// Update the options UI with the settings values retrieved from storage,
// or the default settings if the stored settings are empty.
// */
// function updateUI(restoredSettings) {
//   longMonthInput.checked = restoredSettings.datePrefrences.longMonth;
//   showTimeInput.checked = restoredSettings.datePrefrences.showTime;
//   weekDayInput.checked = restoredSettings.datePrefrences.weekDay;
//   englishNumbersInput.checked = restoredSettings.datePrefrences.englishNumbers;
// }
//
// function onError(e) {
//   console.error(e);
// }
//
// /*
// On opening the options page, fetch stored settings and update the UI with them.
// */
// const gettingStoredSettings = browser.storage.local.get();
// gettingStoredSettings.then(updateUI, onError);
//
// /*
// On blur, save the currently selected settings.
// */
// longMonthInput.addEventListener("change", storeSettings);
// showTimeInput.addEventListener("change", storeSettings);
// weekDayInput.addEventListener("change", storeSettings);
// englishNumbersInput.addEventListener("change", storeSettings);
