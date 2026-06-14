// مفاتيح التخزين
const STORAGE = {
    products: 'erp_products',
    customers: 'erp_customers',
    suppliers: 'erp_suppliers',
    sales: 'erp_sales',
    employees: 'erp_employees',
    inventoryLogs: 'erp_inventory_logs'
};

let products = [], customers = [], suppliers = [], sales = [], employees = [], inventoryLogs = [];
let currentUser = null;
let cart = [];

// تحميل البيانات
function loadData() {
    products = JSON.parse(localStorage.getItem(STORAGE.products) || '[]');
    customers = JSON.parse(localStorage.getItem(STORAGE.customers) || '[]');
    suppliers = JSON.parse(localStorage.getItem(STORAGE.suppliers) || '[]');
    sales = JSON.parse(localStorage.getItem(STORAGE.sales) || '[]');
    employees = JSON.parse(localStorage.getItem(STORAGE.employees) || '[]');
    inventoryLogs = JSON.parse(localStorage.getItem(STORAGE.inventoryLogs) || '[]');
    if (employees.length === 0) {
        employees = [
            { name: 'مدير', role: 'manager', password: 'admin123' },
            { name: 'كاشير', role: 'cashier', password: 'cash123' }
        ];
        saveEmployees();
    }
}
function saveProducts() { localStorage.setItem(STORAGE.products, JSON.stringify(products)); }
function saveCustomers() { localStorage.setItem(STORAGE.customers, JSON.stringify(customers)); }
function saveSuppliers() { localStorage.setItem(STORAGE.suppliers, JSON.stringify(suppliers)); }
function saveSales() { localStorage.setItem(STORAGE.sales, JSON.stringify(sales)); }
function saveEmployees() { localStorage.setItem(STORAGE.employees, JSON.stringify(employees)); }
function saveInventoryLogs() { localStorage.setItem(STORAGE.inventoryLogs, JSON.stringify(inventoryLogs)); }

function isManager() { return currentUser && currentUser.role === 'manager'; }
function requireManager() { if (!isManager()) { alert('هذه الخاصية للمدير فقط'); return false; } return true; }

// عرض الجداول
function renderProductsTable() {
    let tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    products.forEach(p => {
        let row = tbody.insertRow();
        row.insertCell(0).innerText = p.name;
        row.insertCell(1).innerText = p.barcode || '-';
        row.insertCell(2).innerText = p.price;
        row.insertCell(3).innerText = p.stock;
        row.insertCell(4).innerText = p.shelf || '-';
        let btn = document.createElement('button');
        btn.innerText = 'حذف';
        btn.onclick = () => { if (requireManager()) { products = products.filter(x => x.id !== p.id); saveProducts(); renderAll(); } };
        row.insertCell(5).appendChild(btn);
    });
}
function renderCustomersTable() {
    let tbody = document.querySelector('#customersTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        customers.forEach(c => {
            let row = tbody.insertRow();
            row.insertCell(0).innerText = c.name;
            row.insertCell(1).innerText = c.phone;
            row.insertCell(2).innerText = c.debt;
            let btn = document.createElement('button');
            btn.innerText = 'حذف';
            btn.onclick = () => { if (requireManager()) { customers = customers.filter(x => x.id !== c.id); saveCustomers(); renderAll(); } };
            row.insertCell(3).appendChild(btn);
        });
    }
    let select = document.getElementById('debtCustomerSelect');
    if (select) {
        select.innerHTML = '<option value="">اختر عميل</option>';
        customers.forEach(c => { let opt = document.createElement('option'); opt.value = c.id; opt.innerText = c.name; select.appendChild(opt); });
    }
}
function renderSuppliersTable() {
    let tbody = document.querySelector('#suppliersTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        suppliers.forEach(s => {
            let row = tbody.insertRow();
            row.insertCell(0).innerText = s.name;
            row.insertCell(1).innerText = s.phone;
            row.insertCell(2).innerText = s.credit;
            let btn = document.createElement('button');
            btn.innerText = 'حذف';
            btn.onclick = () => { if (requireManager()) { suppliers = suppliers.filter(x => x.id !== s.id); saveSuppliers(); renderAll(); } };
            row.insertCell(3).appendChild(btn);
        });
    }
}
function renderEmployeesTable() {
    let tbody = document.querySelector('#employeesTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        employees.forEach(e => {
            let row = tbody.insertRow();
            row.insertCell(0).innerText = e.name;
            row.insertCell(1).innerText = e.role === 'manager' ? 'مدير' : 'كاشير';
            let btn = document.createElement('button');
            btn.innerText = 'حذف';
            btn.onclick = () => { if (requireManager()) { employees = employees.filter(x => x.name !== e.name); saveEmployees(); renderAll(); } };
            row.insertCell(2).appendChild(btn);
        });
    }
}
function renderInventoryLogs() {
    let container = document.getElementById('inventoryList');
    if (container) container.innerHTML = inventoryLogs.map(log => `<div>${log.date}: ${log.note}</div>`).join('');
}
function renderDashboard() {
    let totalSales = sales.reduce((s, inv) => s + inv.total, 0);
    let totalCustomers = customers.length;
    let lowStock = products.filter(p => p.stock < 5).length;
    document.getElementById('dashCards').innerHTML = `
        <div class="card"><h3>إجمالي المبيعات</h3><div class="value">${totalSales} ج.م</div></div>
        <div class="card"><h3>العملاء</h3><div class="value">${totalCustomers}</div></div>
        <div class="card"><h3>منتجات منخفضة</h3><div class="value">${lowStock}</div></div>
        <div class="card"><h3>الفواتير</h3><div class="value">${sales.length}</div></div>
    `;
    let ctx = document.getElementById('salesChart')?.getContext('2d');
    if (ctx && sales.length) {
        let last5 = sales.slice(-5).map(s => s.total);
        new Chart(ctx, { type: 'line', data: { labels: sales.slice(-5).map((_, i) => i + 1), datasets: [{ label: 'المبيعات', data: last5 }] } });
    }
    let recent = sales.slice(-5).reverse().map(s => `<li>${s.id} - ${s.total} ج.م - ${new Date(s.date).toLocaleDateString()}</li>`).join('');
    document.getElementById('recentSales').innerHTML = recent;
}
function renderReports() {
    let totalSales = sales.reduce((s, inv) => s + inv.total, 0);
    let totalDebts = customers.reduce((s, c) => s + c.debt, 0);
    document.getElementById('reportSummary').innerHTML = `<p>إجمالي المبيعات: ${totalSales} ج.م</p><p>إجمالي المديونيات: ${totalDebts} ج.م</p>`;
    let ctx = document.getElementById('salesTrendChart')?.getContext('2d');
    if (ctx && sales.length) {
        let monthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        sales.forEach(s => { let m = new Date(s.date).getMonth(); monthly[m] += s.total; });
        new Chart(ctx, { type: 'bar', data: { labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'], datasets: [{ label: 'المبيعات الشهرية', data: monthly }] } });
    }
}
function renderPosProducts() {
    let container = document.getElementById('posProductsList');
    if (!container) return;
    let search = document.getElementById('posSearch').value.toLowerCase();
    let filtered = products.filter(p => p.name.toLowerCase().includes(search) || (p.barcode && p.barcode.includes(search)));
    container.innerHTML = '';
    filtered.forEach(p => {
        let div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `${p.name} - ${p.price} ج.م (متبقي ${p.stock}) <button class="addToCartBtn" data-id="${p.id}">➕</button>`;
        container.appendChild(div);
    });
    document.querySelectorAll('.addToCartBtn').forEach(btn => {
        btn.onclick = () => {
            let id = parseInt(btn.getAttribute('data-id'));
            let product = products.find(p => p.id === id);
            if (product && product.stock > 0) {
                let cartItem = cart.find(i => i.id === id);
                if (cartItem) cartItem.qty++;
                else cart.push({ ...product, qty: 1 });
                renderCart();
            } else alert('غير متوفر');
        };
    });
}
function renderCart() {
    let container = document.getElementById('cartItems');
    let totalSpan = document.getElementById('cartTotal');
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = 'السلة فارغة'; totalSpan.innerText = '0'; return; }
    let total = 0;
    container.innerHTML = '';
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        let div = document.createElement('div');
        div.innerHTML = `${item.name} x ${item.qty} = ${item.price * item.qty} ج.م <button class="removeItem" data-idx="${idx}">🗑️</button>`;
        container.appendChild(div);
    });
    totalSpan.innerText = total;
    document.querySelectorAll('.removeItem').forEach(btn => {
        btn.onclick = () => { let idx = parseInt(btn.getAttribute('data-idx')); cart.splice(idx, 1); renderCart(); };
    });
}
function completeSale() {
    if (!currentUser) { alert('يجب تسجيل الدخول أولاً'); return; }
    if (cart.length === 0) return;
    let customerId = document.getElementById('customerSelect').value;
    let total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    for (let item of cart) {
        let product = products.find(p => p.id === item.id);
        if (product) product.stock -= item.qty;
    }
    saveProducts();
    let invoice = {
        id: 'INV-' + Date.now(),
        date: new Date().toISOString(),
        customerId: customerId || null,
        items: JSON.parse(JSON.stringify(cart)),
        total: total,
        user: currentUser.name
    };
    sales.push(invoice);
    saveSales();
    if (customerId) {
        let cust = customers.find(c => c.id == customerId);
        if (cust) cust.debt += total;
        saveCustomers();
    }
    // طباعة فاتورة PDF
    let printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl"><head><title>فاتورة ${invoice.id}</title><style>body{font-family:sans-serif;}</style></head>
        <body><h1>فاتورة البيع</h1><p>رقم: ${invoice.id}</p><p>التاريخ: ${new Date().toLocaleString()}</p>
        <table border="1"><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
        ${invoice.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td><td>${i.price * i.qty}</td></tr>`).join('')}
        </table><h3>الإجمالي: ${invoice.total} ج.م</h3></body></html>
    `);
    printWindow.print();
    cart = [];
    renderCart();
    renderAll();
    alert('تم البيع وطباعة الفاتورة');
}

// أحداث الأزرار
document.getElementById('addProductBtn')?.addEventListener('click', () => {
    if (!requireManager()) return;
    let name = document.getElementById('prodName').value;
    let barcode = document.getElementById('prodBarcode').value;
    let price = parseFloat(document.getElementById('prodPrice').value);
    let stock = parseInt(document.getElementById('prodStock').value);
    let shelf = document.getElementById('prodShelf').value;
    if (!name || isNaN(price)) return;
    let existing = products.find(p => p.name === name);
    if (existing) { existing.price = price; existing.stock = stock; existing.shelf = shelf; existing.barcode = barcode; }
    else { products.push({ id: Date.now(), name, barcode, price, stock, shelf }); }
    saveProducts();
    renderAll();
});
document.getElementById('addCustomerBtn')?.addEventListener('click', () => {
    if (!requireManager()) return;
    let name = document.getElementById('custName').value;
    let phone = document.getElementById('custPhone').value;
    let debt = parseFloat(document.getElementById('custDebt').value) || 0;
    if (!name) return;
    customers.push({ id: Date.now(), name, phone, debt });
    saveCustomers();
    renderAll();
});
document.getElementById('payDebtBtn')?.addEventListener('click', () => {
    let custId = parseInt(document.getElementById('debtCustomerSelect').value);
    let amount = parseFloat(document.getElementById('paymentAmount').value);
    let cust = customers.find(c => c.id === custId);
    if (cust && amount > 0) { cust.debt = Math.max(0, cust.debt - amount); saveCustomers(); renderAll(); alert('تم التسديد'); }
    else alert('بيانات غير صحيحة');
});
document.getElementById('addSupplierBtn')?.addEventListener('click', () => {
    if (!requireManager()) return;
    let name = document.getElementById('supName').value;
    let phone = document.getElementById('supPhone').value;
    let credit = parseFloat(document.getElementById('supCredit').value) || 0;
    if (!name) return;
    suppliers.push({ id: Date.now(), name, phone, credit });
    saveSuppliers();
    renderAll();
});
document.getElementById('addEmployeeBtn')?.addEventListener('click', () => {
    if (!requireManager()) return;
    let name = document.getElementById('empName').value;
    let role = document.getElementById('empRole').value;
    let pass = document.getElementById('empPassword').value;
    if (!name || !pass) return;
    employees.push({ name, role, password: pass });
    saveEmployees();
    renderAll();
});
document.getElementById('loginBtn')?.addEventListener('click', () => {
    let name = document.getElementById('loginName').value;
    let pass = document.getElementById('loginPass').value;
    let user = employees.find(e => e.name === name && e.password === pass);
    if (user) {
        currentUser = { name: user.name, role: user.role };
        document.getElementById('currentUser').innerHTML = `مرحباً ${currentUser.name} (${currentUser.role === 'manager' ? 'مدير' : 'كاشير'})`;
        alert('تم الدخول');
        renderAll();
    } else alert('خطأ');
});
document.getElementById('completeSale')?.addEventListener('click', completeSale);
document.getElementById('startInventoryBtn')?.addEventListener('click', () => {
    if (!requireManager()) return;
    let note = prompt('ملاحظات الجرد');
    if (note) { inventoryLogs.push({ date: new Date().toLocaleString(), note }); saveInventoryLogs(); renderInventoryLogs(); }
});
document.getElementById('resetDataBtn')?.addEventListener('click', () => { if (confirm('مسح كل البيانات؟')) { localStorage.clear(); location.reload(); } });
document.getElementById('posSearch')?.addEventListener('input', () => renderPosProducts());
document.getElementById('startScanner')?.addEventListener('click', () => {
    let html5QrCode = new Html5Qrcode("barcode-reader");
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
        document.getElementById('barcodeResult').innerHTML = `الباركود: ${decodedText}`;
        let product = products.find(p => p.barcode === decodedText);
        if (product && product.stock > 0) {
            let cartItem = cart.find(i => i.id === product.id);
            if (cartItem) cartItem.qty++;
            else cart.push({ ...product, qty: 1 });
            renderCart();
            alert(`تمت إضافة ${product.name}`);
        } else alert('منتج غير موجود');
        html5QrCode.stop();
    }, (err) => console.warn(err));
    window.currentScanner = html5QrCode;
});
document.getElementById('stopScanner')?.addEventListener('click', () => { if (window.currentScanner) window.currentScanner.stop(); });

// القائمة الجانبية
const sidebar = document.getElementById('sidebar');
document.getElementById('menuToggle').onclick = () => sidebar.classList.add('open');
document.getElementById('closeSidebar').onclick = () => sidebar.classList.remove('open');
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        let tabId = item.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        sidebar.classList.remove('open');
        renderAll();
    });
});

function renderAll() {
    renderProductsTable();
    renderCustomersTable();
    renderSuppliersTable();
    renderEmployeesTable();
    renderInventoryLogs();
    renderDashboard();
    renderReports();
    renderPosProducts();
    renderCart();
    let select = document.getElementById('customerSelect');
    if (select) {
        select.innerHTML = '<option value="">بدون عميل</option>';
        customers.forEach(c => { let opt = document.createElement('option'); opt.value = c.id; opt.innerText = c.name; select.appendChild(opt); });
    }
}
loadData();
renderAll();
