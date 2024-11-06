// Inisialisasi animasi Lottie untuk halaman greetings
const greetingAnimation = document.getElementById('greeting-animation');
lottie.loadAnimation({
  container: greetingAnimation,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json'
});

let selectedItemId = null;
let selectedItemQuantity = 0;

// Memulai dan mengatur kontrol untuk musik
const backgroundMusic = document.getElementById('background-music');
let musicPlaying = true;

function toggleMusic() {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    backgroundMusic.play();
    document.getElementById('music-control').innerText = '🔇 Music Off';
  } else {
    backgroundMusic.pause();
    document.getElementById('music-control').innerText = '🔊 Music On';
  }
}

// Memastikan musik langsung mulai saat halaman dimuat atau setelah interaksi pertama
function startMusic() {
  if (musicPlaying) {
    backgroundMusic.play().catch(() => {
      document.body.addEventListener('click', startMusic, { once: true });
    });
  }
}

// Memanggil startMusic saat halaman selesai dimuat
window.addEventListener('DOMContentLoaded', startMusic);

// Tambahkan fungsi untuk menampilkan modal pop-up ketika waktu di luar jam operasional
function showClosedPopup() {
  // Membuat elemen modal secara dinamis
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="modal-content w-full max-w-md text-center p-4">
      <p class="text-lg txt1 font-retro text-pink-500 mb-4">Stand Bazar telah Tutup, Terimakasih Telah Berbelanja di Stand Bazar XI PPLG 1, Bertemu di Next Bazar yaa!</p>
      <button onclick="closeModal()" class="button-cute w-full">OK</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Fungsi untuk menutup modal pop-up
function closeModal() {
  const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
  if (modal) {
    modal.remove();
  }
}

// Modifikasi fungsi goToMenu untuk pengecekan waktu
function goToMenu() {
  const currentTime = new Date();
  const currentHours = currentTime.getUTCHours() + 8; // WITA (UTC+8)

  // Rentang waktu operasional
  const startHour = 7;
  const endHour = 13;

  // Jika waktu berada di luar jam operasional, tampilkan modal pop-up
  if (currentHours < startHour || currentHours >= endHour) {
    showClosedPopup();
  } else {
    // Jika dalam rentang waktu, tampilkan halaman utama
    document.getElementById('greeting-page').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    loadMenu();
    showRandomPantun();
  }
}

// Pantun acak tentang menu bazar
const pantunList = [
  // Pantun untuk Pink Lava
  "Pergi ke taman sore hari, Pink Lava segar bikin happy!",
  "Lihat pelangi warna cerah, Pink Lava manis bikin cerah!",
  "Pink Lava segar tiada dua, minuman ini pasti buat suka!",
  "Pink Lava segar terasa, sekali coba buat ceria!",
  "Burung kenari hinggap di rawa, minum Pink Lava, enak terasa!",

  // Pantun untuk Crispy Potato Ball
  "Crispy Potato Ball renyahnya mantap, nikmatnya bikin tak terlewat!",
  "Ke pasar beli kembang, Crispy Potato Ball enak tak terbilang!",
  "Potato Ball renyah, gurihnya terasa, coba sekali pasti tak sia-sia!",
  "Crispy Potato Ball lezat menggoda, satu gigitan bikin bahagia!",
  "Potato Ball renyah dan gurih, makin nikmat tak perlu risih!",

  // Pantun untuk Udang Keju
  "Udang Keju lezat menggoda, di bazar kami paling juara!",
  "Udang Keju keju meleleh, bikin lidah jadi terperanjat!",
  "Keju leleh bertemu udang, rasa enak bikin senang!",
  "Makan Udang Keju meleleh di mulut, pasti bikin pengen terus!",
  "Udang Keju gurih dan lezat, sekali coba bikin terpikat!"
];
function showRandomPantun() {
  const randomPantun = pantunList[Math.floor(Math.random() * pantunList.length)];
  document.getElementById('pantun').innerText = randomPantun;
}

// Fungsi untuk memuat data menu dari JSON
async function loadMenu() {
  const response = await fetch('./data/menu.json');
  const menuData = await response.json();
  displayMenu(menuData);
  saveMenuData(menuData);  // Simpan data ke localStorage untuk digunakan nanti
}

// Menyimpan data menu ke localStorage untuk akses lebih cepat
function saveMenuData(menuData) {
  localStorage.setItem('menuData', JSON.stringify(menuData));
}

// Fungsi untuk menampilkan detail modal menu
function showMenuDetailModal(itemId) {
  const menuData = JSON.parse(localStorage.getItem('menuData')) || [];
  const item = menuData.find(m => m.id === itemId);

  if (item) {
    document.getElementById("menu-detail-image").src = `./assets/uploads/${item.image}`;
    document.getElementById("menu-detail-name").innerText = item.name;
    document.getElementById("menu-detail-price").innerText = `Harga: Rp${item.price}`;
    document.getElementById("menu-detail-description").innerText = item.description;
    document.getElementById("menu-quantity").innerText = 0;

    // Periksa status item
    const addToCartButton = document.getElementById("add-to-cart-button");
    if (item.status === "Habis") {
      addToCartButton.innerText = "Habis";
      addToCartButton.disabled = true;
      addToCartButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      addToCartButton.innerText = "Tambahkan ke Keranjang";
      addToCartButton.disabled = false;
      addToCartButton.classList.remove("opacity-50", "cursor-not-allowed");
    }

    // Tampilkan modal
    document.getElementById("menu-detail-modal").classList.remove("hidden");

    // Simpan ID item yang sedang ditampilkan
    selectedItemId = itemId;
  }
}

function closeMenuDetailModal() {
  document.getElementById("menu-detail-modal").classList.add("hidden");
}

// Fungsi untuk menampilkan menu di halaman utama
function displayMenu(menuData, category = "Semua") {
  const menuContainer = document.getElementById('menu-container');
  menuContainer.innerHTML = '';

  const filteredMenu = category === "Semua" ? menuData : menuData.filter(item => item.category === category);

  filteredMenu.forEach(item => {
    const menuCard = document.createElement('div');
    menuCard.classList.add('retro-card', 'text-center', 'transition', 'duration-200', 'transform', 'hover:scale-105');
    menuCard.innerHTML = `
      <img src="./assets/uploads/${item.image}" alt="${item.name}" class="w-full h-32 object-cover mb-2 rounded-lg">
      <h3 class="txt retro-title mb-2">${item.name}</h3>
      <p class="txt1 retro-price mb-4">Harga: Rp${item.price}</p>
      <button class="buttonbuy hover:bg-blue-600"
        onclick="showMenuDetailModal('${item.id}')">Lihat Detail</button>
    `;
    menuContainer.appendChild(menuCard);
  });
}

// Fungsi untuk filter menu berdasarkan kategori
function filterMenu(category) {
  const menuData = JSON.parse(localStorage.getItem('menuData')) || [];
  displayMenu(menuData, category);
}

function updateCartButtonVisibility() {
  const totalPopup = document.getElementById('total-popup');
  if (Object.keys(cart).length > 0) {
    totalPopup.classList.remove('hidden');
  } else {
    totalPopup.classList.add('hidden');
  }
}

// Panggil `updateCartButtonVisibility` setiap kali item ditambahkan atau dihapus
function addToCartFromDetail() {
  if (selectedItemQuantity > 0 && selectedItemId) {
    const menuData = JSON.parse(localStorage.getItem('menuData')) || [];
    const item = menuData.find(m => m.id === selectedItemId);

    if (item) {
      if (cart[selectedItemId]) {
        cart[selectedItemId].quantity += selectedItemQuantity;
      } else {
        cart[selectedItemId] = { ...item, quantity: selectedItemQuantity };
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      showAddToCartModal(item.name);
      updateCartButtonVisibility(); // Tampilkan tombol "Keranjang Saya"
    }

    selectedItemQuantity = 0;
    document.getElementById("menu-quantity").innerText = 0;
    closeMenuDetailModal();
  } else {
    alert("Pilih jumlah item terlebih dahulu.");
  }
}

function removeFromCart(itemId) {
  if (cart[itemId]) {
    delete cart[itemId];
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart(); // Refresh tampilan keranjang setelah menghapus item
    updateCartButtonVisibility(); // Update visibilitas tombol "Keranjang Saya"
  }
}

// Menampilkan modal konfirmasi "berhasil ditambahkan ke keranjang"
function showAddToCartModal(itemName) {
  const cartMessage = document.getElementById("cart-message");
  cartMessage.innerHTML = `<span class="txt retro-title item-name">${itemName}</span> berhasil ditambahkan ke keranjang!`;
  document.getElementById("add-to-cart-modal").classList.remove("hidden");

  setTimeout(() => {
    closeAddToCartModal();
  }, 2000);
}

function closeAddToCartModal() {
  document.getElementById("add-to-cart-modal").classList.add("hidden");
}

// Fungsi untuk memanipulasi jumlah item dalam modal
function increaseQuantity() {
  selectedItemQuantity++;
  document.getElementById("menu-quantity").innerText = selectedItemQuantity;
}

function decreaseQuantity() {
  if (selectedItemQuantity > 0) {
    selectedItemQuantity--;
    document.getElementById("menu-quantity").innerText = selectedItemQuantity;
  }
}

// Variabel untuk menyimpan item di keranjang sebagai objek dengan jumlah
let cart = {};

// Fungsi untuk menambah item ke keranjang dengan jumlah
function addToCart(itemId) {
  const menuData = JSON.parse(localStorage.getItem('menuData')) || [];
  const item = menuData.find(m => m.id === itemId);

  if (item) {
    if (cart[itemId]) {
      cart[itemId].quantity += 1;
    } else {
      cart[itemId] = { ...item, quantity: 1 };
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('total-popup').classList.remove('hidden');

    // Memanggil fungsi showAddToCartModal untuk menampilkan pop-up konfirmasi
    showAddToCartModal(item.name);
  }
}

// Menampilkan modal keranjang dengan detail item dan jumlah serta tombol hapus
function openCart() {
  document.getElementById('cart-modal').classList.remove('hidden');
  const cartItems = document.getElementById('cart-items');
  const items = Object.values(cart);
  let totalPrice = 0;

  // Menghitung total harga
  items.forEach(item => {
    totalPrice += item.price * item.quantity;
  });

  // Menampilkan item dalam keranjang dan total harga
  cartItems.innerHTML = items.map(item => `
    <div class="cart-item flex flex-col items-start mb-2 p-2 border-2 border-pink-400 rounded-lg bg-white bg-opacity-30 shadow-md">
      <span class="font-retro text-lg">${item.name} x ${item.quantity}</span>
      <span class="font-retro text-sm mt-1">Rp${item.price * item.quantity}</span>
      <button onclick="removeFromCart('${item.id}')" class="button-delete-optimized mt-2 self-end">Hapus</button>
    </div>
  `).join('');

  // Menambahkan bagian total harga
  cartItems.innerHTML += `
    <div class="total-price text-center font-retro mt-4 p-2 border-t-2 border-pink-400">
      <span class="text-lg font-bold">Total: Rp${totalPrice}</span>
    </div>
  `;
}


// Fungsi untuk menghapus item dari keranjang
function removeFromCart(itemId) {
  if (cart[itemId]) {
    delete cart[itemId];
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart(); // Refresh tampilan keranjang setelah menghapus item
  }
}

// Fungsi untuk menutup modal keranjang
function closeCart() {
  document.getElementById('cart-modal').classList.add('hidden');
  document.getElementById('main-page').classList.remove('hidden');
}

// Variabel untuk menyimpan pilihan pengiriman
let deliveryOption = 'Antar';

// Fungsi untuk memilih opsi pengiriman dan mengubah gaya tombol
function selectDeliveryOption(option) {
  deliveryOption = option;

  // Menghapus kelas "selected" dari kedua tombol
  document.getElementById('btn-antar').classList.remove('selected');
  document.getElementById('btn-ambil').classList.remove('selected');

  // Menambahkan kelas "selected" ke tombol yang dipilih
  if (option === 'Antar') {
    document.getElementById('btn-antar').classList.add('selected');
  } else {
    document.getElementById('btn-ambil').classList.add('selected');
  }
}

// Fungsi untuk menampilkan modal konfirmasi pesanan
function proceedCheckout() {
  const name = document.getElementById('user-name').value;
  const userClass = document.getElementById('user-class').value;
  const whatsapp = document.getElementById('user-whatsapp').value;

  if (!name || !userClass || !whatsapp) {
    alert('Mohon lengkapi data pembeli.');
    return;
  }

  // Tampilkan rincian pesanan di modal konfirmasi
  const items = Object.values(cart);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let confirmDetails = `
    <p><strong>Nama:</strong> ${name}</p>
    <p><strong>Kelas:</strong> ${userClass}</p>
    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
    <p><strong>Pengiriman:</strong> ${deliveryOption}</p>
    <p><strong>Pesanan:</strong></p>
    <ul>
  `;
  items.forEach(item => {
    confirmDetails += `<li>${item.name} x ${item.quantity} - Rp${item.price * item.quantity}</li>`;
  });
  confirmDetails += `</ul><p><strong>Total:</strong> Rp${total}</p>`;
  
  document.getElementById('confirm-details').innerHTML = confirmDetails;

  // Tampilkan modal konfirmasi
  document.getElementById('cart-modal').classList.add('hidden');
  document.getElementById('confirm-modal').classList.remove('hidden');
}

// Fungsi untuk menutup modal konfirmasi
function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  document.getElementById('main-page').classList.remove('hidden');
}

// Fungsi untuk menyelesaikan checkout dan mengirimkan data ke Telegram
function finalizeCheckout() {
  const name = document.getElementById('user-name').value;
  const userClass = document.getElementById('user-class').value;
  const whatsapp = document.getElementById('user-whatsapp').value;

  const items = Object.values(cart);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const transaction = {
    code: 'TRX' + Date.now(),
    name,
    userClass,
    whatsapp,
    items,
    total,
    deliveryOption // Mengirim pilihan pengiriman
  };

  sendTransactionToTelegram(transaction);
  alert('Pesanan berhasil dikirim!');
  closeConfirmModal();
  cart = {};
  localStorage.removeItem('cart');
}

// Mengirim data transaksi ke Telegram Bot API
async function sendTransactionToTelegram(transaction) {
  const botToken = '7261671133:AAFNh1wBsV8fZQ6CKxEZdwec9tnzXlAVAUQ';
  const chatId = '-1002407198395';
  const message = `
    *Kode Pengambilan:* ${transaction.code}
    *Nama:* ${transaction.name}
    *Kelas:* ${transaction.userClass}
    *No. WhatsApp:* ${transaction.whatsapp}
    *Total:* Rp${transaction.total}
    *Pesanan:* ${transaction.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}
    *Pengiriman:* ${transaction.deliveryOption}
  `;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  });
}


// Memuat data menu dari localStorage jika tersedia saat halaman pertama kali dibuka
function initializeMenu() {
  const storedMenuData = JSON.parse(localStorage.getItem('menuData'));
  if (storedMenuData) {
    displayMenu(storedMenuData);
  } else {
    loadMenu();
  }
}

// Memulai aplikasi dengan halaman greetings, lalu menampilkan menu utama
initializeMenu();

// Nonaktifkan klik kanan
document.addEventListener('contextmenu', event => event.preventDefault());

// Nonaktifkan tombol shortcut tertentu
document.onkeydown = function(e) {
  if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'I' || e.key === 'i' || e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    alert("Hayooo, jangan coba-coba buka inspect element ya!");
  }
};
