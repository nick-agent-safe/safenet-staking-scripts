/**
 * Command to print current network totals.
 */

import path from "node:path";
import { z } from "zod";
import { Safenet } from "../safenet.js";
import { main } from "../utils/args.js";
import { formatSafeToken } from "../utils/format.js";
import { writeJsonFile } from "../utils/json.js";
import { tableWriter } from "../utils/output.js";

main(
	{
		record: z.string().optional(),
	},
	async (args) => {
		const safenet = await Safenet.create(args);

		const writer = tableWriter([
			{ header: "Total Stake".padEnd(29), width: 29, format: formatSafeToken },
			{
				header: "Transactions".padEnd(20),
				width: 20,
				format: (v: number) => v.toString().padStart(20),
			},
		]);
		const { stake, transactions } = await safenet.totals();
		writer.row([stake, transactions]);

		if (args.record !== undefined) {
			const networksFile = path.join(args.record, "assets", "network-info.json");
			await writeJsonFile(networksFile, {
				total_staked_amount: formatSafeToken(stake).trim(),
				total_transactions_checked: transactions,
			});
		}
	},
);
