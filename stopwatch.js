window.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("សូម Login ចូលជាមុនសិន!");
        window.location.href = "TestStopwatch.html";
        return;
    }

    // បង្ហាញឈ្មោះឯកសារបច្ចុប្បន្ន
    const savedFileName = localStorage.getItem('savedFileName');
    if (savedFileName) {
        document.getElementById('currentFileNameDisplay').textContent = `ឯកសារ៖ ${savedFileName}`;
    }

    // ទាញយកទិន្នន័យ Excel ដែលបានរក្សាទុក
    const savedExcelData = localStorage.getItem('savedExcelData');
    if (savedExcelData) {
        const excelData = JSON.parse(savedExcelData);
        renderExcelTable(excelData);
    } else {
        document.getElementById('excelDataTable').innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#777;">មិនទាន់មានទិន្នន័យ Excel ទេ។ សូមត្រឡប់ไป Upload ជាមុនសិន!</td></tr>`;
    }
});

// មុខងារបង្ហាញទិន្នន័យ Excel ក្នុងតារាង
function renderExcelTable(data) {
    const table = document.getElementById('excelDataTable');
    table.innerHTML = "";

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        // បើជាជួរដំបូង (Header របស់ Excel)
        if (rowIndex === 0) {
            tr.innerHTML = row.map(cell => `<th>${cell !== undefined ? cell : ''}</th>`).join('') + `<th>Action (ចាប់នាទី)</th>`;
            table.appendChild(tr);
        } else {
            // ជួរទិន្នន័យធម្មតា
            let rowHtml = row.map(cell => `<td>${cell !== undefined ? cell : ''}</th>`).join('');
            rowHtml += `<td><button class="start-timer-btn" onclick="startTimerForStep(${rowIndex})">⏱️ ចាប់នាទី</button></td>`;
            tr.innerHTML = rowHtml;
            table.appendChild(tr);
        }
    });
}

// មុខងារពេលចុចប៊ូតុងចាប់នាទី
window.startTimerForStep = function(rowIndex) {
    alert(`ត្រៀមចាប់នាទីសម្រាប់ជួរទី ${rowIndex}`);
    // យើងនឹងសរសេរកូដលម្អិតសម្រាប់ផ្ទាំង Stopwatch បន្តទៀតនៅទីនេះ
};

// ត្រឡប់ទៅ Dashboard វិញ
document.getElementById('backToDashboardBtn').addEventListener('click', function() {
    window.location.href = "dashboard.html";
});