// Variable Scope Example

// {
//   var varBlock = "im inside varBlcok";
//   let letBlock = "im inside letBlock";
// }

// console.log(varBlock);
// console.log(letBlock);

function checkScope() {
  const constantValue = 100; // Block-scoped

  if (true) {
    let loopCounter = 5; // Block-scoped (only visible inside this if block)
    var oldStyle = "visible outside"; // Function-scoped (Bad!)
    console.log(loopCounter); // Output: 5
  }

  // console.log(loopCounter); // 🛑 ERROR: loopCounter is not defined
  console.log(oldStyle); // Output: visible outside (This is why var is dangerous)
  console.log(constantValue); // Output: 100
}

// checkScope();

// ❌ Error! ReferenceError: oldStyle is not defined
// 'oldStyle' is only known within myFunction's block.
// The concept of 'var' being global only applies when it's
// NOT inside any function.
// console.log(oldStyle);

// 1. Traditional Function
const multiplyOld = function (a, b) {
  return a * b;
};

// 2. Arrow Function with Explicit Return (Multiple lines)
const multiplyExplicit = (a, b) => {
  const result = a * b;
  return result;
};

// 3. Arrow Function with IMPLICIT Return (Single expression)
const multiplyImplicit = (a, b) => a * b;

// console.log(multiplyImplicit(5, 4)); // Output: 20

// Practical Use: Array Methods mein
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // Implicit return use kiya
// console.log(doubled); // Output: [2, 4, 6]

// 1. Object Destructuring (MOST COMMON in React/Node)
const user = {
  id: 101,
  firstName: "Hamza",
  role: "Admin",
};

// Old Way:
// const id = user.id;
// const name = user.firstName;

// New Way (Destructuring):
const { id, firstName: name, role } = user;
// console.log(id, name, role); // Output: 101, Hamza, Admin

// 2. Array Destructuring (Less common)
const colors = ["red", "green", "blue"];
const [firstColor, secondColor] = colors;
// console.log(firstColor); // Output: red

const myObj = {
  myName: "Arslan",
  myAge: 20,
  myCity: "Karachi",
  myAgeDesignation: "Software Engineer",
};

const { myName, myAge, myCity, myAgeDesignation } = myObj;

// console.log(myName, myAge, myCity, myAgeDesignation);

// console.log("----- Spread Operator Examples -----");
// 1. Array Copying & Merging
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // Copy arr1 and add 3, 4
// console.log(arr2); // Output: [1, 2, 3, 4]

// 2. Object Copying & Updating (VERY COMMON in Redux/React)
const oldUser = { name: "Ali", age: 30, city: "Lahore" };

// Naya object banao, purana copy karo, aur sirf age change karo
const updatedUser = {
  ...oldUser,
  age: 31,
  country: "Pakistan", // Nayi property add ki
};

// console.log(updatedUser);
/* Output: 
{ name: 'Ali', age: 31, city: 'Lahore', country: 'Pakistan' } 
*/

const profile1 = {
  name: "Hadi",
  age: 25,
  city: "Islamabad",
};

const profile2 = {
  ...profile1,
  name: "Arslan",
  age: 20,
};

// console.log(profile2);

// Practice

const productDetails = {
  price: 500,
  quantity: 2,
  isAvailable: true,
};

const calculateTotal = () => {
  const { price, quantity } = productDetails;
  const Total = price * quantity;
  return Total;
};

const finalProduct = {
  ...productDetails,
  totalPrice: calculateTotal(),
};
// console.log(finalProduct);

function sum(a, b, c) {
  return a + b + c;
}

// const numbersArray = [1, 2, 3, 6, 10];
const numbersArray = [1, 2, 3];

// console.log(sum(...numbersArray));

console.log("OOP in JS");

class Product {
  constructor(name, price, quantity) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  getDetails() {
    return `Product: ${this.name}, Price: ${this.price}, Quantity: ${this.quantity}`;
  }
}

const mobile = new Product("Samsung S25 Ultra", "200", 4);
console.log(mobile.getDetails());

class DigitalProduct extends Product {
  constructor(name, price, quantity, genre) {
    super(name, price, quantity); // Parent class ka constructor call karo
    this.genre = genre;
  }

  getDetails() {
    const parentDetails = super.getDetails();
    return `${parentDetails}, Genre: ${this.genre}`;
  }
}

const eBook = new DigitalProduct(
  "Atomic Habbits",
  100,
  500,
  "Self Improvement"
);

console.log(eBook);

import { User } from "./UserService.js";

const myUser = new User("Arslan", "im@Arsalna.com");
console.log(myUser.getGreeting());
