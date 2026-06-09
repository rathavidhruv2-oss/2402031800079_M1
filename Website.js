// ============================================================
//  Sweet Bakery — script.js
//  LocalStorage based persistent data
// ============================================================

// ---- CREDENTIALS ----
var ADMIN_USER = 'admin';
var ADMIN_PASS = 'admin123';

var CUSTOMERS_LOGIN = [
    { username: 'dhruv', password: 'dhruv123', name: 'Dhruv' },
    { username: 'riya',  password: 'riya123',  name: 'Riya'  }
];

// ---- CURRENT LOGGED IN USER ----
var currentUser = null;   // { type: 'admin' } or { type: 'customer', name: '...' }

// ---- DEFAULT DATA (first time only) ----
var DEFAULT_PRODUCTS = [
    { id:1, name:'Chocolate Cake',   cat:'Cakes',    price:350, stock:10, desc:'Rich chocolate layered cake.',     emoji:'🎂' },
    { id:2, name:'Butter Bread',     cat:'Bread',    price:50,  stock:30, desc:'Soft and fresh butter bread.',     emoji:'🍞' },
    { id:3, name:'Croissant',        cat:'Pastries', price:80,  stock:25, desc:'Flaky golden croissant.',          emoji:'🥐' },
    { id:4, name:'Choco Cookies',    cat:'Cookies',  price:120, stock:5,  desc:'Crispy chocolate chip cookies.',   emoji:'🍪' },
    { id:5, name:'Blueberry Muffin', cat:'Muffins',  price:90,  stock:8,  desc:'Fresh blueberry muffin.',         emoji:'🧁' },
    { id:6, name:'Red Velvet Cake',  cat:'Cakes',    price:450, stock:8,  desc:'Classic red velvet with cream.',  emoji:'🎂' },
    { id:7, name:'Vanilla Cupcake',  cat:'Muffins',  price:60,  stock:15, desc:'Soft vanilla cupcake with icing.',emoji:'🧁' },
    { id:8, name:'Garlic Bread',     cat:'Bread',    price:70,  stock:20, desc:'Toasted garlic bread.',            emoji:'🍞' }
];

// No default customers — starts empty
var DEFAULT_CUSTOMERS = [];

// ---- LIVE DATA ----
var products   = [];
var customers  = [];
var orders     = [];
var nextProdId = 9;
var nextCustId = 4;
var nextOrdId  = 1;
var editProdId = null;
var editCustId = null;
var selProdId  = null;   // product selected in customer order form

// ============================================================
//  LOCAL STORAGE — SAVE & LOAD
// ============================================================
function saveAll() {
    localStorage.setItem('sb_products',  JSON.stringify(products));
    localStorage.setItem('sb_customers', JSON.stringify(customers));
    localStorage.setItem('sb_orders',    JSON.stringify(orders));
    localStorage.setItem('sb_ids', JSON.stringify({
        nextProdId:nextProdId,
        nextCustId:nextCustId,
        nextOrdId:nextOrdId
    }));
    // mark that data has been initialized
    localStorage.setItem('sb_initialized', '1');
}

function loadAll() {
    var inited = localStorage.getItem('sb_initialized');

    // Products — load from storage or use defaults
    var savedP = localStorage.getItem('sb_products');
    products = savedP ? JSON.parse(savedP) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

    // Customers — load from storage
    // If not initialized yet, start empty (remove old defaults)
    var savedC = localStorage.getItem('sb_customers');
    if (!inited) {
        // First time ever — start fresh, no default customers
        customers = [];
    } else {
        customers = savedC ? JSON.parse(savedC) : [];
    }

    // Orders — always load from storage so old orders come back on relogin
    var savedO = localStorage.getItem('sb_orders');
    orders = savedO ? JSON.parse(savedO) : [];

    // ID counters
    var savedIds = localStorage.getItem('sb_ids');
    if (savedIds) {
        var ids = JSON.parse(savedIds);
        nextProdId = ids.nextProdId || 9;
        nextCustId = ids.nextCustId || 1;
        nextOrdId  = ids.nextOrdId  || 1;
    } else {
        nextProdId = 9;
        nextCustId = 1;
        nextOrdId  = 1;
    }

    // Save immediately to persist the clean state
    saveAll();
}

// ---- One-time cleanup: remove old default customers ----
(function cleanup() {
    var OLD_DEFAULT_NAMES = ['Rahul Sharma', 'Priya Verma', 'Amit Singh'];
    var savedC = localStorage.getItem('sb_customers');
    if (savedC) {
        var arr = JSON.parse(savedC);
        // Remove any customer whose name matches old defaults AND id is 1/2/3
        var cleaned = arr.filter(function(c) {
            return !(OLD_DEFAULT_NAMES.indexOf(c.name) !== -1 && c.id <= 3);
        });
        if (cleaned.length !== arr.length) {
            // Old defaults were found — remove them
            localStorage.setItem('sb_customers', JSON.stringify(cleaned));
        }
    }
    // Also clear old order data from previous version keys
    ['bakery_products','bakery_customers','bakery_orders','bakery_ids'].forEach(function(k){
        localStorage.removeItem(k);
    });
})();

// Load on start
loadAll();

// ============================================================
//  LOGIN / LOGOUT
// ============================================================
function doLogin(type) {
    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value.trim();
    var err  = document.getElementById('loginErr');
    err.style.display = 'none';

    if (!user || !pass) {
        err.innerHTML = '⚠️ Please enter username and password!';
        err.style.display = 'block';
        return;
    }

    if (type === 'admin') {
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            currentUser = { type: 'admin' };
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display  = 'block';
            adminPage('adminHome');
            toast('Welcome, Admin! 🏪');
        } else {
            err.innerHTML = '❌ Wrong admin credentials!';
            err.style.display = 'block';
        }
        return;
    }

    if (type === 'customer') {
        var found = null;
        for (var i = 0; i < CUSTOMERS_LOGIN.length; i++) {
            if (CUSTOMERS_LOGIN[i].username === user && CUSTOMERS_LOGIN[i].password === pass) {
                found = CUSTOMERS_LOGIN[i];
                break;
            }
        }
        if (found) {
            currentUser = { type: 'customer', name: found.name };
            document.getElementById('loginScreen').style.display   = 'none';
            document.getElementById('customerPanel').style.display = 'block';
            // Set name in nav and dashboard
            document.getElementById('custNavName').innerText = '👋 ' + found.name;
            custPage('custDash');
            toast('Welcome, ' + found.name + '! 😊');
        } else {
            err.innerHTML = '❌ Wrong customer credentials!';
            err.style.display = 'block';
        }
        return;
    }
}

function doLogout() {
    currentUser = null;
    document.getElementById('adminPanel').style.display    = 'none';
    document.getElementById('customerPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display   = 'block';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').style.display = 'none';
    toast('Logged out!');
}

// ============================================================
//  ADMIN PAGE NAVIGATION
// ============================================================
function adminPage(id) {
    var pages = document.querySelectorAll('#adminPanel .apage');
    for (var i = 0; i < pages.length; i++) pages[i].style.display = 'none';
    document.getElementById(id).style.display = 'block';
    if (id === 'adminHome')      loadAdminHome();
    if (id === 'adminProducts')  renderAdminProducts();
    if (id === 'adminOrders')    renderOrders();
    if (id === 'adminCustomers') renderCustomers();
}

// ============================================================
//  ADMIN HOME — KPI + PRODUCTS
// ============================================================
function loadAdminHome() {
    var rev = 0; var pend = 0; var acc = 0; var del = 0;
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].status === 'Delivered') rev += orders[i].total;
        if (orders[i].status === 'Pending')   pend++;
        if (orders[i].status === 'Accepted')  acc++;
        if (orders[i].status === 'Delivered') del++;
    }
    document.getElementById('adminKpi').innerHTML =
        kpiCard('📦', orders.length, 'Total Orders', '#e3f2fd') +
        kpiCard('💰', '₹' + rev, 'Revenue', '#e8f5e9') +
        kpiCard('⏳', pend, 'Pending', '#fff9c4') +
        kpiCard('✅', del, 'Delivered', '#e0f2f1') +
        kpiCard('🛒', products.length, 'Products', '#fce4ec') +
        kpiCard('👥', customers.length, 'Customers', '#f3e5f5');

    var grid = document.getElementById('adminHomeProd');
    grid.innerHTML = '';
    for (var i = 0; i < products.length && i < 4; i++) {
        grid.innerHTML += adminProdCard(products[i]);
    }
}

function kpiCard(icon, val, label, bg) {
    return '<div class="kpi-card" style="border-top:4px solid #42a5f5;">' +
        '<div class="kpi-icon" style="background:' + bg + '">' + icon + '</div>' +
        '<div class="kpi-val">' + val + '</div>' +
        '<div class="kpi-label">' + label + '</div>' +
    '</div>';
}

// ============================================================
//  ADMIN PRODUCTS
// ============================================================
function renderAdminProducts() {
    var grid   = document.getElementById('adminProdGrid');
    var search = (document.getElementById('prodSearch').value || '').toLowerCase();
    var cat    = document.getElementById('prodCatFilter').value;
    grid.innerHTML = '';
    var found = false;
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (search && p.name.toLowerCase().indexOf(search) === -1) continue;
        if (cat && p.cat !== cat) continue;
        grid.innerHTML += adminProdCard(p);
        found = true;
    }
    if (!found) grid.innerHTML = '<p class="no-data">No products found.</p>';
}

function adminProdCard(p) {
    var stk = p.stock === 0 ? '<span class="badge badge-red">Out of Stock</span>' :
              p.stock <= 5  ? '<span class="badge badge-yellow">Low: ' + p.stock + '</span>' :
                              '<span class="badge badge-blue">' + p.stock + ' left</span>';
    return '<div class="prod-card">' +
        '<div class="prod-emoji">' + p.emoji + '</div>' +
        '<div class="prod-body">' +
            '<div class="prod-name">' + p.name + '</div>' +
            '<span class="prod-cat">' + p.cat + '</span>' +
            '<div class="prod-price">₹' + p.price + '</div>' +
            stk +
            '<p class="prod-desc">' + p.desc + '</p>' +
            '<div class="prod-actions">' +
                '<button class="btn-edit" onclick="editProd(' + p.id + ')">✏️ Edit</button>' +
                '<button class="btn-del"  onclick="deleteProd(' + p.id + ')">🗑️ Delete</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function filterProds() { renderAdminProducts(); }

function openProdForm() {
    editProdId = null;
    document.getElementById('prodFormTitle').innerText = '➕ Add Product';
    document.getElementById('pName').value  = '';
    document.getElementById('pCat').value   = 'Cakes';
    document.getElementById('pPrice').value = '';
    document.getElementById('pStock').value = '';
    document.getElementById('pDesc').value  = '';
    document.getElementById('prodForm').style.display = 'block';
    document.getElementById('prodForm').scrollIntoView({ behavior:'smooth' });
}

function editProd(id) {
    var p = byId(products, id);
    if (!p) return;
    editProdId = id;
    document.getElementById('prodFormTitle').innerText = '✏️ Edit Product';
    document.getElementById('pName').value  = p.name;
    document.getElementById('pCat').value   = p.cat;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pDesc').value  = p.desc;
    document.getElementById('prodForm').style.display = 'block';
    document.getElementById('prodForm').scrollIntoView({ behavior:'smooth' });
}

function saveProd() {
    var name  = document.getElementById('pName').value.trim();
    var cat   = document.getElementById('pCat').value;
    var price = parseFloat(document.getElementById('pPrice').value);
    var stock = parseInt(document.getElementById('pStock').value);
    var desc  = document.getElementById('pDesc').value.trim();
    if (!name)                     { toast('Enter product name!'); return; }
    if (!price || price <= 0)      { toast('Enter valid price!');  return; }
    if (isNaN(stock) || stock < 0) { toast('Enter valid stock!');  return; }
    var emojiMap = { Cakes:'🎂', Bread:'🍞', Pastries:'🥐', Cookies:'🍪', Muffins:'🧁' };
    var emoji = emojiMap[cat] || '🍞';
    if (editProdId) {
        var p = byId(products, editProdId);
        p.name=name; p.cat=cat; p.price=price; p.stock=stock; p.desc=desc; p.emoji=emoji;
        toast('Product updated! ✅');
    } else {
        products.push({ id:nextProdId++, name:name, cat:cat, price:price, stock:stock, desc:desc, emoji:emoji });
        toast('Product added! ✅');
    }
    saveAll();
    closeProdForm();
    renderAdminProducts();
}

function deleteProd(id) {
    if (!confirm('Delete this product?')) return;
    products = products.filter(function(p){ return p.id !== id; });
    saveAll();
    renderAdminProducts();
    toast('Product deleted.');
}

function closeProdForm() {
    document.getElementById('prodForm').style.display = 'none';
    editProdId = null;
}

// ============================================================
//  ADMIN ORDERS
// ============================================================
function renderOrders() {
    var tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = '';

    // KPIs
    var total=0, pend=0, acc=0, del=0, rej=0;
    for (var i=0; i<orders.length; i++) {
        total += orders[i].total;
        if (orders[i].status==='Pending')   pend++;
        if (orders[i].status==='Accepted')  acc++;
        if (orders[i].status==='Delivered') del++;
        if (orders[i].status==='Rejected')  rej++;
    }
    document.getElementById('orderKpi').innerHTML =
        kpiCard('📦', orders.length, 'Total', '#e3f2fd') +
        kpiCard('⏳', pend, 'Pending', '#fff9c4') +
        kpiCard('✅', acc,  'Accepted', '#e8f5e9') +
        kpiCard('🚚', del,  'Delivered', '#e0f2f1') +
        kpiCard('❌', rej,  'Rejected', '#fdecea') +
        kpiCard('💰', '₹'+total, 'Revenue', '#f3e5f5');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data-td">No orders yet.</td></tr>';
        return;
    }

    for (var i = orders.length - 1; i >= 0; i--) {
        var o = orders[i];
        var onlineTag = o.byCustomer ? '<span class="badge badge-blue">🌐 Online</span>' : '';
        var actions   = '';
        if (o.status === 'Pending') {
            actions = '<button class="btn-accept" onclick="acceptOrd(' + o.id + ')">✅ Accept</button>' +
                      '<button class="btn-reject" onclick="rejectOrd(' + o.id + ')">❌ Reject</button>';
        } else if (o.status === 'Accepted') {
            actions = '<button class="btn-deliver" onclick="deliverOrd(' + o.id + ')">🚚 Deliver</button>';
        } else {
            actions = '<span class="done-text">' + o.status + '</span>';
        }
        tbody.innerHTML +=
            '<tr>' +
            '<td><strong>#' + o.id + '</strong> ' + onlineTag + '</td>' +
            '<td>' + o.customer + '</td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.qty + '</td>' +
            '<td><strong>₹' + o.total + '</strong></td>' +
            '<td><span class="status-badge status-' + o.status.toLowerCase() + '">' + o.status + '</span></td>' +
            '<td class="action-cell">' +
                actions +
                ' <button class="btn-bill" onclick="showBill(' + o.id + ', \'billContent\', \'billWrap\')">🧾 Bill</button>' +
                ' <button class="btn-del"  onclick="deleteOrd(' + o.id + ')">🗑️</button>' +
            '</td>' +
            '</tr>';
    }
}

function openOrderForm() {
    var sel = document.getElementById('oProd');
    sel.innerHTML = '';
    for (var i=0; i<products.length; i++) {
        sel.innerHTML += '<option value="' + products[i].id + '">' + products[i].name + ' (₹' + products[i].price + ')</option>';
    }
    document.getElementById('oQty').value    = 1;
    document.getElementById('oStatus').value = 'Pending';
    calcOrderTotal();
    document.getElementById('orderForm').style.display = 'block';
    document.getElementById('billWrap').style.display  = 'none';
    document.getElementById('orderForm').scrollIntoView({ behavior:'smooth' });
}

function calcOrderTotal() {
    var pid = parseInt(document.getElementById('oProd').value);
    var qty = parseInt(document.getElementById('oQty').value) || 1;
    var p   = byId(products, pid);
    document.getElementById('oTotal').value = p ? '₹' + (p.price * qty) : '₹0';
}

function saveAdminOrder() {
    var pid    = parseInt(document.getElementById('oProd').value);
    var qty    = parseInt(document.getElementById('oQty').value);
    var status = document.getElementById('oStatus').value;
    if (!qty || qty <= 0) { toast('Enter valid quantity!'); return; }
    var p = byId(products, pid);
    if (!p)           { toast('Product not found!');  return; }
    if (p.stock < qty){ toast('Not enough stock! Available: ' + p.stock); return; }
    orders.push({ id:nextOrdId++, customer:'Admin', product:p.name, qty:qty, price:p.price, total:p.price*qty, status:status, byCustomer:false });
    p.stock -= qty;
    saveAll();
    closeOrderForm();
    renderOrders();
    toast('Order placed! ✅');
}

function acceptOrd(id) {
    var o = byId(orders, id);
    if (o) { o.status='Accepted'; saveAll(); renderOrders(); toast('Order #'+id+' Accepted! ✅'); }
}

function rejectOrd(id) {
    if (!confirm('Reject this order?')) return;
    var o = byId(orders, id);
    if (o) {
        var p = products.find(function(x){ return x.name === o.product; });
        if (p) p.stock += o.qty;
        o.status = 'Rejected';
        saveAll(); renderOrders(); toast('Order #'+id+' Rejected. ❌');
    }
}

function deliverOrd(id) {
    var o = byId(orders, id);
    if (o) { o.status='Delivered'; saveAll(); renderOrders(); toast('Order #'+id+' Delivered! 🚚'); }
}

function deleteOrd(id) {
    if (!confirm('Delete this order?')) return;
    orders = orders.filter(function(o){ return o.id !== id; });
    saveAll(); renderOrders(); toast('Order deleted.');
}

function closeOrderForm() {
    document.getElementById('orderForm').style.display = 'none';
}

// ============================================================
//  BILL / INVOICE
// ============================================================
function showBill(orderId, contentId, wrapId) {
    var o = byId(orders, orderId);
    if (!o) return;
    var tax = Math.round(o.total * 0.05);
    var grand = o.total + tax;
    var d = new Date();
    var dt = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
    document.getElementById(contentId).innerHTML =
        '<h2>🍞 Sweet Bakery</h2>' +
        '<p class="bill-sub">12 Baker Street, Delhi | +91 98765 43210</p>' +
        '<hr class="bill-hr">' +
        '<div class="bill-row"><span><b>Invoice #</b></span><span>INV-' + orderId + '</span></div>' +
        '<div class="bill-row"><span><b>Date</b></span><span>' + dt + '</span></div>' +
        '<div class="bill-row"><span><b>Customer</b></span><span>' + o.customer + '</span></div>' +
        '<hr class="bill-hr">' +
        '<div class="bill-row"><span><b>Item</b></span><span><b>Amount</b></span></div>' +
        '<div class="bill-row"><span>' + o.product + ' × ' + o.qty + ' @ ₹' + o.price + '</span><span>₹' + o.total + '</span></div>' +
        '<hr class="bill-hr">' +
        '<div class="bill-row"><span>Subtotal</span><span>₹' + o.total + '</span></div>' +
        '<div class="bill-row"><span>GST (5%)</span><span>₹' + tax + '</span></div>' +
        '<hr class="bill-hr">' +
        '<div class="bill-row bill-grand"><span>Grand Total</span><span>₹' + grand + '</span></div>' +
        '<p class="bill-footer">Thank you for your order! 😊</p>';
    document.getElementById(wrapId).style.display = 'block';
    document.getElementById(wrapId).scrollIntoView({ behavior:'smooth' });
}

function printBill(contentId) {
    var html = document.getElementById(contentId).innerHTML;
    var win  = window.open('','','width=520,height=720');
    win.document.open();
    win.document.write('<!DOCTYPE html><html><head><title>Bill</title><style>' +
        'body{font-family:Arial,sans-serif;padding:32px;color:#1a2a3a;}' +
        'h2{text-align:center;color:#0a3d6b;font-size:22px;}' +
        '.bill-sub{text-align:center;color:#90a4ae;font-size:12px;margin-bottom:14px;}' +
        '.bill-hr{border:none;border-top:1px dashed #b3d4f5;margin:12px 0;}' +
        '.bill-row{display:flex;justify-content:space-between;padding:5px 0;font-size:14px;}' +
        '.bill-grand{font-weight:800;font-size:17px;color:#0a3d6b;}' +
        '.bill-footer{text-align:center;margin-top:16px;color:#b0bec5;font-size:12px;}' +
        '</style></head><body>' + html + '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function(){ win.print(); }, 400);
}

// ============================================================
//  ADMIN CUSTOMERS
// ============================================================
function renderCustomers() {
    var tbody = document.getElementById('custTableBody');
    tbody.innerHTML = '';
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data-td">No customers yet.</td></tr>';
        return;
    }
    for (var i=0; i<customers.length; i++) {
        var c = customers[i];
        tbody.innerHTML +=
            '<tr>' +
            '<td>' + c.id + '</td>' +
            '<td><strong>' + c.name + '</strong></td>' +
            '<td>' + c.phone + '</td>' +
            '<td>' + c.email + '</td>' +
            '<td class="action-cell">' +
                '<button class="btn-edit" onclick="editCust(' + c.id + ')">✏️ Edit</button>' +
                '<button class="btn-del"  onclick="deleteCust(' + c.id + ')">🗑️</button>' +
            '</td>' +
            '</tr>';
    }
}

function openCustForm() {
    editCustId = null;
    document.getElementById('custFormTitle').innerText = '➕ Add Customer';
    document.getElementById('cName').value  = '';
    document.getElementById('cPhone').value = '';
    document.getElementById('cEmail').value = '';
    document.getElementById('custForm').style.display = 'block';
    document.getElementById('custForm').scrollIntoView({ behavior:'smooth' });
}

function editCust(id) {
    var c = byId(customers, id);
    if (!c) return;
    editCustId = id;
    document.getElementById('custFormTitle').innerText = '✏️ Edit Customer';
    document.getElementById('cName').value  = c.name;
    document.getElementById('cPhone').value = c.phone;
    document.getElementById('cEmail').value = c.email;
    document.getElementById('custForm').style.display = 'block';
    document.getElementById('custForm').scrollIntoView({ behavior:'smooth' });
}

function saveCust() {
    var name  = document.getElementById('cName').value.trim();
    var phone = document.getElementById('cPhone').value.trim();
    var email = document.getElementById('cEmail').value.trim();
    if (!name)  { toast('Enter customer name!');  return; }
    if (!phone) { toast('Enter phone number!');   return; }
    if (editCustId) {
        var c = byId(customers, editCustId);
        c.name=name; c.phone=phone; c.email=email;
        toast('Customer updated! ✅');
    } else {
        customers.push({ id:nextCustId++, name:name, phone:phone, email:email });
        toast('Customer added! ✅');
    }
    saveAll(); closeCustForm(); renderCustomers();
}

function deleteCust(id) {
    if (!confirm('Delete this customer?')) return;
    customers = customers.filter(function(c){ return c.id !== id; });
    saveAll(); renderCustomers(); toast('Customer deleted.');
}

function closeCustForm() {
    document.getElementById('custForm').style.display = 'none';
    editCustId = null;
}

// ============================================================
//  CONTACT
// ============================================================
function sendMsg() {
    var n = document.getElementById('msgName').value.trim();
    var e = document.getElementById('msgEmail').value.trim();
    var m = document.getElementById('msgText').value.trim();
    if (!n || !e || !m) { toast('Fill all fields!'); return; }
    document.getElementById('msgOk').style.display = 'block';
    document.getElementById('msgName').value  = '';
    document.getElementById('msgEmail').value = '';
    document.getElementById('msgText').value  = '';
    toast('Message sent! ✅');
}

// ============================================================
//  CUSTOMER PANEL NAVIGATION
// ============================================================
function custPage(id) {
    var pages = document.querySelectorAll('#customerPanel .cpage');
    for (var i=0; i<pages.length; i++) pages[i].style.display = 'none';
    document.getElementById(id).style.display = 'block';
    if (id === 'custDash')   loadCustDash();
    if (id === 'custShop')   renderShop();
    if (id === 'custOrders') renderCustOrders();
}

// ============================================================
//  CUSTOMER DASHBOARD
// ============================================================
function loadCustDash() {
    if (!currentUser) return;
    var name = currentUser.name;

    // Set avatar and name
    document.getElementById('custAvatar').innerText   = name.charAt(0).toUpperCase();
    document.getElementById('custDashName').innerText = 'Hello, ' + name + '! 👋';

    // My orders
    var mine = orders.filter(function(o){ return o.customer === name; });
    var myTotal=0, myPend=0, myDel=0;
    for (var i=0; i<mine.length; i++) {
        myTotal += mine[i].total;
        if (mine[i].status==='Pending')   myPend++;
        if (mine[i].status==='Delivered') myDel++;
    }

    // Stats
    document.getElementById('custStats').innerHTML =
        custStatCard('📦', mine.length, 'My Orders',  '#e3f2fd') +
        custStatCard('⏳', myPend,       'Pending',    '#fff9c4') +
        custStatCard('✅', myDel,        'Delivered',  '#e0f2f1') +
        custStatCard('💰', '₹'+myTotal,  'Total Spent','#fce4ec');

    // Recent orders (last 3)
    var recent = mine.slice(-3).reverse();
    var recEl  = document.getElementById('custRecentOrders');
    if (recent.length === 0) {
        recEl.innerHTML =
            '<div class="empty-box">' +
                '<div style="font-size:48px;">🛒</div>' +
                '<p>No orders yet!</p>' +
                '<button onclick="custPage(\'custShop\')" class="btn-shop-now">Browse Products</button>' +
            '</div>';
    } else {
        var html = '<div class="recent-list">';
        for (var i=0; i<recent.length; i++) {
            var o = recent[i];
            html +=
                '<div class="recent-card">' +
                    '<div class="rc-left">' +
                        '<div class="rc-id">#' + o.id + '</div>' +
                        '<div class="rc-prod">' + o.product + '</div>' +
                        '<div class="rc-qty">Qty: ' + o.qty + '</div>' +
                    '</div>' +
                    '<div class="rc-right">' +
                        '<div class="rc-total">₹' + o.total + '</div>' +
                        '<span class="status-badge status-' + o.status.toLowerCase() + '">' + o.status + '</span>' +
                        '<button class="btn-bill" style="margin-top:5px;font-size:11px;padding:3px 9px;" ' +
                            'onclick="showBill(' + o.id + ',\'custBillContent\',\'custBillWrap\'); custPage(\'custOrders\')">🧾 Bill</button>' +
                    '</div>' +
                '</div>';
        }
        html += '</div>';
        if (mine.length > 3) {
            html += '<div style="text-align:center;margin-top:14px;">' +
                '<a href="#" onclick="custPage(\'custOrders\')" class="view-all-link">View all ' + mine.length + ' orders →</a>' +
                '</div>';
        }
        recEl.innerHTML = html;
    }

    // Featured products
    var featGrid = document.getElementById('custFeatured');
    featGrid.innerHTML = '';
    var count = 0;
    for (var i=0; i<products.length && count<4; i++) {
        if (products[i].stock > 0) {
            featGrid.innerHTML += custProdCard(products[i]);
            count++;
        }
    }
    if (count === 0) featGrid.innerHTML = '<p class="no-data">No products available right now.</p>';
}

function custStatCard(icon, val, label, bg) {
    return '<div class="cust-stat-card">' +
        '<div class="csc-icon" style="background:' + bg + '">' + icon + '</div>' +
        '<div><div class="csc-val">' + val + '</div><div class="csc-label">' + label + '</div></div>' +
    '</div>';
}

// ============================================================
//  CUSTOMER SHOP
// ============================================================
function renderShop() {
    var grid   = document.getElementById('shopGrid');
    var search = (document.getElementById('shopSearch').value || '').toLowerCase();
    var cat    = document.getElementById('shopCat').value;
    grid.innerHTML = '';
    var found = false;
    for (var i=0; i<products.length; i++) {
        var p = products[i];
        if (search && p.name.toLowerCase().indexOf(search) === -1) continue;
        if (cat && p.cat !== cat) continue;
        grid.innerHTML += custProdCard(p);
        found = true;
    }
    if (!found) grid.innerHTML = '<p class="no-data">No products found.</p>';
}

function custProdCard(p) {
    var stk = p.stock === 0 ? '<span class="badge badge-red">Out of Stock</span>' :
              p.stock <= 5  ? '<span class="badge badge-yellow">Only ' + p.stock + ' left!</span>' :
                              '<span class="badge badge-green">' + p.stock + ' in stock</span>';
    var btn = p.stock === 0
        ? '<button class="btn-order-disabled" disabled>Out of Stock</button>'
        : '<button class="btn-order" onclick="openCustOrder(' + p.id + ')">🛒 Order Now</button>';
    return '<div class="prod-card">' +
        '<div class="prod-emoji">' + p.emoji + '</div>' +
        '<div class="prod-body">' +
            '<div class="prod-name">' + p.name + '</div>' +
            '<span class="prod-cat">' + p.cat + '</span>' +
            '<div class="prod-price">₹' + p.price + '</div>' +
            stk +
            '<p class="prod-desc">' + p.desc + '</p>' +
            btn +
        '</div>' +
    '</div>';
}

function openCustOrder(prodId) {
    var p = byId(products, prodId);
    if (!p) return;
    selProdId = prodId;
    document.getElementById('coProduct').value = p.name;
    document.getElementById('coPrice').value   = '₹' + p.price;
    document.getElementById('coQty').value     = 1;
    document.getElementById('coTotal').value   = '₹' + p.price;
    document.getElementById('custOrderForm').style.display = 'block';
    document.getElementById('custOrderForm').scrollIntoView({ behavior:'smooth' });
}

function calcCustTotal() {
    var p   = byId(products, selProdId);
    var qty = parseInt(document.getElementById('coQty').value) || 1;
    document.getElementById('coTotal').value = p ? '₹' + (p.price * qty) : '';
}

function placeCustOrder() {
    if (!currentUser) { toast('Not logged in!'); return; }
    var p   = byId(products, selProdId);
    var qty = parseInt(document.getElementById('coQty').value);
    if (!p)           { toast('No product selected!'); return; }
    if (!qty || qty<1){ toast('Enter valid quantity!'); return; }
    if (p.stock < qty){ toast('Only ' + p.stock + ' in stock!'); return; }
    orders.push({
        id:         nextOrdId++,
        customer:   currentUser.name,
        product:    p.name,
        qty:        qty,
        price:      p.price,
        total:      p.price * qty,
        status:     'Pending',
        byCustomer: true
    });
    p.stock -= qty;
    saveAll();
    document.getElementById('custOrderForm').style.display = 'none';
    selProdId = null;
    toast('Order placed! 🎉');
    custPage('custOrders');
}

// ============================================================
//  CUSTOMER ORDERS
// ============================================================
function renderCustOrders() {
    if (!currentUser) return;
    var name  = currentUser.name;
    var tbody = document.getElementById('custOrdersBody');
    tbody.innerHTML = '';
    var mine = orders.filter(function(o){ return o.customer === name; }).reverse();
    if (mine.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data-td">No orders yet. Go to Shop! 🛍️</td></tr>';
        return;
    }
    for (var i=0; i<mine.length; i++) {
        var o = mine[i];
        tbody.innerHTML +=
            '<tr>' +
            '<td><strong>#' + o.id + '</strong></td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.qty + '</td>' +
            '<td><strong>₹' + o.total + '</strong></td>' +
            '<td><span class="status-badge status-' + o.status.toLowerCase() + '">' + o.status + '</span></td>' +
            '<td><button class="btn-bill" onclick="showBill(' + o.id + ',\'custBillContent\',\'custBillWrap\')">🧾 Bill</button></td>' +
            '</tr>';
    }
}

// ============================================================
//  TOAST NOTIFICATION
// ============================================================
var toastTimer = null;
function toast(msg) {
    var el = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    el.style.display = 'block';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.style.display = 'none'; }, 2800);
}

// ============================================================
//  HELPERS
// ============================================================
function byId(arr, id) {
    for (var i=0; i<arr.length; i++) { if (arr[i].id === id) return arr[i]; }
    return null;
}
