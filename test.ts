import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const arg = yargs(hideBin(process.argv)).argv;
console.log(arg);
console.log('--------');
console.log(process.argv);