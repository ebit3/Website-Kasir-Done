import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
	getDatabase,
	ref,
	get,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';
import { firebaseConfig } from '../firebase/firebase-config.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const productRef = ref(database, 'products');

// Ambil data produk dari Firebase
get(productRef)
	.then((snapshot) => {
		if (snapshot.exists()) {
			const products = snapshot.val(); // Ambil data produk
			displayProducts(products); // Panggil fungsi untuk menampilkan produk
		} else {
			console.log('Data tidak ditemukan');
		}
	})
	.catch((error) => {
		console.error('Error mengambil data: ', error);
	});

// Fungsi untuk menampilkan produk di halaman
function displayProducts(products) {
	const productList = document.getElementById('product-list');
	productList.innerHTML = ''; // Kosongkan kontainer sebelum menambahkan produk

	// Loop melalui data produk dan buat elemen HTML untuk masing-masing produk
	for (const productId in products) {
		const product = products[productId];

		// Membuat elemen untuk produk
		const productCard = document.createElement('div');
		productCard.classList.add('col-lg-4', 'mb-3', 'col-md-6', 'col-sm-6');
		productCard.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${product.nama}</h5>
                            <p class="card-text">
                                <span class="price-icon">💲</span>
                                Rp ${product.harga.toLocaleString('id-ID')}
                            </p>
                            <button class="btn btn-primary w-100" onclick="addToCart('${productId}')">
                                <i class="bi bi-cart-plus"></i> Tambahkan
                            </button>
                        </div>
                    </div>
                `;

		// Tambahkan card produk ke dalam row
		productList.appendChild(productCard);
	}
}

// Fungsi untuk menambahkan produk ke keranjang (contoh)
function addToCart(productId) {
	alert(`Produk dengan ID ${productId} ditambahkan ke keranjang!`);
}
