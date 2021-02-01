//populates order date and expected date fields
const today = new Date();
today.setDate(today.getDate() - 1);
document.querySelector('#expectedDateInput').valueAsDate = today;
