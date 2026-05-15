/**
 * Command to print validator statistics for a given payout period.
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
			{ header: "Validator".padEnd(42), width: 42, format: (v: string) => v },
			{ header: "Self Stake".padEnd(29), width: 29, format: formatSafeToken },
			{ header: "Total Stake".padEnd(29), width: 29, format: formatSafeToken },
		]);
		const validators = await safenet.validatorStats(period);
		for (const [validator, { stake }] of Object.entries(validators)) {
			writer.row([validator, stake.self.amount, stake.total]);
		}
	},
);
