import bcrypt from "bcrypt";
import chalk from "chalk";
import promptModule from "prompt-sync";

// instantiate prompt to use its async-await functionality
const prompt = promptModule();
// Define an object to represent the local database
const mockDB = { passwords: {} };

const menuText = [
  "[1] View passwords",
  "[2] Manage new password",
  "[3] Verify password",
  "[4] Exit",
];

const saveNewPassword = (password) => {
  mockDB.hash = bcrypt.hashSync(password, 10);
  console.log(chalk.green("Password has been saved!"));
  showMenu();
};

// define a custom func to compare a plain-text password to a hashed password
const compareHashedPassword = (plainPassword) => {
  // compare the input plainPassword to the value in your local database
  return bcrypt.compareSync(plainPassword, mockDB.hash);
};

const promptNewPassword = () => {
  const response = prompt(
    "Enter the main password: ",
    {
      echo: "*",
    } /* hide the input completely with specifying a character to task the input  */
  );
  saveNewPassword(response);
};

const promptOldPassword = () => {
  let verified = false; // the flag that tracks whether the password has been verified

  while (!verified) {
    console.log("Verify?:", verified);
    // prompt user to retype their existing password
    const response = prompt("Enter your current password: ", { echo: "*" });
    // compare the input against the stored hashed password

    try {
      const result = compareHashedPassword(response);
      console.log("Result:", result);

      if (result) {
        console.log(chalk.green("Password verified!"));
        //  set verification flag to `true` once the password is validated
        verified = true;
        //  Show menu if the password is correct.
        showMenu();
      } else {
        // Display an error and retry if the password is incorrect
        console.log(chalk.red("Password incorrect! Try again."));
      }
    } catch (error) {
      throw new Error(error);
    }
  }
};

const showMenu = () => {
  // prompt the user with 4 options to select
  console.log(`${menuText.join("\n")}`);
  const response = prompt("Choose an option: ");
  switch (parseInt(response)) {
    case 1:
      viewPasswords();
      break;
    case 2:
      promptManageNewPassword();
      break;
    case 3:
      promptOldPassword();
      break;
    case 4:
      process.exit();
    default:
      // if no valid option is selected, navigate to the main menu.
      console.log(chalk.red("That's an invalid response."));
      showMenu();
  }
};

const viewPasswords = () => {
  const passwordEntries = Object.entries(mockDB.passwords || {});

  if (passwordEntries.length) {
    passwordEntries.forEach(([key, value], index) => {
      console.log(`${index + 1}. ${key} => ${value}`);
    });
    return;
  }

  console.log(chalk.yellow("No passwords found!".toUpperCase()));
  showMenu();
};

const promptManageNewPassword = () => {
  const source = prompt("Enter title for password: ");
  const password = prompt("Enter password to save: ", { echo: "*" });

  // save the source and password pair in mockDB
  mockDB.passwords[source] = password;

  console.log(
    chalk.green(`Password for "${source}" has been saved!`.toUpperCase())
  );

  showMenu();
};

// Start the app
const main = async () => {
  // If there is no existing hash value
  if (!mockDB.hash) {
    promptNewPassword();
  } else {
    promptOldPassword();
  }

  showMenu();
};

main();
