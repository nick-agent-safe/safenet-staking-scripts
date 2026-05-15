/**
 * Command to print stake statistics for a given payout period.
 */

import { z } from "zod";
import { Safenet } from "../safenet.js";
import { main, rewardsPeriod } from "../utils/args.js";
import { formatSafeToken } from "../utils/format.js";
import { tableWriter } from "../utils/output.js";

main(
	{
		rewardPeriodStart: z.coerce.bigint().optional(),
		rewardPeriodEnd: z.coerce.bigint().optional(),
	},
	async (args) => {
		const safenet = await Safenet.create(args);
		const period = rewardsPeriod(args);

		const writer = tableWriter([
			{ header: "Staker".padEnd(42), width: 42, format: (v: string) => v },
			{ header: "Validator".padEnd(42), width: 42, format: (v: string) => v },
			{ header: "Average Stake", width: 29, format: formatSafeToken },
		]);
		for await (const { staker, amounts } of safenet.staked(period)) {
			for (const { validator, amount } of amounts) {
				writer.row([staker, validator, amount]);
			}
		}
	},
);
