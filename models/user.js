const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: String,
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//   constructor(email, password, resetToken, resetTokenExpiration, id) {
//     this.email = email;
//     this.password = password;
//     this.resetToken = resetToken;
//     this.resetTokenExpiration = resetTokenExpiration;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       //update user
//       dbOp = db
//         .collection('users')
//         .updateOne({ _id: this._id }, { $set: this });
//       console.log('updated user token');
//     } else {
//       return db
//         .collection('users')
//         .insertOne(this)
//         .then((result) => {
//           console.log('user created');
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .findOne({ _id: new mongodb.ObjectId(userId) })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findByEmail(email) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .findOne({ email: email })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findByToken(token, tokenExp) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .findOne({ resetToken: token}, { resetTokenExpiration: tokenExp })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findByTokenAndUserId(token, tokenExp, userId) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .findOne({ resetToken: token}, { resetTokenExpiration: tokenExp }, { _id: userId })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

// }

// module.exports = User;
