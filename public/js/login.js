const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');

const adminBtn = document.getElementById('adminBtn');
const purchaserBrn = document.getElementById('purchaserBtn');
const salespersonBtn = document.getElementById('salespersonBtn');
const warehouseBtn = document.getElementById('warehouseBtn');

adminBtn.addEventListener('click', () => {
  emailInput.value = 'admin@customwebware.com';
  passwordInput.value = 'admin123';
});

purchaserBrn.addEventListener('click', () => {
  emailInput.value = 'purchaser@customwebware.com';
  passwordInput.value = 'purchaser123';
});

salespersonBtn.addEventListener('click', () => {
  emailInput.value = 'salesperson@customwebware.com';
  passwordInput.value = 'salesperson123';
});

warehouseBtn.addEventListener('click', () => {
  emailInput.value = 'warehouse@customwebware.com';
  passwordInput.value = 'warehouse123';
});
