import { KEYS, map, parse, save } from "./exporter";

function injectFloatingButton() {
    if (document.getElementById("afas-export-button")) return;

    const btn = document.createElement("button");
    btn.id = "afas-export-button";
    btn.textContent = "Export";

    Object.assign(btn.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "999999",
        padding: "10px 16px",
        fontSize: "14px",
        background: "#0078d4",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.3)"
    });

    btn.onclick = () => {
        chrome.runtime.sendMessage({ type: "AFAS_EXPORT" });
    };

    document.body.appendChild(btn);
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "RUN_EXPORT") {
        runExport();
    }
});

async function runExport() {
    // Example: read settings first
    const settings = await chrome.storage.sync.get(["mySetting"]);
    console.log("MySetting = ", settings.mySetting);

    let csv = parse();

    if (csv) {
        const mapping = {
            [KEYS[0]]: "Date",
            [KEYS[1]]: "",
            [KEYS[2]]: "Project Name",
            [KEYS[3]]: "Task Name",
            [KEYS[4]]: "",
            [KEYS[5]]: "Time Spent"
        };

        csv = map(csv, mapping);

        save(csv, mapping);
    }
}

injectFloatingButton();
