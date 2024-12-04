import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
	getDatabase,
	ref,
	get,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

import { firebaseConfig } from './firebase/firebase-config.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referensi ke koleksi kategori di Firebase
const kategoriRef = ref(database, 'categories');
const productRef = ref(database, 'products');
const customerRef = ref(database, 'customers');

// Ambil jumlah kategori dari Firebase
function getJumlahKategori() {
	get(kategoriRef)
		.then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				const jumlahKategori =
					Object.keys(data).length; // Hitung jumlah kategori
				tampilkanJumlahKategori(jumlahKategori);
			} else {
				console.log('Tidak ada data kategori.');
				tampilkanJumlahKategori(0); // Tampilkan 0 jika data tidak ada
			}
		})
		.catch((error) => {
			console.error('Gagal mengambil data kategori:', error);
		});
}

// Fungsi untuk menampilkan jumlah kategori ke dalam HTML
function tampilkanJumlahKategori(jumlah) {
	const kategoriElement = document.getElementById('jumlahKategori');
	if (kategoriElement) {
		kategoriElement.innerText = jumlah; // Menampilkan jumlah kategori
	}
}

// Panggil fungsi untuk mendapatkan jumlah kategori
getJumlahKategori();

// Ambil jumlah produk dari Firebase
function getJumlahProduk() {
	get(productRef)
		.then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				const jumlahProduk =
					Object.keys(data).length; // Hitung jumlah produk
				tampilkanJumlahProduk(jumlahProduk);
			} else {
				console.log('Tidak ada data produk.');
				tampilkanJumlahProduk(0); // Tampilkan 0 jika data tidak ada
			}
		})
		.catch((error) => {
			console.error('Gagal mengambil data produk:', error);
		});
}

// Fungsi untuk menampilkan jumlah produk ke dalam HTML
function tampilkanJumlahProduk(jumlah) {
	const produkElement = document.getElementById('jumlahProduk');
	if (produkElement) {
		produkElement.innerText = jumlah; // Menampilkan jumlah produk
	}
}

// Panggil fungsi untuk mendapatkan jumlah produk
getJumlahProduk();

// Ambil jumlah pelanggan dari Firebase
function getJumlahPelanggan() {
	get(customerRef)
		.then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				const jumlahPelanggan =
					Object.keys(data).length; // Hitung jumlah produk
				tampilkanJumlahPelanggan(
					jumlahPelanggan
				);
			} else {
				console.log(
					'Tidak ada data pelanggan.'
				);
				tampilkanJumlahPelanggan(0); // Tampilkan 0 jika data tidak ada
			}
		})
		.catch((error) => {
			console.error(
				'Gagal mengambil data pelanggan:',
				error
			);
		});
}

// Fungsi untuk menampilkan jumlah produk ke dalam HTML
function tampilkanJumlahPelanggan(jumlah) {
	const pelangganElement = document.getElementById('jumlahPelanggan');
	if (pelangganElement) {
		pelangganElement.innerText = jumlah; // Menampilkan jumlah produk
	}
}

// Panggil fungsi untuk mendapatkan jumlah produk
getJumlahPelanggan();
