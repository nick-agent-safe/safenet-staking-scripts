/**
 * Command to print stake statistics for a given payout period.
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
			{ header: "Staker".padEnd(42), width: 42 },
			{ header: "Validator".padEnd(42), width: 42 },
			{ header: "Average Stake", width: 29 },
		];
		printTableHeader(columns);
		for await (const { staker, amounts } of safenet.staked(period)) {
			for (const { validator, amount } of amounts) {
				printRow([staker, validator, formatSafeToken(amount)]);
			}
		}
	},
);
