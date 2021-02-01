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
const itemSelectBtn = document.getElementById('itemSearchSelectBtn');

// When the user clicks the button, inserts selected item into item field in purchase order
const itemSearchSelectBtn = function (itemEle) {
  const itemID = itemEle.closest('tr').firstElementChild.textContent.trim();
  console.log(itemID);
  insertItemFromSearchModal(itemID);
  itemModal.style.display = 'none';
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
        : filterType === 'status'
        ? 1
        : filterType === 'description'
        ? 2
        : filterType === 'category'
        ? 3
        : filterType === 'type'
        ? 4
        : filterType === 'defaultWarehouse'
        ? 5
        : filterType === 'BaseUOM'
        ? 6
        : filterType === 'SalesUOM'
        ? 7
        : filterType === 'PurchaseUOM'
        ? 8
        : filterType === 'QtyOnHand'
        ? 9
        : filterType === 'QtyOnOrder'
        ? 10
        : filterType === 'QtyAllocated'
        ? 11
        : filterType === 'QtyAvailable'
        ? 12
        : 13;
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
