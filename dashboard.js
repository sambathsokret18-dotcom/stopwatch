// ពេលផ្ទុកទំព័រឡើង (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');

    if (!currentUser) {
        alert("សូម Login ចូលជាមុនសិន!");
        window.location.href = "TestStopwatch.html";
        return;
    }

    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = currentUser + (userRole === 'admin' ? ' (Admin)' : ' (User)');
    }

    // បើជា Admin ឱ្យបង្ហាញតារាងប្រវត្តិ Upload ទាំងអស់
    if (userRole === 'admin') {
        const adminSection = document.getElementById('adminHistorySection');
        if (adminSection) {
            adminSection.style.display = 'block';
            renderAdminHistoryTable();
        }
    }

    // ហៅមុខងារបង្ហាញឯកសារប្រចាំ User នីមួយៗ
    loadUserFileInfo();

    // គ្រប់គ្រងចលនា Loading Spinner ពេលចុចលើ Sidebar Menu
    const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
    const loader = document.getElementById("pageLoader");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetUrl = this.getAttribute("href");

            // បើជា Link ទទេ (#) ឬ Logout មិនបាច់រត់ Spinner ទេ
            if (!targetUrl || targetUrl === "#" || this.getAttribute("onclick")) {
                return;
            }

            e.preventDefault(); // រាំងមិនទាន់ឱ្យប្តូរទំព័រភ្លាមៗ

            if (loader) {
                loader.classList.add("active"); // បង្ហាញរង្វង់មូល Loading Spinner
            }

           window.location.href = targetUrl;
        });
    });
});

// Upload ឯកសារ Excel
const excelFileInput = document.getElementById('excelFile');
if (excelFileInput) {
    excelFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const now = new Date();
        const dateStr = now.toLocaleDateString('km-KH');
        const timeStr = now.toLocaleTimeString('km-KH');
        const currentUser = localStorage.getItem('currentUser');

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const excelJsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (excelJsonData.length > 0) {
                const userFileKey = `savedExcelData_${currentUser}`;
                const userMetaKey = `fileMeta_${currentUser}`;

                const fileInfo = {
                    fileName: file.name,
                    uploader: currentUser,
                    date: dateStr,
                    time: timeStr,
                    data: excelJsonData
                };

                localStorage.setItem(userFileKey, JSON.stringify(excelJsonData));
                localStorage.setItem(userMetaKey, JSON.stringify(fileInfo));

                let uploadHistory = JSON.parse(localStorage.getItem('uploadHistoryLogs')) || [];
                
                uploadHistory.push({
                    id: Date.now(),
                    fileName: file.name,
                    uploader: currentUser,
                    date: dateStr,
                    time: timeStr,
                    data: excelJsonData
                });
                
                localStorage.setItem('uploadHistoryLogs', JSON.stringify(uploadHistory));

                loadUserFileInfo();

                if (localStorage.getItem('userRole') === 'admin') {
                    renderAdminHistoryTable();
                }
                alert("Upload ឯកសារ Excel បានជោគជ័យ!");
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

// មុខងារបង្ហាញព័ត៌មានឯកសារជាក់លាក់របស់ User នីមួយៗ
function loadUserFileInfo() {
    const currentUser = localStorage.getItem('currentUser');
    const userMetaKey = `fileMeta_${currentUser}`;
    const savedMeta = localStorage.getItem(userMetaKey);

    const fileInfoDisplay = document.getElementById('fileInfoDisplay');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    if (savedMeta && fileNameDisplay) {
        const fileInfo = JSON.parse(savedMeta);
        if (fileInfoDisplay) fileInfoDisplay.style.display = 'block';
        fileNameDisplay.innerHTML = `📄 <b>ឯកសារបច្ចុប្បន្ន៖</b> ${fileInfo.fileName} (Upload ដោយ: <b>${fileInfo.uploader}</b> នៅ ${fileInfo.date} ${fileInfo.time})`;
    } else {
        if (fileInfoDisplay) {
            fileInfoDisplay.style.display = 'none';
        }
    }
}

// បង្ហាញតារាងប្រវត្តិសម្រាប់ Admin
function renderAdminHistoryTable() {
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) return;

    let uploadHistory = JSON.parse(localStorage.getItem('uploadHistoryLogs')) || [];
    tableBody.innerHTML = "";

    if (uploadHistory.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;">មិនទាន់មានប្រវត្តិការ Upload ទេ។</td></tr>`;
        return;
    }

    uploadHistory.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><b>${item.fileName}</b></td>
            <td>${item.uploader}</td>
            <td>${item.date} ម៉ោង ${item.time}</td>
            <td>
                <button class="action-btn btn-download" onclick="downloadHistoryItem(${item.id})">📥 Download</button>
                <button class="action-btn btn-delete" onclick="deleteHistoryItem(${item.id})">🗑️ លុប</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// មុខងារ Admin ទាញយក (Download) ឯកសារ Excel វិញ
window.downloadHistoryItem = function(id) {
    let uploadHistory = JSON.parse(localStorage.getItem('uploadHistoryLogs')) || [];
    let item = uploadHistory.find(h => h.id === id);

    if (!item || !item.data) {
        alert("រកមិនឃើញទិន្នន័យសម្រាប់ទាញយកទេ!");
        return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(item.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, item.fileName);
};

// មុខងារ Admin លុបប្រវត្តិ File តាម id ជាក់លាក់
window.deleteHistoryItem = function(id) {
    if (confirm("តើអ្នកពិតជាចង់លុបប្រវត្តិឯកសារនេះមែនទេ?")) {
        let uploadHistory = JSON.parse(localStorage.getItem('uploadHistoryLogs')) || [];
        uploadHistory = uploadHistory.filter(item => item.id !== id);
        localStorage.setItem('uploadHistoryLogs', JSON.stringify(uploadHistory));
        renderAdminHistoryTable();
    }
};

// មុខងាររៀបចំចលនា Loading Spinner ពេលប្តូរទំព័រ
function navigateWithLoader(targetUrl) {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('active');
    }
    
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 600);
}

// ទៅកាន់ទំព័រជ្រើសរើស Section / Stopwatch ជាមួយ Spinner
const goToStopwatchBtn = document.getElementById('goToStopwatchBtn');
if (goToStopwatchBtn) {
    goToStopwatchBtn.addEventListener('click', function() {
        const currentUser = localStorage.getItem('currentUser');
        const savedData = localStorage.getItem(`savedExcelData_${currentUser}`);
        if (!savedData) {
            alert("សូមធ្វើការ Upload ឯកសារ Excel ជាមុនសិន!");
            return;
        }
        navigateWithLoader('sections.html');
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        window.location.href = "TestStopwatch.html";
    });
}

// មុខងារ Collapse Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// ដាក់កូដ Logout ក្នុង DOMContentLoaded ធានាថា HTML ផ្ទុកចប់សព្វគ្រប់ទើបដំណើរការ
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // លុបទិន្នន័យ Session ចេញពី LocalStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            
            // បញ្ជូនទៅកាន់ទំព័រ Login វិញ
            window.location.href = "TestStopwatch.html";
        });
    }
});