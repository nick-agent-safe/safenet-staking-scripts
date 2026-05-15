/**
 * Command to print validator statistics for a given payout period.
 */

import { z } from "zod";
import { Safenet } from "../safenet.js";
import { main, rewardsPeriod } from "../utils/args.js";
import { formatSafeToken } from "../utils/format.js";
import { type Column, printRow, printTableHeader } from "../utils/table.js";

main(
	{
		rewardPeriodStart: z.coerce.bigint().optional(),
		rewardPeriodEnd: z.coerce.bigint().optional(),
	},
	async (args) => {
		const safenet = await Safenet.create(args);
		const period = rewardsPeriod(args);

		const columns: Column[] = [
			{ header: "Validator".padEnd(42), width: 42 },
			{ header: "Self Stake".padEnd(29), width: 29 },
			{ header: "Total Stake".padEnd(29), width: 29 },
		];
		printTableHeader(columns);
		const validators = await safenet.validatorStats(period);
		for (const [validator, { stake }] of Object.entries(validators)) {
			printRow([validator, formatSafeToken(stake.self.amount), formatSafeToken(stake.total)]);
		}
	},
);
