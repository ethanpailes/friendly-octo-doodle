"use strict";

function sortOnColumn(tableHeaderClick, cmp) {
    const table = tableHeaderClick.srcElement.closest("table");
    const colIdx = tableHeaderClick.srcElement.cellIndex;

    let colData = [];
    let adjust = -1;
    for (let i = 0; i < table.rows.length; ++i) {
        const row = table.rows[i];
        if (row.cells[colIdx].tagName === "TH") {
            continue;
        }
        if (adjust === -1) {
            adjust = i;
        }

        colData.push({
            data: row.cells[colIdx].innerText,
            original_idx: i,
        });
    }

    if (adjust === -1) {
        return;
    }

    colData.sort((lhs, rhs) => {
        return cmp(lhs.data, rhs.data);
    });

    const newRows = colData.map((cd) => {
        return table.rows[cd.original_idx];
    });

    for (let i = table.rows.length - 1; i >= adjust; --i) {
        table.rows[i].remove();
    }

    let tableBody = table.querySelector("tbody");
    for (let r of newRows) {
        tableBody.appendChild(r);
    }
}

function datumCompare(lhs, rhs) {
    let tmp = NaN;

    if ((tmp = parseFloat(lhs)) != NaN) {
        lhs = tmp;
    }

    if ((tmp = parseFloat(rhs)) != NaN) {
        rhs = tmp;
    }

    if (lhs < rhs) {
        return 1;
    } else if (lhs === rhs) {
        return 0;
    } else {
        return -1;
    }
}

exports.registerHooks = () => {
    const headers = document.querySelectorAll("#leaderboard-container th");

    for (let h of headers) {
        h.addEventListener("click", (e) => {
            sortOnColumn(e, datumCompare);
        });
    }
};
