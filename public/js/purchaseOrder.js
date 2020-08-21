const poTableAddLineBtn = document.getElementById('poTableAddLineBtn');

const newPoTableLine = document.createElement('tr');

poTableAddLineBtn.addEventListener('click', (event) => {
  console.log('this', event);
  console.log('added new line');
  newPoTableLine.innerHTML = `
                  <td class="poTableLine"><button id="poTableAddLineBtn" type="button">+</button></td>
                  <td class="poTableDescription"></td>
                  <td class="poTableQuantity"></td>
                  <td class="poTableUOM"></td>
                  <td class="poTableCost"></td>
                  <td class="poTableExtended"></td>
                  <td class="poTableDeleteBtn"></td>
    `;
    poTableAddLineBtn.
});
