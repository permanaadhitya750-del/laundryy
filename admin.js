let orders = [];
let isLoggedIn = false;

const priceList = { 'Cuci Kering': 8000, 'Cuci Setrika': 11000, 'Express 4 Jam': 18000 };

function loadOrders() {
    const stored = localStorage.getItem('queen_laundry_orders');
    if (stored) {
        orders = JSON.parse(stored);
    } else {
        orders = [
            { id_laundry: 'QL-001', nama: 'Budi Santoso', phone: '08123456789', status: 'Diproses', layanan: 'Cuci Setrika', berat: 5, total: 55000, catatan: 'Harap hati-hati dengan baju batik', payment: 'Lunas', createdAt: new Date().toISOString(), estimasiSelesai: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
            { id_laundry: 'QL-002', nama: 'Siti Rahayu', phone: '08765432100', status: 'Antri', layanan: 'Cuci Kering', berat: 3, total: 24000, catatan: 'Pakai pewangi lavender', payment: 'Belum Lunas', createdAt: new Date().toISOString(), estimasiSelesai: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id_laundry: 'QL-003', nama: 'Ahmad Fauzi', phone: '08551234567', status: 'Selesai', layanan: 'Express 4 Jam', berat: 2, total: 36000, catatan: 'Cepat karena mau dipakai acara', payment: 'Lunas', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), estimasiSelesai: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ];
        saveOrders();
    }
}

function saveOrders() { localStorage.setItem('queen_laundry_orders', JSON.stringify(orders)); }

function formatRupiah(amount) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount); }

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function updateStats() {
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('antriCount').textContent = orders.filter(o => o.status === 'Antri').length;
    document.getElementById('diprosesCount').textContent = orders.filter(o => o.status === 'Diproses').length;
    document.getElementById('selesaiCount').textContent = orders.filter(o => o.status === 'Selesai').length;
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrders');
    const recent = [...orders].reverse().slice(0, 5);
    if (recent.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty">Belum ada order</td></tr>'; return; }
    tbody.innerHTML = recent.map(o => `<tr><td><strong>${o.id_laundry}</strong></td><td>${o.nama}</td><td>${o.layanan}</td><td>${o.berat} kg</td><td>${formatRupiah(o.total)}</td><td><span class="status-badge status-${o.status === 'Antri' ? 'antri' : o.status === 'Diproses' ? 'diproses' : 'selesai'}">${o.status}</span></td><td>${formatDate(o.createdAt)}</td></tr>`).join('');
}

function renderAllOrders() {
    const tbody = document.getElementById('allOrders');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filter = document.getElementById('statusFilter')?.value || 'all';
    let filtered = orders.filter(o => (!search || o.id_laundry.toLowerCase().includes(search) || o.nama.toLowerCase().includes(search)) && (filter === 'all' || o.status === filter));
    if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="empty">Tidak ada order</td></tr>'; return; }
    tbody.innerHTML = filtered.map(o => `<tr>
        <td><strong>${o.id_laundry}</strong></td>
        <td>${o.nama}</td>
        <td>${o.phone || '-'}</td>
        <td>${o.layanan}</td>
        <td>${o.berat} kg</td>
        <td>${formatRupiah(o.total)}</td>
        <td><select class="status-select" data-id="${o.id_laundry}"><option value="Antri" ${o.status === 'Antri' ? 'selected' : ''}>Antri</option><option value="Diproses" ${o.status === 'Diproses' ? 'selected' : ''}>Diproses</option><option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai</option></select></td>
        <td><select class="payment-select" data-id="${o.id_laundry}"><option value="Belum Lunas" ${o.payment === 'Belum Lunas' ? 'selected' : ''}>Belum Lunas</option><option value="Lunas" ${o.payment === 'Lunas' ? 'selected' : ''}>Lunas</option></select></td>
        <td><button class="delete-btn" data-id="${o.id_laundry}">Hapus</button></td>
    </tr>`).join('');
    document.querySelectorAll('.status-select').forEach(s => s.addEventListener('change', (e) => updateStatus(s.dataset.id, s.value)));
    document.querySelectorAll('.payment-select').forEach(p => p.addEventListener('change', (e) => updatePayment(p.dataset.id, p.value)));
    document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', (e) => { if(confirm(`Hapus order ${b.dataset.id}?`)) deleteOrder(b.dataset.id); }));
}

function updateStatus(id, newStatus) {
    const index = orders.findIndex(o => o.id_laundry === id);
    if (index !== -1) { orders[index].status = newStatus; saveOrders(); refreshAll(); window.dispatchEvent(new CustomEvent('orderUpdated', { detail: orders[index] })); }
}

function updatePayment(id, newPayment) {
    const index = orders.findIndex(o => o.id_laundry === id);
    if (index !== -1) { orders[index].payment = newPayment; saveOrders(); refreshAll(); }
}

function deleteOrder(id) { orders = orders.filter(o => o.id_laundry !== id); saveOrders(); refreshAll(); window.dispatchEvent(new CustomEvent('orderDeleted', { detail: id })); }

function calculateTotal(service, weight) { return priceList[service] * weight; }

function addOrder() {
    const id = document.getElementById('newId').value.trim();
    const name = document.getElementById('newName').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const service = document.getElementById('newService').value;
    const weight = parseFloat(document.getElementById('newWeight').value);
    const status = document.getElementById('newStatus').value;
    const payment = document.getElementById('newPayment').value;
    const note = document.getElementById('newNote').value;
    if (!id || !name || !phone || !weight || weight <= 0) { alert('Isi semua data dengan benar!'); return; }
    if (orders.some(o => o.id_laundry === id)) { alert('ID sudah ada!'); return; }
    const total = calculateTotal(service, weight);
    const estimasiSelesai = new Date(Date.now() + (status === 'Selesai' ? 0 : 2 * 24 * 60 * 60 * 1000)).toISOString();
    const newOrder = { id_laundry: id, nama: name, phone, status, layanan: service, berat: weight, total, catatan: note || 'Tidak ada catatan', payment, createdAt: new Date().toISOString(), estimasiSelesai };
    orders.push(newOrder); saveOrders();
    document.getElementById('newId').value = ''; document.getElementById('newName').value = ''; document.getElementById('newPhone').value = ''; document.getElementById('newWeight').value = '';
    refreshAll(); alert('Order berhasil ditambahkan!');
}

document.getElementById('newService')?.addEventListener('change', () => { const w = parseFloat(document.getElementById('newWeight')?.value) || 0; const total = calculateTotal(document.getElementById('newService').value, w); document.getElementById('totalPreview').innerHTML = `Total: ${formatRupiah(total)}`; });
document.getElementById('newWeight')?.addEventListener('input', () => { const w = parseFloat(document.getElementById('newWeight').value) || 0; const total = calculateTotal(document.getElementById('newService').value, w); document.getElementById('totalPreview').innerHTML = `Total: ${formatRupiah(total)}`; });

function refreshAll() { updateStats(); renderRecentOrders(); renderAllOrders(); }

document.querySelectorAll('.menu-item').forEach(item => { item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active')); item.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (tab === 'dashboard') { document.getElementById('dashboardTab').classList.add('active'); document.getElementById('pageTitle').textContent = 'Dashboard'; refreshAll(); }
    else if (tab === 'orders') { document.getElementById('ordersTab').classList.add('active'); document.getElementById('pageTitle').textContent = 'Daftar Order'; renderAllOrders(); }
    else if (tab === 'add') { document.getElementById('addTab').classList.add('active'); document.getElementById('pageTitle').textContent = 'Tambah Order'; }
}); });

document.getElementById('loginBtn').addEventListener('click', () => { const u = document.getElementById('loginUser').value, p = document.getElementById('loginPass').value;
    if (u === 'admin' && p === 'queen123') {
        isLoggedIn = true; document.getElementById('loginPage').style.display = 'none'; document.getElementById('dashboard').style.display = 'flex';
        loadOrders(); refreshAll(); document.getElementById('currentDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } else alert('Login gagal!');
});
document.getElementById('logoutBtn').addEventListener('click', () => { isLoggedIn = false; document.getElementById('loginPage').style.display = 'flex'; document.getElementById('dashboard').style.display = 'none'; });
document.getElementById('submitOrder')?.addEventListener('click', addOrder);
document.getElementById('refreshBtn')?.addEventListener('click', () => renderAllOrders());
document.getElementById('searchInput')?.addEventListener('input', () => renderAllOrders());
document.getElementById('statusFilter')?.addEventListener('change', () => renderAllOrders());