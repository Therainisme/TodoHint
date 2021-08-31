import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const arg: any = yargs(hideBin(process.argv)).argv;

console.log(arg);

if (arg.secret === "Hello") console.log("Yes!");
else console.log("No");

console.log('--------');
console.log(process.argv);
