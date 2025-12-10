import bcrypt from "bcrypt";

// define a test password
const password = "test@1234";

// hash your password, with 10 salt rounds
// a cost factor of 2^10 = 1024 iterations.
const hash = bcrypt.hashSync(password, 10);

console.log(`My hashed password is: ${hash}`);
