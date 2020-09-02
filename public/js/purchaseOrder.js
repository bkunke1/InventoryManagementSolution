// const { getNextItem } = require("../../controllers/admin");

//not sure if this is here by mistake
// const { options } = require('../../routes/auth');

const poTable = document.getElementById('poTable');

const poTableAddLineBtn = document.getElementById('poTableAddLineBtn');

// gets UOM data from back end
let UOMs;
const getUOM = () => {
  const csrf = document.querySelector('[name=_csrf]').value;

  fetch('/po/getUOMs/', {
    method: 'GET',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      UOMs = data.uoms;
    })
    .catch((err) => {
      console.log('err', err);
    });
};
getUOM();

// gets shipping method data from back end
let shippingMethods;
const getShippingMethods = () => {
  const csrf = document.querySelector('[name=_csrf]').value;

  fetch('/po/getShippingMethods/', {
    method: 'GET',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      shippingMethods = data.shippingMethods;
    })
    .catch((err) => {
      console.log('err', err);
    });
};
getShippingMethods();

// helper function for adding/removing event listener for tabbing into new po line
const tabToNewLine = function () {
  if (event.keyCode == 9) {
    poAddNewLine();
  }
};

const poOrganizeTableData = () => {
  const poTableDataArray = [];

  const poTable = document.getElementById('poTable');
  const rows = poTable.getElementsByTagName('tr');
  //start at i = 1 to skip header row
  for (let i = 1; i < rows.length; i++) {
    // const line = {}

    const data = rows[i].getElementsByTagName('td');
    // console.log(data);
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
today.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
document.querySelector('#orderDateInput').valueAsDate = today;
document.querySelector('#expectedDateInput').valueAsDate = tomorrow;

// deletes po Line and udpates line #s
// const poLineDeleteBtn = document.getElementById('poLineDeleteBtn');
const poLineDeleteBtn = (lineBtn) => {
  const lineNum = lineBtn.closest('tr').firstElementChild.textContent;
  console.log('deleted poLine:', +lineNum);
  poTable.deleteRow(+lineNum);

  const updateLineNums = () => {
    const lines = poTable.getElementsByClassName('poTableLine');
    for (let i = 1; i <= lines.length - 1; i++) {
      console.log(lines[i].textContent);
      lines[i].textContent = i;
    }
  };
  updateLineNums();
};

// updates extended cost
const poLineUpdateExtCost = (element) => {
  const qty = element.parentElement.querySelector('.poTableQuantity')
    .textContent;
  const uom = element.parentElement.querySelector('.poTableUOM').textContent;
  const cost = element.parentElement.querySelector('.poTableCost').textContent;
  const poSum = document.querySelector('.poSum');
  let extCost = element.parentElement.querySelector('.poTableExtended');
  let extCostTotal = (+qty * 1 * +cost).toFixed(2);
  extCost.innerText = extCostTotal;

  poSum.textContent = poSumUpdate();
};

// updated po sum
const poSumUpdate = () => {
  let sum = 0;
  const listOfLines = poTable.getElementsByClassName('poTableExtended');
  for (let i = 1; i <= listOfLines.length - 1; i++) {
    sum = sum + +listOfLines[i].textContent;
  }
  return sum.toFixed(2);
};

const poAddNewLine = function () {
  // function that calculates the number of rows in the PO table so we can update the Line Numbers accordingly
  const newPOTableItemNumCalc = () => {
    let totalRowCount = -1;
    const rows = poTable.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      totalRowCount++;
    }
    return totalRowCount;
  };

  newPOTableItemNumCalc();

  const newRow = poTable.insertRow(-1);
  const newPOTableLine = newRow.insertCell(0);
  const newPOTableItemNum = newRow.insertCell(1);
  const newPOTableDescription = newRow.insertCell(2);
  const newPOTableQuantity = newRow.insertCell(3);
  const newPOTableUOM = newRow.insertCell(4);
  const newPOTableCost = newRow.insertCell(5);
  const newPOTableExtended = newRow.insertCell(6);
  const newPOTableDeleteBtn = newRow.insertCell(7);

  newPOTableDeleteBtn.innerHTML = '<a href="#">Delete</a>';
  newPOTableUOM.innerHTML = '<select></select>';

  for (uom of UOMs) {
    newPOTableUOM.firstElementChild.add(
      new Option(uom.name, uom.conversionQty)
    );
  }

  newPOTableLine.classList.add('poTableLine');
  newPOTableItemNum.classList.add('poTableItemNum');
  newPOTableDescription.classList.add('poTableDescription');
  newPOTableQuantity.classList.add('poTableQuantity');
  newPOTableUOM.classList.add('poTableUOM');
  newPOTableCost.classList.add('poTableCost');
  newPOTableExtended.classList.add('poTableExtended');
  newPOTableDeleteBtn.classList.add('poTableDeleteBtn');

  newPOTableItemNum.classList.add('poTableFocus');
  newPOTableDescription.classList.add('poTableFocus');
  newPOTableQuantity.classList.add('poTableFocus');
  newPOTableUOM.classList.add('poTableFocus');
  newPOTableCost.classList.add('poTableFocus');

  newPOTableItemNum.contentEditable = 'true';
  newPOTableDescription.contentEditable = 'true';
  newPOTableQuantity.contentEditable = 'true';
  newPOTableUOM.contentEditable = 'true';
  newPOTableCost.contentEditable = 'true';

  // setup listeners to update extended cost when updating qty, uom or cost
  newPOTableQuantity.setAttribute('onfocusout', 'poLineUpdateExtCost(this)');
  newPOTableUOM.setAttribute('onfocusout', 'poLineUpdateExtCost(this)');
  newPOTableCost.setAttribute('onfocusout', 'poLineUpdateExtCost(this)');

  newPOTableLine.innerText = newPOTableItemNumCalc();
  newPOTableItemNum.innerText = '123';
  newPOTableDescription.innerText = 'new item desc'.toUpperCase();
  newPOTableQuantity.innerText = '99';
  //   newPOTableUOM.innerText = 'EACH';
  newPOTableCost.innerText = '1.00';
  newPOTableExtended.innerText = '99.00';
  newPOTableDeleteBtn.innerHTML =
    '<i id="poLineDeleteBtn" class="fas fa-minus-circle" onclick="poLineDeleteBtn(this)"></i>';

  // adds event listener to new line and removes from the old allowing tabbing into a new line item
  const newLineTabListener = () => {
    const listOfLines = poTable.getElementsByClassName('poTableCost');
    for (let i = 0; i <= listOfLines.length - 1; i++) {
      if (i !== listOfLines.length - 1) {
        listOfLines[i].removeEventListener('keydown', tabToNewLine, true);
      } else {
        listOfLines[i].addEventListener('keydown', tabToNewLine, true);
      }
    }
  };
  newLineTabListener();
};

poTableAddLineBtn.addEventListener('click', poAddNewLine);

// Get the vendor selection modal
const modal = document.getElementById('vendorSelectionModal');

// Get the button that opens the modal
const vendorSelectionBtn = document.getElementById('vendorSelectionBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks the button, open the modal
vendorSelectionBtn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

// Get the button that selects the vendor
const vendorSelectBtn = document.getElementById('vendorSelectBtn');

// When the user clicks the button, inserts selected vendor into vendor field in purchase order
const selectVendor = function (vendorEle) {
  console.log(vendorEle);
  const vendorName = vendorEle.closest('tr').firstElementChild.textContent.trim();
  console.log(vendorName);
  const vendorInput = document.getElementById('vendorSelection');
  console.log(vendorInput);
  vendorInput.querySelector('input').value = vendorName;
  modal.style.display = 'none';
};
