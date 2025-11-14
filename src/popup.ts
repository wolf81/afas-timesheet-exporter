document.addEventListener("DOMContentLoaded", () => {
  const field = document.getElementById("mySetting") as HTMLInputElement;
  const saveBtn = document.getElementById("saveSetting");

  // Load existing setting
  chrome.storage.sync.get(["mySetting"], (data) => {
    if (data.mySetting) field.value = data.mySetting;
  });

  // Save user setting
  saveBtn?.addEventListener("click", () => {
    chrome.storage.sync.set({ mySetting: field.value });
  });
});
