import bcrypt from "bcrypt";
import promptModule from "prompt-sync";

// instantiate prompt to use its async-await functionality
const prompt = promptModule();
// Define an object to represent the local database
const mockDB = { passwords: {} };

const saveNewPassword = (password) => {
  mockDB.hash = bcrypt.hashSync(password, 10);
  console.log("Password has been saved!");
  showMenu();
};

// define a custom func to compare a plain-text password to a hashed password
const compareHashedPassword = async (password) => {
  // compare the input password to the value in your local database
  return await bcrypt.compare(password, mockDB.hash);
};

const promptNewPassword = () => {
  const response = prompt("Enter the main password: ");
  return saveNewPassword(response);
};

const promptOldPassword = async () => {
  let verified = false; // the flag that tracks whether the password has been verified

  while (!verified) {
    // prompt user to retype their existing password
    const response = prompt("Enter your password: ");
    // compare the input against the stored hashed password
    const result = await compareHashedPassword(response);

    if (result) {
      console.log("Password verified.");
      //  set verification flag to `true` once the password is validated
      verified = true;
      //  Show menu if the password is correct.
      showMenu();
    } else {
      // Display an error and retry if the password is incorrect
      console.log("Password incorrect. Try again.");
    }
  }
};

const showMenu = async () => {
  // prompt the user with 4 options to select
  console.log(`1. View passwords\n2. Manage new password\n3. Verify password\n4. Exit
    `);
  const response = prompt(">");
  switch (response) {
    case "1":
      viewPasswords();
      break;
    case "2":
      promptManageNewPassword();
      break;
    case "3":
      promptOldPassword();
      break;
    case "4":
      // if no valid option is selected, the user is prompted again
      process.exit();
    default:
      console.log("That's an invalid response.");
      showMenu();
  }
};

const viewPasswords = () => {
  const { passwords } = mockDB;

  Object.entries(passwords).forEach(([key, value], index) => {
    console.log(`${index + 1}. ${key} => ${value}`);
  });

  showMenu();
};

const promptManageNewPassword = () => {
  const source = prompt("Enter title for password");
  const password = prompt("Enter password to save");

  // save the source and password pair in mockDB
  mockDB.passwords[source] = password;

  console.log(`Password for ${source} has been saved!`);

  // to display the menu options
  showMenu();
};

// Start the app
if (!mockDB.hash) {
  promptNewPassword();
} else {
  promptOldPassword();
}
