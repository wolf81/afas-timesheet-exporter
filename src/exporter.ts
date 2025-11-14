const FILENAME = 'timesheet.csv';

export type Mapping = Record<string, string>;

export type CsvData = string[][]

export const KEYS: string[] = [
    "Date",
    "Project Id",
    "Project Name",
    "Task Description",
    "Company",
    "Duration",
];

export function map(CsvData: CsvData, mapping: Mapping): CsvData {
    let rows: string[][] = [];
    let cols: number[] = [];

    for (const [key, value] of Object.entries(mapping)) {
        if (value.trim() === "") continue; // Skip unmapped columns.

        if (KEYS.includes(key)) {
            cols.push(KEYS.indexOf(key));
        }
    }

    for (let sourceRow of CsvData) {
        const row: string[] = [];
        for (let col of cols) {
            row.push(sourceRow[col]);
        }
        rows.push(row);
    }

    return rows;
}

export function parse(): CsvData | undefined {
    // gather all blocks
    const blocks = Array.from(document.querySelectorAll('.block[data-date]'));
    if (!blocks.length) {
        alert('No .block[data-date] elements found.');
        return undefined;
    }

    const rows = blocks.map(b => {
        const dateAttr = b.getAttribute("data-date");
        const date = dateAttr
            ? new Date(Number(dateAttr)).toLocaleDateString('en-CA') // yyyy-MM-dd
            : ''; 
        const proj = b.querySelector('.proj')?.textContent.trim() || ''; // project id
        const desc = "DEPOT"; // b.querySelector('.desc')?.textContent.trim() || ''; // project name
        const desc2 = b.querySelector('.desc2')?.textContent.trim() || ''; // task description
        const company = b.querySelector('.text')?.textContent.trim() || ''; // client company
        const h = b.querySelector('.hours-hours')?.textContent.trim() || '0'; // hours
        const m = b.querySelector('.hours-minutes')?.textContent.trim() || '00'; // minutes
        const duration = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`; // duration in HH:MM

        return [date, proj, desc, desc2, company, duration];
    });

    // sort by date
    rows.sort((a, b) => a[0].localeCompare(b[0]));

    function csvEscape(s: string) {
        return `"${String(s).replace(/"/g, '""')}"`;
    }

    return rows.map(r => r.map(csvEscape));
}

export function save(data: CsvData, mapping: Mapping): void {
    const header = Object.values(mapping).filter(v => v.trim() !== "");

    const csv = [header, ...data].map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(`Exported ${data.length} rows to ${FILENAME}`);
}

