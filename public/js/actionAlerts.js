const updateBtn = document.getElementById('updateBtn');
const updateAlert = () => {
  alert('Updated Successfully');
};

if (updateBtn !== null) {
  updateBtn.addEventListener('click', updateAlert);
}

const createNewItem = document.getElementById('itemID-lookup');
console.log(createNewItem);
const confirmCreateNewItem = () => {
  alert("That item doesn't exist. Let's create it!");
};

if (createNewItem !== null) {
  createNewItem.addEventListener('submit', confirmCreateNewItem);
}


//doesnt work
const updateEditedFields = () => {
  console.log('test changes')
};
