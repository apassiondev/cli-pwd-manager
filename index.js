import bcrypt from "bcrypt";
import chalk from "chalk";
import { MongoClient, ReturnDocument } from "mongodb";
import promptModule from "prompt-sync";

const dbConfig = {
  // auth: "admin",
  // user: encodeURIComponent("usr"),
  user: encodeURIComponent("pwd1"),
  pass: encodeURIComponent("pwd@@pwd"),
  name: "passwordsdb" /* set the database name to "passwordManager" */,
  url: null /* database URL for db connection */,
};

// define database URL for db connection
// dbConfig.url = `mongodb://${dbConfig.user}:${dbConfig.pass}@localhost:27017/?authSource=${dbConfig.name}`;
dbConfig.url = `mongodb://${dbConfig.user}:${dbConfig.pass}@localhost:27017`;
// create a new MongoDB Client instance to MongoDB server
const mongoClient = new MongoClient(dbConfig.url);
// declare a flag to track whether a master password already exists.
let hasPasswords = false;
let passwordsCollection, authCollection;

// instantiate prompt to use its async-await functionality
const prompt = promptModule();

const menuText = [
  "[1] View passwords",
  "[2] Manage new password",
  "[3] Verify password",
  "[4] Exit",
];

const saveNewPassword = async (password) => {
  const hash = bcrypt.hashSync(password, 10);
  await authCollection.insertOne({
    type: "auth",
    hash,
  });
  console.log(chalk.green("Password has been saved!"));
  showMenu();
};

// define a custom func to compare a plain-text password to a hashed password
const compareHashedPassword = async (plainPassword) => {
  // search MongoDB's authCollection for a hashed password
  const { hash } = await authCollection.findOne({ type: "auth" });
  // send the found hashed password to compare with the input password (plain)
  return bcrypt.compareSync(plainPassword, hash);
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

const promptOldPassword = async () => {
  let verified = false; // the flag that tracks whether the password has been verified

  while (!verified) {
    // prompt user to retype their existing password
    const response = prompt("Enter your current password: ", { echo: "*" });
    // compare the input against the stored hashed password

    try {
      const result = await compareHashedPassword(response);

      if (result) {
        console.log(chalk.green("Password verified!".toUpperCase()));
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

const showMenu = async () => {
  console.log(new Array(20).join("-"));
  // prompt the user with 4 options to select
  console.log(`${menuText.join("\n")}`);
  const response = prompt("Choose an option: ");
  switch (parseInt(response)) {
    case 1:
      await viewPasswords();
      break;
    case 2:
      await promptManageNewPassword();
      break;
    case 3:
      await promptOldPassword();
      break;
    case 4:
      process.exit();
    default:
      // if no valid option is selected, navigate to the main menu.
      console.log(chalk.red("That's an invalid response."));
      showMenu();
  }
};

const viewPasswords = async () => {
  // query all passwords from passwordCollection
  const passwords = await passwordsCollection.find({}).toArray();

  // iterate through the passwords and log them into console
  if (passwords.length) {
    passwords.forEach(({ source, password }, index) => {
      console.log(`${index + 1}. ${source} => ${password}`);
    });
  } else {
    console.log(chalk.yellow("No passwords found!".toUpperCase()));
  }

  showMenu();
};

const promptManageNewPassword = async () => {
  const source = prompt("Enter title for password: ");
  const password = prompt("Enter password to save: ", { echo: "*" });

  // look for an existing password that matches your `source`
  // then set its value to the `password` variable.
  await passwordsCollection.findOneAndUpdate(
    { source },
    {
      $set: { password },
    },
    {
      returnDocument: true,
      upsert: true,
    }
  );

  console.log(
    chalk.green(`Password for "${source}" has been saved!`.toUpperCase())
  );

  showMenu();
};

const app = async () => {
  try {
    // establish a connection to your db server
    await mongoClient.connect();
    console.log(chalk.green("DB Connected".toUpperCase()));
    console.log(chalk.gray(`[${new Date().toISOString()}]`));

    // create or connect to a db with specific db "passwordManager"
    const db = mongoClient.db(dbConfig.name);

    // create database collections called "auth" and "passwords"
    authCollection = db.collection("auth"); // store hashed password
    passwordsCollection = db.collection("passwords"); // store passwords list

    // check if a hashed password with type of "auth" existed in your "auth" collection
    const hashedPassword = await authCollection.findOne({ type: "auth" });
    // return the boolean value of your resulting search in the db
    // true => there's an existing hashed password. Otherwise, return false
    return !!hashedPassword;
  } catch (error) {
    // if there is any caught exception found, exit the process
    console.error(chalk.red("Error connecting to database:"), error);
    process.exit(1);
  }
};

const main = async () => {
  const hasPassword = await app();

  if (hasPassword) {
    promptOldPassword();
  } else {
    promptNewPassword();
  }
};

main();
