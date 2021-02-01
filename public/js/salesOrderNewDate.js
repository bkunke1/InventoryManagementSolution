//populates order date and expected date fields
const today = new Date();
today.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
document.querySelector('#orderDateInput').valueAsDate = today;
document.querySelector('#expectedDateInput').valueAsDate = tomorrow;
