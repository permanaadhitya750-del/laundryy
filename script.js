// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 800);
});

// Mobile Menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
    
    // Active nav link
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Hero Tracking Button
document.getElementById('trackBtnHero').addEventListener('click', () => {
    document.getElementById('tracking').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('trackInput').focus();
});

// WhatsApp Buttons
const whatsappNumber = '6281234567890';

document.getElementById('waHeroBtn').addEventListener('click', () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Halo%20Queen%20Laundry%2C%20saya%20ingin%20pesan%20laundry`, '_blank');
});

document.getElementById('waContactBtn').addEventListener('click', () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Halo%20Queen%20Laundry%2C%20saya%20ingin%20menanyakan%20status%20laundry`, '_blank');
});

document.getElementById('floatingWA').addEventListener('click', () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Halo%20Queen%20Laundry%2C%20saya%20butuh%20bantuan`, '_blank');
});

// Service Buttons
document.querySelectorAll('.serviceBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('kontak').scrollIntoView({ behavior: 'smooth' });
    });
});

// ========== TRACKING SYSTEM WITH DETAILS ==========
let orders = [];

// Harga per layanan
const priceList = {
    'Cuci Kering': 8000,
    'Cuci Setrika': 11000,
    'Express 4 Jam': 18000
};

function loadOrders() {
    const stored = localStorage.getItem('queen_laundry_orders');
    if (stored) {
        orders = JSON.parse(stored);
    } else {
        orders = [
            { 
                id_laundry: 'QL-001', 
                nama: 'Budi Santoso', 
                phone: '08123456789',
                status: 'Diproses', 
                layanan: 'Cuci Setrika',
                berat: 5,
                total: 55000,
                catatan: 'Harap hati-hati dengan baju batik',
                payment: 'Lunas',
                createdAt: new Date().toISOString(),
                estimasiSelesai: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            { 
                id_laundry: 'QL-002', 
                nama: 'Siti Rahayu', 
                phone: '08765432100',
                status: 'Antri', 
                layanan: 'Cuci Kering',
                berat: 3,
                total: 24000,
                catatan: 'Pakai pewangi lavender',
                payment: 'Belum Lunas',
                createdAt: new Date().toISOString(),
                estimasiSelesai: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            { 
                id_laundry: 'QL-003', 
                nama: 'Ahmad Fauzi', 
                phone: '08551234567',
                status: 'Selesai', 
                layanan: 'Express 4 Jam',
                berat: 2,
                total: 36000,
                catatan: 'Cepat karena mau dipakai acara',
                payment: 'Lunas',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                estimasiSelesai: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        saveOrders();
    }
}

function saveOrders() {
    localStorage.setItem('queen_laundry_orders', JSON.stringify(orders));
}

// Format currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// Format date
function formatDate(dateStr, withTime = true) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (withTime) {
        return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Hitung estimasi berdasarkan status
function getEstimasiText(order) {
    if (order.status === 'Selesai') {
        return 'Sudah selesai pada ' + formatDate(order.estimasiSelesai);
    }
    
    if (order.status === 'Diproses') {
        return 'Diperkirakan selesai ' + formatDate(order.estimasiSelesai, false);
    }
    
    return 'Masuk antrian, akan diproses dalam 1x24 jam';
}

// Status configuration
const statusConfig = {
    'Antri': {
        step: 'antri',
        progress: 0,
        icon: 'fa-basket-shopping',
        badgeClass: 'antri',
        img: 'https://cdn-icons-png.flaticon.com/512/3106/3106773.png',
        caption: 'Menunggu antrian, akan segera diproses'
    },
    'Diproses': {
        step: 'diproses',
        progress: 50,
        icon: 'fa-washing-machine',
        badgeClass: 'diproses',
        img: 'https://cdn-icons-png.flaticon.com/512/2997/2997950.png',
        caption: 'Sedang dicuci & disetrika dengan mesin modern'
    },
    'Selesai': {
        step: 'selesai',
        progress: 100,
        icon: 'fa-check-circle',
        badgeClass: 'selesai',
        img: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
        caption: 'Selesai! Laundry sudah rapi dan siap diambil 🎉'
    }
};

function updateTrackingUI(order) {
    if (!order) return;
    
    const config = statusConfig[order.status];
    
    // Update header
    document.getElementById('orderName').textContent = order.nama;
    const statusBadge = document.getElementById('orderStatus');
    statusBadge.textContent = order.status;
    statusBadge.className = `status-badge ${config.badgeClass}`;
    
    // Update icon
    document.getElementById('resultIcon').innerHTML = `<i class="fas ${config.icon}"></i>`;
    
    // Update progress bar
    document.getElementById('progressFill').style.width = `${config.progress}%`;
    
    // Update illustration
    document.getElementById('statusImg').src = config.img;
    document.getElementById('statusCaption').textContent = config.caption;
    
    // Update active step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if (step.dataset.step === config.step) {
            step.classList.add('active');
        }
    });
    
    // Update DETAIL LENGKAP
    document.getElementById('detailId').textContent = order.id_laundry;
    document.getElementById('detailNama').textContent = order.nama;
    document.getElementById('detailPhone').textContent = order.phone || '-';
    document.getElementById('detailTanggal').textContent = formatDate(order.createdAt);
    document.getElementById('detailEstimasi').textContent = getEstimasiText(order);
    document.getElementById('detailLayanan').textContent = order.layanan || 'Cuci Setrika';
    document.getElementById('detailBerat').textContent = order.berat ? `${order.berat} kg` : '-';
    
    const hargaPerKg = priceList[order.layanan] || 11000;
    document.getElementById('detailHargaPerKg').textContent = formatRupiah(hargaPerKg);
    document.getElementById('detailTotal').textContent = formatRupiah(order.total);
    document.getElementById('detailPayment').innerHTML = order.payment === 'Lunas' 
        ? '<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Lunas</span>'
        : '<span style="color:#f59e0b;"><i class="fas fa-clock"></i> Belum Lunas</span>';
    
    document.getElementById('orderNote').textContent = order.catatan || 'Tidak ada catatan khusus';
}

function searchOrder(query) {
    if (!query.trim()) {
        alert('Masukkan ID Laundry atau Nama Customer');
        return false;
    }
    
    loadOrders();
    const order = orders.find(o => 
        o.id_laundry.toLowerCase() === query.toLowerCase() || 
        o.nama.toLowerCase() === query.toLowerCase()
    );
    
    if (order) {
        document.getElementById('trackResult').classList.remove('hidden');
        document.getElementById('trackNotFound').classList.add('hidden');
        updateTrackingUI(order);
        return true;
    } else {
        document.getElementById('trackResult').classList.add('hidden');
        document.getElementById('trackNotFound').classList.remove('hidden');
        return false;
    }
}

// Tracking Event Listeners
document.getElementById('trackBtn').addEventListener('click', () => {
    const input = document.getElementById('trackInput');
    searchOrder(input.value);
});

document.getElementById('trackInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('trackBtn').click();
    }
});

// Initialize
loadOrders();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});