function processLogin() {
    // ប្រើប្រាស់ .trim().toLowerCase() ដើម្បីកាត់ khoảng ឃ្លាត និងបម្លែងអក្សរទាំងអស់ជាអក្សរតូច
    const user = document.getElementById('username').value.trim().toLowerCase();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');
    const loadingSpinner = document.getElementById('loading-spinner');
    const loginBtn = document.getElementById('loginBtn');

    // បញ្ជីគណនី Admin និងកូនក្រុមទាំងអស់ (ត្រូវសរសេរឈ្មោះជាអក្សរតូចនៅទីនេះ)
    const usersDatabase = {
        "sokret": { password: "306666", role: "admin" },   
        "phearum": { password: "306666", role: "admin" },  
        "pich":  { password: "2222", role: "user"  },    
        "hong":  { password: "22222", role: "user"  }    
    };

    // ពិនិត្យមើលថាតើ User មានក្នុង Database ហើយ Password ត្រូវគ្នាដែរឬទេ
    if (usersDatabase[user] && usersDatabase[user].password === pass) {
        errorMsg.textContent = "";
        loginBtn.style.display = 'none';
        loadingSpinner.style.display = 'block';

        const userRole = usersDatabase[user].role;

        // រក្សាទុកឈ្មោះពិតប្រាកដ និងសិទ្ធិក្នុង localStorage
        localStorage.setItem('currentUser', user);
        localStorage.setItem('userRole', userRole);

        setTimeout(function() {
            window.location.href = "home.html"; // បញ្ជូនទៅទំព័រដើមបន្ទាប់ពី Login ជោគជ័យ
        }, 1000);

    } else {
        errorMsg.textContent = "ID ឬ Password មិនត្រឹមត្រូវទេ សូមព្យាយាមម្តងទៀត!";
    }
}

// ភ្ជាប់ព្រឹត្តិការណ៍ចុចប៊ូតុង និង nút Enter
document.getElementById('loginBtn').addEventListener('click', processLogin);

document.getElementById('username').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') processLogin();
});

document.getElementById('password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') processLogin();
});