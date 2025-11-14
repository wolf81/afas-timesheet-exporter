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

    function csvEscape(s: string) {
        return `"${String(s).replace(/"/g, '""')}"`;
    }

    // gather all blocks
    const blocks = Array.from(document.querySelectorAll('.block[data-date]'));
    if (!blocks.length) {
        alert('No .block[data-date] elements found.');
        return;
    }

    const rows = blocks.map(b => {
        const dateMs = b.getAttribute('data-date');
        const dateAttr = b.getAttribute("data-date");
        const date = dateAttr
            ? new Date(Number(dateAttr)).toISOString().split("T")[0]
            : "";
        const proj = b.querySelector('.proj')?.textContent.trim() || '';
        const desc = b.querySelector('.desc')?.textContent.trim() || '';
        const desc2 = b.querySelector('.desc2')?.textContent.trim() || '';
        const company = b.querySelector('.text')?.textContent.trim() || '';
        const h = b.querySelector('.hours-hours')?.textContent.trim() || '0';
        const m = b.querySelector('.hours-minutes')?.textContent.trim() || '00';
        const duration = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
        const title = b.getAttribute('title') || '';

        return [date, proj, desc, desc2, company, duration, title];
    });

    // sort by date then project
    rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

    // custom CSV header and rows
    const header = ['Date', 'Project', 'Description', 'Task', 'Company', 'Duration', 'Title'];
    const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\r\n');

    // create downloadable blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timesheet.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(`Exported ${rows.length} entries to timesheet.csv`);
}

injectFloatingButton();
