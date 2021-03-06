# Inventory Management Solution

IMS is an application that simulates the inventory mangement module of traditional Enterprise Resource Planning (ERP) Software. Features include user creation/password hashing with email verification, role securities, purchase orders, sales orders, inventory maintenance, and PDF reports. Create items with custom parameters and use them in purchase orders to increase quantity on hand and costs accordingly by posting the transactions. Sell items in sales orders to reduce inventory using pricing setup in the inventory maintenance menu. All transactions are able to print to PDF along with a stock status report to provide important information for inventory management.

### Screenshots - (click for full resolution)

![Purchase Order Creation](https://media0.giphy.com/media/S7nqHNpFW0fWsD3ANw/giphy.gif)

<p float="left">
  <img src="https://user-images.githubusercontent.com/51406378/109668704-699d3a80-7b3f-11eb-9f5e-ab33c7a4c956.png" width="300" height="300" alt="login screen" />
  <img src="https://user-images.githubusercontent.com/51406378/109668844-8c2f5380-7b3f-11eb-8d87-426c3307ca53.png" width="300" height="300" alt="purchase order screen" />
  <img src="https://user-images.githubusercontent.com/51406378/109668960-a6693180-7b3f-11eb-9553-19d30eb76f5f.png" width="300" height="300" alt="purchase order pdf report" />
</p>

<p float="left">
  <img src="https://user-images.githubusercontent.com/51406378/109669113-d0225880-7b3f-11eb-946c-1f28d2a55e7d.png" width="300" height="300" alt="item search menu" />
  <img src="https://user-images.githubusercontent.com/51406378/109669214-e6c8af80-7b3f-11eb-88cd-314397ab65f0.png" width="300" height="300" alt="item maintenance menu" />
<img src="https://user-images.githubusercontent.com/51406378/109669342-ff38ca00-7b3f-11eb-89e0-11a05ff7f2d9.png" width="300" height="300" alt="stock status pdf report" />
</p>

### Prerequisites

node.js

### Installing

initialize node_modeules:

```
npm install
```

### Deployment

launch dev server to http://localhost:3000/:

```
npm run start:dev
```


## Built With

* [Node.js](https://nodejs.org/en/docs/) - The web framework used
* [Express.js](https://expressjs.com/) - Framework used
* [EJS](https://ejs.co/#docs) - Used to embedd JavaScript and generate view templates
* [MongoDB](https://docs.mongodb.com/) - noSQL database used to store data

## Authors

* **Brandon Kunkel** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
