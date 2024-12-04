import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
	getDatabase,
	ref,
	push,
	onValue,
	remove,
	update,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

import { firebaseConfig } from '../firebase/firebase-config.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Elemen untuk menampilkan daftar kategori
const categoryList = document.getElementById('categoryList');
const categoriesRef = ref(database, 'categories');

const ITEMS_PER_PAGE = 10; // Jumlah item per halaman
let currentPage = 1; // Halaman saat ini
let categories = []; // Array untuk menyimpan kategori

let currentAction = ''; // Menentukan apakah modal untuk tambah atau edit
let editCategoryId = null; // Menyimpan ID kategori yang akan diedit

// Fungsi untuk membuka modal tambah
function openAddModal() {
	currentAction = 'add'; // Set mode tambah
	document.getElementById('categoryModalLabel').textContent = 'Tambah Kategori';
	document.getElementById('modalSaveButton').textContent = 'Tambah';
	document.getElementById('categoryName').value = ''; // Kosongkan input
	document.getElementById('categoryStatus').value = 'Aktif'; // Set default status
	new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

// Tambahkan fungsi ke window agar bisa diakses global
window.openAddModal = openAddModal;

// Fungsi untuk membuka modal edit
function openEditModal(categoryId, categoryData) {
	currentAction = 'edit';
	editCategoryId = categoryId;
	document.getElementById('categoryModalLabel').textContent = 'Edit Kategori';
	document.getElementById('modalSaveButton').textContent = 'Simpan Perubahan';
	document.getElementById('categoryName').value = categoryData.kategori;
	document.getElementById('categoryStatus').value = categoryData.status;
	new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

// Handle submit form
document.getElementById('categoryForm').addEventListener('submit', function (e) {
	e.preventDefault(); // Mencegah refresh halaman
	const name = document.getElementById('categoryName').value.trim();
	const status = document.getElementById('categoryStatus').value.trim();

	if (currentAction === 'add') {
		// Tambahkan data baru
		push(categoriesRef, { kategori: name, status: status })
			.then(() => {
				alert('Kategori berhasil ditambahkan!');
				bootstrap.Modal.getInstance(
					document.getElementById(
						'categoryModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error menambahkan data:',
					error
				)
			);
	} else if (currentAction === 'edit') {
		// Edit data yang ada
		update(ref(database, `categories/${editCategoryId}`), {
			kategori: name,
			status: status,
		})
			.then(() => {
				alert('Kategori berhasil diperbarui!');
				bootstrap.Modal.getInstance(
					document.getElementById(
						'categoryModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error memperbarui data:',
					error
				)
			);
	}
});

// Fungsi untuk menghitung total halaman
function getTotalPages(items) {
	return Math.ceil(items.length / ITEMS_PER_PAGE);
}

// Fungsi untuk merender item berdasarkan halaman
function renderPage(items, page) {
	const start = (page - 1) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;
	const itemsToShow = items.slice(start, end);

	categoryList.innerHTML = ''; // Bersihkan daftar

	itemsToShow.forEach((item) => {
		const colDiv = document.createElement('div');
		colDiv.className = 'col-md-12 mb-3';

		const cardDiv = document.createElement('div');
		cardDiv.className = 'card shadow-sm';

		const cardBody = document.createElement('div');
		cardBody.className =
			'card-body d-flex justify-content-between align-items-center';

		const categoryName = document.createElement('h5');
		categoryName.className = 'mb-0';
		categoryName.textContent = item.kategori;

		const actionsDiv = document.createElement('div');

		// Tombol Detail
		const detailBtn = document.createElement('a');
		detailBtn.className = 'btn btn-sm btn-info me-2';
		detailBtn.href = '#';
		detailBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
		detailBtn.addEventListener('click', (e) => {
			e.preventDefault();
			document.getElementById(
				'modalCategoryName'
			).textContent = item.kategori;

			const modalCategoryStatus =
				document.getElementById(
					'modalCategoryStatus'
				);
			modalCategoryStatus.textContent = item.status;

			modalCategoryStatus.className =
				item.status === 'Aktif'
					? 'badge text-bg-primary'
					: 'badge text-bg-danger';

			new bootstrap.Modal(
				document.getElementById('detailModal')
			).show();
		});

		// Tombol Edit
		const editBtn = document.createElement('a');
		editBtn.className = 'btn btn-sm btn-warning me-2';
		editBtn.href = '#';
		editBtn.innerHTML = '<i class="fas fa-edit"></i>';
		editBtn.addEventListener('click', (e) => {
			e.preventDefault();
			openEditModal(item.key, item);
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
					'Apakah Anda yakin ingin menghapus kategori ini?'
				)
			) {
				remove(
					ref(
						database,
						`categories/${item.key}`
					)
				)
					.then(() =>
						alert(
							'Kategori berhasil dihapus.'
						)
					)
					.catch((error) =>
						console.error(
							'Error:',
							error
						)
					);
			}
		});

		actionsDiv.appendChild(detailBtn);
		actionsDiv.appendChild(editBtn);
		actionsDiv.appendChild(deleteBtn);
		cardBody.appendChild(categoryName);
		cardBody.appendChild(actionsDiv);
		cardDiv.appendChild(cardBody);
		colDiv.appendChild(cardDiv);

		categoryList.appendChild(colDiv);
	});
}

// Fungsi untuk berpindah halaman
function changePage(page) {
	const totalPages = getTotalPages(categories);

	if (page < 1 || page > totalPages) return;

	currentPage = page;
	renderPage(categories, currentPage);
	document.getElementById(
		'pageInfo'
	).textContent = `Halaman ${currentPage} dari ${totalPages}`;

	// Mengatur tombol prev/next
	document.getElementById('prevPage').disabled = currentPage === 1;
	document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Menampilkan kategori dengan pagination
onValue(categoriesRef, (snapshot) => {
	categories = []; // Reset kategori

	if (!snapshot.exists()) {
		categoryList.innerHTML = '<p>Tidak ada kategori ditemukan.</p>';
		return;
	}

	snapshot.forEach((childSnapshot) => {
		const data = childSnapshot.val();
		categories.push({ key: childSnapshot.key, ...data });
	});

	changePage(1); // Render halaman pertama
});

document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
