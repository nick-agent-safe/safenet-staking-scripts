/**
 * Command to print the list of sanctioned accounts considered for a payout period.
 */

import { Safenet } from "../safenet.js";
import { main } from "../utils/args.js";
import { tableWriter } from "../utils/output.js";

main(async (args) => {
	const safenet = await Safenet.create(args);

	const writer = tableWriter([{ header: "Account", width: 42, format: (v: string) => v }]);
	for (const account of await safenet.sanctionedAccounts()) {
		writer.row([account]);
	}
});
