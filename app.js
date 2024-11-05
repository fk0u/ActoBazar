// Inisialisasi animasi Lottie untuk halaman greetings
const greetingAnimation = document.getElementById('greeting-animation');
lottie.loadAnimation({
  container: greetingAnimation,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json'
});

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

// Fungsi untuk berpindah dari halaman greetings ke halaman menu
function goToMenu() {
  document.getElementById('greeting-page').classList.add('hidden');
  document.getElementById('main-page').classList.remove('hidden');
  loadMenu();
  showRandomPantun();
}

// Pantun acak tentang menu bazar
const pantunList = [
  "Udang Keju lezat dan manis, di bazar kami paling habis!",
  "Crispy Potato Balls renyah menggoda, bikin nagih setiap coba!"
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

// Menampilkan menu di halaman utama
function displayMenu(menuData) {
  const menuContainer = document.getElementById('menu-container');
  menuContainer.innerHTML = '';

  menuData.forEach(item => {
    const menuCard = document.createElement('div');
    menuCard.classList.add('retro-card', 'text-center', 'transition', 'duration-200', 'transform', 'hover:scale-105');
    menuCard.innerHTML = `
      <img src="./assets/uploads/${item.image}" alt="${item.name}" class="w-full h-32 object-cover mb-2 rounded-lg">
      <h3 class="txt retro-title mb-2">${item.name}</h3>
      <p class="txt1 retro-price mb-4">Harga: Rp${item.price}</p>
      <button class="buttonbuy ${item.status === "Habis" ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}"
        onclick="addToCart('${item.id}')"
        ${item.status === "Habis" ? "disabled" : ""}>${item.status === "Habis" ? "Habis" : "Tambah ke Keranjang"}</button>
    `;
    menuContainer.appendChild(menuCard);
  });
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
    alert(`${item.name} berhasil ditambahkan ke keranjang!`);
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

// Menutup modal keranjang
function closeCart() {
  document.getElementById('cart-modal').classList.add('hidden');
}

// Fungsi untuk checkout dan mengirimkan data transaksi ke Telegram
function proceedCheckout() {
  const name = document.getElementById('user-name').value;
  const userClass = document.getElementById('user-class').value;
  const whatsapp = document.getElementById('user-whatsapp').value;
  
  if (!name || !userClass || !whatsapp) {
    alert('Mohon lengkapi data pembeli.');
    return;
  }

  const items = Object.values(cart);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const transaction = {
    code: 'TRX' + Date.now(),
    name,
    userClass,
    whatsapp,
    items,
    total
  };
  sendTransactionToTelegram(transaction);
  alert('Pesanan berhasil dikirim!');
  closeCart();
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
