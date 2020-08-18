const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');

const adminBtn = document.getElementById('adminBtn');
const purchaserBrn = document.getElementById('purchaserBtn');
const salespersonBtn = document.getElementById('salespersonBtn');
const warehouseBtn = document.getElementById('warehouseBtn');

adminBtn.addEventListener('click', () => {
  emailInput.value = 'admin123';
  passwordInput.value = 'admin123'
});

purchaserBrn.addEventListener('click', () => {
  emailInput.value = 'purchaser123';
  passwordInput.value = 'purchaser123'
});

salespersonBtn.addEventListener('click', () => {
  emailInput.value = 'salesperson123';
  passwordInput.value = 'salesperson123'
});

warehouseBtn.addEventListener('click', () => {
  emailInput.value = 'warehouse123';
  passwordInput.value = 'warehouse123'
});
