// const { getNextItem } = require("../../controllers/admin");

// const item = require('../../models/item');
// const { get } = require('lodash');

//not sure if this is here by mistake
// const { options } = require('../../routes/auth');

const poTable = document.getElementById('poTable');

const poTableAddLineBtn = document.getElementById('poTableAddLineBtn');

// // gets UOM data from back end
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

// // gets shipping method data from back end
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

const soOrganizeTableData = () => {
  console.log('trying to organize so table data')
  const soTableDataArray = [];

  const soTable = document.getElementById('poTable');
  const rows = soTable.getElementsByTagName('tr');
  //start at i = 1 to skip header row
  for (let i = 1; i < rows.length; i++) {
    // const line = {}

    const data = rows[i].getElementsByTagName('td');
    // console.log(data);
    // for (let i = 0; i < data.length - 1; i++) {
    //     // console.log(data[i].textContent);
    //     // line.push(data[i].textContent);
    const line = {
      line: data[0].textContent.trim(),
      itemID: data[1].textContent.trim(),
      itemDescription: data[2].textContent.trim(),
      qtyOrdered: data[3].textContent.trim(),
      uom: data[4].firstElementChild.value,
      price: data[5].textContent.trim(),
    };
    
    if (line.itemID !== '') {
      soTableDataArray.push(line);
    }
  }
  return soTableDataArray;
};

const sendTableData = () => {
  const soTableData = document.getElementById('soTableData');
  soTableData.value = JSON.stringify(soOrganizeTableData());
  //   poOrganizeTableData();
  return true;
};

const receiverOrganizeTableData = () => {
  const receiverTableDataArray = [];

  const receiverTable = document.getElementById('poTable');
  const rows = receiverTable.getElementsByTagName('tr');
  //start at i = 1 to skip header row
  for (let i = 1; i < rows.length; i++) {
    // const line = {}

    const data = rows[i].getElementsByTagName('td');
    // console.log(data);
    // for (let i = 0; i < data.length - 1; i++) {
    //     // console.log(data[i].textContent);
    //     // line.push(data[i].textContent);
    const line = {
      line: data[0].textContent.trim(),
      itemID: data[1].textContent.trim(),
      itemDescription: data[2].textContent.trim(),
      qtyOrdered: data[3].textContent.trim(),
      qtyReceived: data[4].textContent.trim(),
      uom: data[5].firstElementChild.value,
      price: data[6].textContent.trim()      
    };

    if (line.itemID !== '') {
      receiverTableDataArray.push(line);
    }
  }
  return receiverTableDataArray;
};

const sendReceiverTableData = () => {
  const receiverTableData = document.getElementById('receiverTableData');
  receiverTableData.value = JSON.stringify(receiverOrganizeTableData());
  return true;
};

// deletes po Line and udpates line #s
// const poLineDeleteBtn = document.getElementById('poLineDeleteBtn');
const poLineDeleteBtn = (lineBtn) => {
  const lineNum = lineBtn.closest('tr').firstElementChild.textContent;
  console.log('deleted poLine:', +lineNum);
  poTable.deleteRow(+lineNum);

  const updateLineNums = () => {
    const lines = poTable.getElementsByClassName('poTableLine');
    for (let i = 1; i <= lines.length - 1; i++) {
      lines[i].textContent = i;
    }
  };
  updateLineNums();
  const poSum = document.querySelector('.poSum');
  poSum.textContent = poSumUpdate();
};

// updates extended price
const poLineUpdateExtPrice = (element) => {  
  const qty = (document.querySelector('.quantityReceived')) ? element.parentElement.querySelector('.poTableQuantity').nextElementSibling
    .textContent : element.parentElement.querySelector('.poTableQuantity').textContent;
  const uom = element.parentElement.querySelector('.poTableUOM').textContent;
  const price = element.parentElement.querySelector('.poTableCost').textContent;
  const updatedPrice = element.parentElement.querySelector('.poTableCost');
  
  const poSum = document.querySelector('.poSum');
  let extPrice = element.parentElement.querySelector('.poTableExtended');
  let extPriceTotal = (+qty * 1 * +price).toFixed(2);
  extPrice.innerText = extPriceTotal;
  updatedPrice.textContent = parseFloat(price).toFixed(2);

  poSum.textContent = poSumUpdate();
};

// updates price to two decimals
function poLinePriceDecimalFormat(element) {
  console.log(element);
  element.value = parseFloat(element.value).toFixed(2);
}


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
  const newPOTablePrice = newRow.insertCell(5);
  const newPOTableExtended = newRow.insertCell(6);
  const newPOTableDeleteBtn = newRow.insertCell(7);

  newPOTableDeleteBtn.innerHTML = '<a href="#">Delete</a>';
  newPOTableUOM.innerHTML = '<select></select>';

  for (uom of UOMs) {
    newPOTableUOM.firstElementChild.add(
      new Option(uom.name, uom.name)
    );
  }

  newPOTableLine.classList.add('poTableLine');
  newPOTableItemNum.classList.add('poTableItemNum');
  newPOTableDescription.classList.add('poTableDescription');
  newPOTableQuantity.classList.add('poTableQuantity');
  newPOTableUOM.classList.add('poTableUOM');
  newPOTablePrice.classList.add('poTableCost');
  newPOTableExtended.classList.add('poTableExtended');
  newPOTableDeleteBtn.classList.add('poTableDeleteBtn');

  newPOTableItemNum.classList.add('poTableFocus');
  newPOTableDescription.classList.add('poTableFocus');
  newPOTableQuantity.classList.add('poTableFocus');
  newPOTableUOM.classList.add('poTableFocus');
  newPOTablePrice.classList.add('poTableFocus');

  newPOTableItemNum.contentEditable = 'true';
  newPOTableDescription.contentEditable = 'true';
  newPOTableQuantity.contentEditable = 'true';
  // newPOTableUOM.contentEditable = 'true'; // removed so that users can tab directly into the select element
  newPOTablePrice.contentEditable = 'true';

  // setup listeners to update extended price when updating qty, uom or price
  newPOTableQuantity.setAttribute('onfocusout', 'poLineUpdateExtPrice(this)');
  newPOTableUOM.setAttribute('onfocusout', 'poLineUpdateExtPrice(this)');
  newPOTablePrice.setAttribute('onfocusout', 'poLineUpdateExtPrice(this)');
  newPOTablePrice.setAttribute('onchange', 'poLinePriceDecimalFormat(this)')

  // commented out, was used to fill lines with fake data during testing
  newPOTableLine.innerText = newPOTableItemNumCalc();
  // newPOTableDescription.innerText = ''.toUpperCase();
  // newPOTableQuantity.innerText = '';
  // //   newPOTableUOM.innerText = 'EACH';
  // newPOTablePrice.innerText = '';
  // newPOTableExtended.innerText = '';
  newPOTableDeleteBtn.innerHTML =
    '<i id="poLineDeleteBtn" class="fas fa-minus-circle" onclick="poLineDeleteBtn(this)"></i>';

  // adds event listener to new line allowing item search selections to be inserted into po line
  newPOTableItemNum.addEventListener('keydown', itemLookupInsert, true);

  // adds event listener to new line allowing items to be entered in item num cell
  newPOTableItemNum.addEventListener('keydown', insertItem, true);

  // adds event listener to new line and removes from the old allowing tabbing into a new line item
  const newLineTabListener = () => {
    const listOfLines = poTable.getElementsByClassName('poTablePrice');
    for (let i = 0; i <= listOfLines.length - 1; i++) {
      if (i !== listOfLines.length - 1) {
        listOfLines[i].removeEventListener('keydown', tabToNewLine, true);
      } else {
        listOfLines[i].addEventListener('keydown', tabToNewLine, true);
      }
    }
  };
  newLineTabListener();
  // newPOTableItemNum.get(0).focus();
  if (newPOTableLine.textContent === '1') {
    newPOTableItemNum.focus();
  }
};

poTableAddLineBtn.addEventListener('click', poAddNewLine);

// Get the vendor selection modal
const modal = document.getElementById('vendorSelectionModal');

// Get the button that opens the modal
const vendorSelectionBtn = document.getElementById('vendorSelectionBtn');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// When the user clicks the button, open the modal
if (vendorSelectionBtn) {
  vendorSelectionBtn.onclick = function () {
    modal.style.display = 'block';
  };
}

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
  const vendorName = vendorEle
    .closest('tr')
    .firstElementChild.textContent.trim();
  console.log(vendorName);
  const vendorInput = document.getElementById('vendorSelection');
  console.log(vendorInput);
  vendorInput.querySelector('input').value = vendorName;
  modal.style.display = 'none';
};

// Line Item lookup
const insertItem = function (itemNum) {
  console.log(itemNum);
  if (event.keyCode == 13 || event.keyCode == 9) {
    event.preventDefault();
    const itemID = itemNum.target.textContent;

    const csrf = document.querySelector('[name=_csrf]').value;

    fetch(`/po/getItem/${itemID}`, {
      method: 'POST',
      headers: {
        'csrf-token': csrf,
      },
    })
      .then((result) => {
        return result.json();
      })
      .then((item) => {
        const itemID = itemNum.target;
        const itemDescription = itemID.nextElementSibling;
        const itemQuantity = itemDescription.nextElementSibling;
        const itemPurchaseUOM = itemQuantity.nextElementSibling;
        const itemPrice = itemPurchaseUOM.nextElementSibling;
        itemID.textContent = item.itemID;
        itemDescription.textContent = item.description;
        itemQuantity.focus();
        itemPrice.textContent = item.defaultPrice;
        for (option of itemPurchaseUOM.firstElementChild.options) {
          if (option.text === item.purchaseUOM) {
            option.setAttribute('selected', true);
          }
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  }
  console.log('failed');
};

// Get the item selection modal
const itemModal = document.getElementById('itemSelectionModal');

// Get the button that opens the modal
const itemSelectionBtn = document.getElementById('itemSelectionBtn');

// Get the <span> element that closes the modal
const itemSpan = document.getElementsByClassName('close')[1];

// When the user clicks the button, open the modal
if (itemSelectionBtn) {
  itemSelectionBtn.onclick = function () {
    itemModal.style.display = 'block';
  };
}


// When the user clicks on <span> (x), close the modal
if (itemSpan) {
  itemSpan.onclick = function () {
    itemModal.style.display = 'none';
  };
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == itemModal) {
    itemModal.style.display = 'none';
  }
};

// Get the button that selects the item
const itemSelectBtn = document.getElementById('itemSelectBtn');

// When the user clicks the button, inserts selected item into item field in purchase order
const selectItem = function (itemEle) {
  const itemID = itemEle.closest('tr').firstElementChild.textContent.trim();
  console.log(itemID);
  insertItemFromSearchModal(itemID);
  itemModal.style.display = 'none';
};

// Lets user use F1 to insert item search selection into po line
const itemLookupInsert = function () {
  if (event.keyCode == 112) {
    event.preventDefault();
    console.log(event);
    itemModal.style.display = 'block';
  }
};

////////////////////////////////
//..Item selection filtering..//
////////////////////////////////
const applyFilterBtn = document.getElementById('applyFilterBtn');

const applyItemSelectionFilter = () => {
  const filterType = document.getElementById('itemSearchFilterSelection').value;
  const filterOperator = document.getElementById('itemSearchFilterOperator')
    .value;

  const filterInput = document.getElementById('itemSearchFilterValue');
  const filterValue = filterInput.value.toUpperCase();

  const itemTable = document.getElementById('itemSelectionTable');
  const tr = itemTable.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const sortingIndex = (filterType) => {
      return filterType === 'itemID'
        ? 0
        : filterType === 'description'
        ? 1
        : filterType === 'category'
        ? 2
        : filterType === 'type'
        ? 3
        : 4;
    };
    let td = tr[i].getElementsByTagName('td')[sortingIndex(filterType)];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filterValue) > -1) {
        tr[i].style.display = '';
      } else {
        tr[i].style.display = 'none';
      }
    }
  }
};

// applyFilterBtn.addEventListener('click', applyItemSelectionFilter); // removed because we're using keyup event instead of apply button

const insertItemFromSearchModal = function (itemNum) {
  poAddNewLine();
  const table = document.getElementById('poTable');
  const rows = table.getElementsByTagName('tr');
  const lastRow = rows[rows.length - 1];
  console.log('last', lastRow);
  const insertionPoint = lastRow.firstElementChild.nextElementSibling;
  console.log(insertionPoint);
  const csrf = document.querySelector('[name=_csrf]').value;

  fetch(`/po/getItem/${itemNum}`, {
    method: 'POST',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((item) => {
      const itemID = insertionPoint;
      const itemDescription = itemID.nextElementSibling;
      const itemQuantity = itemDescription.nextElementSibling;
      const itemPurchaseUOM = itemQuantity.nextElementSibling;
      const itemPrice = itemPurchaseUOM.nextElementSibling;
      itemID.textContent = item.itemID;
      itemDescription.textContent = item.description;
      itemQuantity.focus();
      itemPrice.textContent = item.defaultPrice;
      for (option of itemPurchaseUOM.firstElementChild.options) {
        if (option.text === item.purchaseUOM) {
          option.setAttribute('selected', true);
        }
      }
    })
    .catch((err) => {
      console.log('err', err);
    });
};

/////////////////////
// poSearch///////
//////////////

// Get the vendor selection modal
const poSelectionModal = document.getElementById('poSelectionModal');

// Get the button that opens the modal
const poSelectionBtn = document.getElementById('poSelectionBtn');

// Get the <span> element that closes the modal
const poSearchSpan = document.getElementsByClassName('close')[2];

// When the user clicks the button, open the modal
poSelectionBtn.onclick = function () {
  poSelectionModal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
if (poSearchSpan) {
  poSearchSpan.onclick = function () {
    poSelectionModal.style.display = 'none';
  };
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == poSelectionModal) {
    poSelectionModal.style.display = 'none';
  }
};

// Get the button that selects the vendor
const poSelectBtn = document.getElementById('poSelectBtn');

// When the user clicks the button, displays the selected SO
const selectSO = function (soEle) {
  console.log('soEle', soEle);
  const soNum =
    soEle.parentElement.previousElementSibling.previousElementSibling.previousElementSibling
      .textContent;
  '1'.trim();
  console.log(soNum);
  
  displaySOFromSearchModal(soNum);
  soSelectionModal.style.display = 'none';
};

const displaySOFromSearchModal = function (soNum) {
  const csrf = document.querySelector('[name=_csrf]').value;

  fetch(`/so/view/${soNum}`, {
    method: 'GET',
    headers: {
      'csrf-token': csrf,
    },
  })
  .then(result => {
    console.log(result);
    window.location.href = `${result.url}`
  }).catch((err) => {
    console.log('err', err);
  });
};

////////////////////////////////
//..PO selection filtering..//
////////////////////////////////

const applyPOSelectionFilter = () => {
  const filterType = document.getElementById('poSearchFilterSelection').value;
  const filterOperator = document.getElementById('poSearchFilterOperator')
    .value;

  const filterInput = document.getElementById('poSearchFilterValue');
  const filterValue = filterInput.value.toUpperCase();

  const poTable = document.getElementById('poSelectionTable');
  const tr = poTable.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const sortingIndex = (filterType) => {
      return filterType === 'orderDate'
        ? 0
        : filterType === 'expectedDate'
        ? 1
        : filterType === 'poNum'
        ? 2
        : filterType === 'status'
        ? 3
        : 4;
    };
    let td = tr[i].getElementsByTagName('td')[sortingIndex(filterType)];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filterValue) > -1) {
        tr[i].style.display = '';
      } else {
        tr[i].style.display = 'none';
      }
    }
  }
};

