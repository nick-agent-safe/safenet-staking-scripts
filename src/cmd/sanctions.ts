/**
 * Command to print the list of sanctioned accounts considered for a payout period.
 */

import { Safenet } from "../safenet.js";
import { main } from "../utils/args.js";
import { type Column, printRow, printTableHeader } from "../utils/table.js";

main(async (args) => {
	const safenet = await Safenet.create(args);

	const columns: Column[] = [{ header: "Account", width: 42 }];
	printTableHeader(columns);
	for (const account of await safenet.sanctionedAccounts()) {
		printRow([account]);
	}
});
