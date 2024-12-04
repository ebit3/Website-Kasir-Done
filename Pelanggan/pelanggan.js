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
const customerForm = document.getElementById('cutomerForm');
const modalSaveButton = document.getElementById('modalSaveButton');
const customerList = document.getElementById('customerList');
const customerModalLabel = document.getElementById('customerModalLabel');

const customerNameInput = document.getElementById('customerName');
const customerPhoneInput = document.getElementById('customerPhone');
const customerAddressInput = document.getElementById('customerAddress');
const customerStatusInput = document.getElementById('customerStatus');

// database
const customerRef = ref(database, 'customers');

//
let currentAction = ''; // Mode tambah atau edit
let editCustomertId = null; // ID produk untuk edit

// Fungsi membuka modal tambah produk
function openAddModal() {
	currentAction = 'add';
	customerModalLabel.textContent = 'Tambah Pelanggan';
	modalSaveButton.textContent = 'Tambah';
	customerForm.reset(); // Bersihkan form
	new bootstrap.Modal(document.getElementById('customerModal')).show();
}

// Fungsi membuka modal edit produk
function openEditModal(customerId, customerData) {
	currentAction = 'edit';
	editCustomertId = customerId;

	customerModalLabel.textContent = 'Edit Produk';
	modalSaveButton.textContent = 'Simpan Perubahan';

	// Set nilai form dengan data produk
	customerNameInput.value = customerData.nama;
	customerPhoneInput.value = customerData.phoneNumber;
	customerAddressInput.value = customerData.alamat;
	customerStatusInput.value = customerData.status;

	new bootstrap.Modal(document.getElementById('customerModal')).show();
}

// Tambahkan fungsi ke global agar bisa diakses
window.openAddModal = openAddModal;

// add customer
customerForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const customerData = {
		nama: customerNameInput.value.trim(),
		phoneNumber: customerPhoneInput.value.trim(),
		alamat: customerAddressInput.value.trim(),
		status: customerStatusInput.value.trim(),
	};

	if (currentAction == 'add') {
		// Tambah produk baru
		push(customerRef, customerData)
			.then(() => {
				alert(
					'Pelanggan berhasil ditambahkan!'
				);
				bootstrap.Modal.getInstance(
					document.getElementById(
						'customerModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error menambahkan pelanggan:',
					error
				)
			);
	} else if (currentAction == 'edit') {
		// Perbarui pelanggan
		update(ref(database, `customers/${editCustomertId}`), customerData)
			.then(() => {
				alert('Pelanggan berhasil diperbarui!');
				bootstrap.Modal.getInstance(
					document.getElementById(
						'customerModal'
					)
				).hide();
			})
			.catch((error) =>
				console.error(
					'Error memperbarui pelanggan:',
					error
				)
			);
	}
});

// Paginate
const ITEMS_PER_PAGE = 10; // Jumlah item per halaman
let currentPage = 1; // Halaman saat ini
let customer = []; // Array untuk menyimpan pelanggan

// Fungsi untuk menghitung total halaman
function getTotalPages(items) {
	return Math.ceil(items.length / ITEMS_PER_PAGE);
}

// Fungsi untuk merender item berdasarkan halaman
function renderPage(items, page) {
	const start = (page - 1) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;
	const itemsToShow = items.slice(start, end);

	const customerList = document.getElementById('customerList'); // Pastikan ada elemen dengan id 'customerList'
	customerList.innerHTML = ''; // Bersihkan daftar produk

	itemsToShow.forEach((item) => {
		const customer = item; // Menggunakan item langsung

		// Buat elemen card produk
		const colDiv = document.createElement('div');
		colDiv.className = 'col-md-12 mb-3';

		const cardDiv = document.createElement('div');
		cardDiv.className = 'card shadow-sm';

		const cardBody = document.createElement('div');
		cardBody.className =
			'card-body d-flex justify-content-between align-items-center';

		const customerName = document.createElement('h5');
		customerName.className = 'mb-0';
		customerName.textContent = customer.nama;

		const actionsDiv = document.createElement('div');

		// Tombol Edit
		const editBtn = document.createElement('a');
		editBtn.className = 'btn btn-sm btn-warning me-2';
		editBtn.href = '#';
		editBtn.innerHTML = '<i class="fas fa-edit"></i>';
		editBtn.addEventListener('click', (e) => {
			e.preventDefault();
			openEditModal(customer.key, customer);
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
				'detailCustomerName'
			).textContent = customer.nama;

			document.getElementById(
				'detailCustomerPhone'
			).textContent = customer.phoneNumber;

			document.getElementById(
				'detailCustomerStatus'
			).textContent = customer.status;

			const statusElement =
				document.getElementById(
					'detailCustomerStatus'
				);

			// Menambahkan class berdasarkan status
			if (customer.status === 'Aktif') {
				statusElement.className =
					'badge text-bg-primary';
			} else {
				statusElement.className =
					'badge text-bg-danger';
			}

			document.getElementById(
				'detailCustomerAddress'
			).textContent = customer.alamat;

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
					'Apakah Anda yakin ingin menghapus pelanggan ini?'
				)
			) {
				remove(
					ref(
						database,
						`customers/${customer.key}`
					)
				)
					.then(() =>
						alert(
							'Pelanggan berhasil dihapus.'
						)
					)
					.catch((error) =>
						console.error(
							'Error menghapus pelanggan:',
							error
						)
					);
			}
		});

		actionsDiv.appendChild(detailBtn);
		actionsDiv.appendChild(editBtn);
		actionsDiv.appendChild(deleteBtn);
		cardBody.appendChild(customerName);
		cardBody.appendChild(actionsDiv);
		cardDiv.appendChild(cardBody);
		colDiv.appendChild(cardDiv);

		customerList.appendChild(colDiv);
	});
}

// Fungsi untuk berpindah halaman
function changePage(page) {
	const totalPages = getTotalPages(customer);

	if (page < 1 || page > totalPages) return;

	currentPage = page;
	renderPage(customer, currentPage);
	document.getElementById(
		'pageInfo'
	).textContent = `Halaman ${currentPage} dari ${totalPages}`;

	// Mengatur tombol prev/next
	document.getElementById('prevPage').disabled = currentPage === 1;
	document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Menampilkan produk di halaman
onValue(customerRef, (snapshot) => {
	customer = []; // Reset array customer

	snapshot.forEach((childSnapshot) => {
		const data = childSnapshot.val();
		customer.push({ key: childSnapshot.key, ...data });
	});

	changePage(1); // Render halaman pertama
});

document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
