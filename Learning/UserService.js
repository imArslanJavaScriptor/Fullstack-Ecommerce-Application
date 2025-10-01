// UserService.js

/**
 * User class: User ki basic properties aur methods ko define karta hai.
 */
export class User {
  // ⬅️ Named Export kiya 'User' class ko

  // Constructor: Object banate waqt initial values set karta hai
  constructor(firstName, email) {
    this.firstName = firstName; // Property 1
    this.email = email; // Property 2
  }

  // Method: User ke liye greeting message return karta hai
  getGreeting() {
    return `Hello, ${this.firstName}! Your email is ${this.email}.`;
  }
}

// NOTE: Humne koi 'default' export nahi kiya hai, sirf 'named export' kiya hai.
