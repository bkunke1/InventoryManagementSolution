const lotCostBtn = document.getElementById('lotCostBtn');
const toggleLotCostDetails = document.getElementById('lotCostDetails');

lotCostBtn.addEventListener('click', () => {
  console.log('worked');
  if (toggleLotCostDetails.style.display === 'none') {
    console.log(document.getElementById('lotCostDetails').textContent);
    console.log(document.getElementById('lotCostDetails').textContent.trim());
    const lotCostDetail = document
      .getElementById('lotCostDetails')
      .textContent.trim();

    toggleLotCostDetails.style.display = 'block';
  } else {
    toggleLotCostDetails.style.display = 'none';
  }
});
