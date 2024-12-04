import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
	getDatabase,
	ref,
	push,
	onValue,
	remove,
	update,
	onChildChanged,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

import { firebaseConfig } from '../firebase/firebase-config.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referensi elemen form
const productForm = document.getElementById('productForm');
const productModalLabel = document.getElementById('productModalLabel');
const modalSaveButton = document.getElementById('modalSaveButton');
const productNameInput = document.getElementById('productName');
const productCategoriesInput = document.getElementById('productCategories');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');
const productDescriptionInput = document.getElementById('productDescription');
const productList = document.getElementById('productList');

const productsRef = ref(database, 'products');
const categoriesRef = ref(database, 'categories');

let currentAction = ''; // Mode tambah atau edit
let editProductId = null; // ID produk untuk edit

// Fungsi membuka modal tambah produk
function openAddModal() {
	currentAction = 'add';
	productModalLabel.textContent = 'Tambah Produk';
	modalSaveButton.textContent = 'Tambah';
	productForm.reset(); // Bersihkan form
	new bootstrap.Modal(document.getElementById('productModal')).show();
}

// Fungsi membuka modal edit produk
function openEditModal(productId, productData) {
	currentAction = 'edit';
	editProductId = productId;

	productModalLabel.textContent = 'Edit Produk';
	modalSaveButton.textContent = 'Simpan Perubahan';

	// Set nilai form dengan data produk
	productNameInput.value = productData.nama;
	productCategoriesInput.value = productData.kategori;
	productPriceInput.value = productData.harga;
	productStockInput.value = productData.stok;
	productDescriptionInput.value = productData.deskripsi;

	new bootstrap.Modal(document.getElementById('productModal')).show();
}

// Tambahkan fungsi ke global agar bisa diakses
window.openAddModal = openAddModal;

// Fungsi mengambil kategori dengan status Aktif
function loadActiveCategories() {
	onValue(categoriesRef, (snapshot) => {
		productCategoriesInput.innerHTML = ''; // Bersihkan daftar kategori

		if (!snapshot.exists()) {
			productCategoriesInput.innerHTML =
				'<option value="">Tidak ada kategori</option>';
			return;
		}

		// Tambahkan kategori yang statusnya Aktif
		snapshot.forEach((childSnapshot) => {
			const category = childSnapshot.val();
			if (category.status === 'Aktif') {
				const option =
					document.createElement(
						'option'
					);
				option.value = category.kategori;
				option.textContent = category.kategori;
				productCategoriesInput.appendChild(
					option
				);
			}
		});
	});
}

// Panggil fungsi untuk memuat kategori aktif
loadActiveCategories();

// Handle submit form produk
productForm.addEventListener('submit', (e) => {
	e.preventDefault(); // Hindari reload halaman

	const productData = {
		nama: productNameInput.value.trim(),
		kategori: productCategoriesInput.value,
		harga: parseFloat(productPriceInput.value.trim()),
		stok: parseInt(productStockInput.value.trim(), 10),
		deskripsi: productDescriptionInput.value.trim(),
	};

	if (currentAction === 'add') {
		// Tambah produk baru
		push(productsRef, productData)
			.then(() => {
				alert('Produk berhasil ditambahkan!');
				bootstrap.Modal.getInstance(
					document.getElementById(
						'productModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error menambahkan produk:',
					error
				)
			);
	} else if (currentAction === 'edit') {
		// Perbarui produk
		update(ref(database, `products/${editProductId}`), productData)
			.then(() => {
				alert('Produk berhasil diperbarui!');
				bootstrap.Modal.getInstance(
					document.getElementById(
						'productModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error memperbarui produk:',
					error
				)
			);
	}
});

// Paginate
const ITEMS_PER_PAGE = 10; // Jumlah item per halaman
let currentPage = 1; // Halaman saat ini
let products = []; // Array untuk menyimpan Produk

// Fungsi untuk menghitung total halaman
function getTotalPages(items) {
	return Math.ceil(items.length / ITEMS_PER_PAGE);
}

// Fungsi untuk merender item berdasarkan halaman
function renderPage(items, page) {
	const start = (page - 1) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;
	const itemsToShow = items.slice(start, end);

	const productList = document.getElementById('productList'); // Pastikan ada elemen dengan id 'productList'
	productList.innerHTML = ''; // Bersihkan daftar produk

	itemsToShow.forEach((item) => {
		const product = item; // Menggunakan item langsung

		// Buat elemen card produk
		const colDiv = document.createElement('div');
		colDiv.className = 'col-md-12 mb-3';

		const cardDiv = document.createElement('div');
		cardDiv.className = 'card shadow-sm';

		const cardBody = document.createElement('div');
		cardBody.className =
			'card-body d-flex justify-content-between align-items-center';

		const productName = document.createElement('h5');
		productName.className = 'mb-0';
		productName.textContent = product.nama;

		const actionsDiv = document.createElement('div');

		// Tombol Edit
		const editBtn = document.createElement('a');
		editBtn.className = 'btn btn-sm btn-warning me-2';
		editBtn.href = '#';
		editBtn.innerHTML = '<i class="fas fa-edit"></i>';
		editBtn.addEventListener('click', (e) => {
			e.preventDefault();
			openEditModal(product.key, product);
		});

		// Tombol Detail
		const detailBtn = document.createElement('a');
		detailBtn.className = 'btn btn-sm btn-info me-2';
		detailBtn.href = '#';
		detailBtn.innerHTML = '<i class="fas fa-info-circle"></i>';

		detailBtn.addEventListener('click', (e) => {
			e.preventDefault();

			// Mengisi data ke dalam modal
			document.getElementById(
				'detailProductName'
			).textContent = product.nama;
			document.getElementById(
				'detailProductCategory'
			).textContent = product.kategori;
			document.getElementById(
				'detailProductPrice'
			).textContent = `Rp ${product.harga.toLocaleString()}`;
			document.getElementById(
				'detailProductStock'
			).textContent = product.stok;
			document.getElementById(
				'detailProductDescription'
			).textContent = product.deskripsi;

			// Menampilkan gambar produk
			const productImage =
				document.querySelector(
					'#detailModal img'
				);
			productImage.src =
				product.gambar ||
				'https://via.placeholder.com/300x300';

			// Tampilkan modal
			new bootstrap.Modal(
				document.getElementById('detailModal')
			).show();
		});

		// Tombol Hapus
		const deleteBtn = document.createElement('a');
		deleteBtn.className = 'btn btn-sm btn-danger';
		deleteBtn.href = '#';
		deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
		deleteBtn.addEventListener('click', (e) => {
			e.preventDefault();
			if (
				confirm(
					'Apakah Anda yakin ingin menghapus produk ini?'
				)
			) {
				remove(
					ref(
						database,
						`products/${product.key}`
					)
				)
					.then(() =>
						alert(
							'Produk berhasil dihapus.'
						)
					)
					.catch((error) =>
						console.error(
							'Error menghapus produk:',
							error
						)
					);
			}
		});

		actionsDiv.appendChild(detailBtn);
		actionsDiv.appendChild(editBtn);
		actionsDiv.appendChild(deleteBtn);
		cardBody.appendChild(productName);
		cardBody.appendChild(actionsDiv);
		cardDiv.appendChild(cardBody);
		colDiv.appendChild(cardDiv);

		productList.appendChild(colDiv);
	});
}

// Fungsi untuk mengecek stok produk
function checkStock() {
	onChildChanged(productsRef, (snapshot) => {
		const product = snapshot.val();
		const productId = snapshot.key;
		const stock = product.stok;

		if (stock < 5) {
			showNotification(productId, product.nama, stock);
		}
	});
}

function showNotification(productId, productName, stock) {
	const notificationArea = document.getElementById('notificationArea');
	const notification = document.createElement('div');
	notification.className = 'alert alert-danger';
	notification.innerHTML = `
    <strong>Stok rendah!</strong> Produk ${productName} (ID: ${productId}) memiliki stok hanya ${stock} unit. Segera restock!
    <button type="button" class="close" onclick="this.parentElement.remove();">&times;</button>
  `;
	notificationArea.appendChild(notification);

	// Menyimpan notifikasi ke dalam database
	const notificationsRef = ref(database, 'notifications');
	const newNotificationRef = push(notificationsRef);
	set(newNotificationRef, {
		productId,
		productName,
		stock,
		timestamp: Date.now(),
	});
}

// Panggil fungsi checkStock untuk mengecek stok setiap kali data diperbarui
checkStock();

// Fungsi untuk berpindah halaman
function changePage(page) {
	const totalPages = getTotalPages(products);

	if (page < 1 || page > totalPages) return;

	currentPage = page;
	renderPage(products, currentPage);
	document.getElementById(
		'pageInfo'
	).textContent = `Halaman ${currentPage} dari ${totalPages}`;

	// Mengatur tombol prev/next
	document.getElementById('prevPage').disabled = currentPage === 1;
	document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Menampilkan produk di halaman
onValue(productsRef, (snapshot) => {
	products = []; // Reset array products

	snapshot.forEach((childSnapshot) => {
		const data = childSnapshot.val();
		products.push({ key: childSnapshot.key, ...data });
	});

	changePage(1); // Render halaman pertama
});

document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
