// const { getNextItem } = require("../../controllers/admin");

const poTable = document.getElementById('poTable');

const poTableAddLineBtn = document.getElementById('poTableAddLineBtn');

poTableAddLineBtn.addEventListener('click', (event) => {
  // function that calculates the number of rows in the PO table so we can update the Line Numbers accordingly
  const newPOTableItemNumCalc = () => {
    let totalRowCount = -2;
    const rows = poTable.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      totalRowCount++;
    }
    return totalRowCount;
  };

  newPOTableItemNumCalc();

  console.log('added new po line');
  const newRow = poTable.insertRow(-1);
  const newPOTableLine = newRow.insertCell(0);
  const newPOTableItemNum = newRow.insertCell(1);
  const newPOTableDescription = newRow.insertCell(2);
  const newPOTableQuantity = newRow.insertCell(3);
  const newPOTableUOM = newRow.insertCell(4);
  const newPOTableCost = newRow.insertCell(5);
  const newPOTableExtended = newRow.insertCell(6);
  const newPOTableDeleteBtn = newRow.insertCell(7);

  newPOTableDeleteBtn.innerHTML = `<a href="#">Delete</a>`;

  newPOTableLine.classList.add('poTableLine');
  newPOTableItemNum.classList.add('poTableItemNum');
  newPOTableDescription.classList.add('poTableDescription');
  newPOTableQuantity.classList.add('poTableQuantity');
  newPOTableUOM.classList.add('poTableUOM');
  newPOTableCost.classList.add('poTableCost');
  newPOTableExtended.classList.add('poTableExtended');
  newPOTableDeleteBtn.classList.add('poTableDeleteBtn');

  newPOTableLine.innerText = newPOTableItemNumCalc();
  newPOTableItemNum.innerText = `123`;
  newPOTableDescription.innerText = `new item desc`.toUpperCase();
  newPOTableQuantity.innerText = `99`;
  newPOTableUOM.innerText = `EACH`;
  newPOTableCost.innerText = `1.00`;
  newPOTableExtended.innerText = `99.00`;
  newPOTableDeleteBtn.innerHTML = `<i id="poLineDeleteBtn" class="fas fa-minus-circle"></i>`;
});

const poOrganizeTableData = () => {
  const poTableDataArray = [];

  const poTable = document.getElementById('poTable');
  const rows = poTable.getElementsByTagName('tr');
  //start at i = 1 to skip header row
  for (let i = 2; i < rows.length; i++) {
    // const line = {}

    const data = rows[i].getElementsByTagName('td');
    console.log(data);
    // for (let i = 0; i < data.length - 1; i++) {
    //     // console.log(data[i].textContent);
    //     // line.push(data[i].textContent);
    const line = {
      line: data[0].textContent,
      itemID: data[1].textContent,
      itemDescription: data[2].textContent,
      qtyOrdered: data[3].textContent,
      uom: data[4].textContent,
      cost: data[5].textContent,
    };

    console.log('line', line);

    poTableDataArray.push(line);
  }
  return poTableDataArray;
};

const sendTableData = () => {
  const poTableData = document.getElementById('poTableData');
  poTableData.value = JSON.stringify(poOrganizeTableData());
  //   poOrganizeTableData();
  return true;
};

//populates order date and expected date fields
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
document.querySelector('#orderDateInput').valueAsDate = today;
document.querySelector('#expectedDateInput').valueAsDate = tomorrow;

// deletes po Line and udpates line #s
const poLineDeleteBtn = document.getElementById('poLineDeleteBtn');
poLineDeleteBtn.addEventListener('click', (event) => {
  const lineNum = event.target.closest('tr').firstElementChild.textContent;
  console.log('deleted poLine:', +lineNum);
  poTable.deleteRow(+lineNum + 1);

  const updateLineNums = () => {
      const lines = poTable.getElementsByClassName('poTableLine');
        for (let i = 2; i <= lines.length - 1; i++ ) {
            console.log(lines[i].textContent);
            lines[i].textContent = i - 1;
        }       
  }
  updateLineNums();
});
