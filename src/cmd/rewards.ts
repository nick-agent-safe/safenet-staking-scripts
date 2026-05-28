/**
 * Command to print reward payouts for a given payout period.
 */

import { formatUnits, getAddress, parseUnits } from "viem";
import { z } from "zod";
import { MerkleDb } from "../merkledb/index.js";
import { Safenet } from "../safenet.js";
import { main, rewardsPeriod, totalRewardsAmount } from "../utils/args.js";
import { writeTransactionBundle } from "../utils/bundle.js";
import { formatSafeToken } from "../utils/format.js";
import { createPresenter } from "../utils/presentation.js";

type PayoutItem = { recipient: string; amount: bigint };

main(
	{
		rewardPeriodStart: z.coerce.bigint().optional(),
		rewardPeriodEnd: z.coerce.bigint().optional(),
		totalRewards: z
			.string()
			.transform((v) => parseUnits(v, 18))
			.optional(),
		kycThreshold: z
			.string()
			.transform((v) => parseUnits(v, 18))
			.optional(),
		tsv: z.boolean().optional(),
		record: z.string().optional(),
		cumulativeMerkleDropAddress: z
			.string()
			.transform((v) => getAddress(v))
			.optional(),
	},
	async (args) => {
		const safenet = await Safenet.create(args);
		const period = rewardsPeriod(args);
		const totalAmount = await totalRewardsAmount(args);

		const { payouts, unpaid } = await safenet.rewards(period, totalAmount);
		const meetsKyc = (amount: bigint) => !!args.kycThreshold && amount >= args.kycThreshold;
		const presenter = createPresenter<PayoutItem>(
			[
				{
					header: "Recipient",
					width: 42,
					format: ({ recipient }) => recipient,
				},
				{
					header: "Payout",
					width: 29,
					align: "right",
					format: ({ amount }) => formatUnits(amount, 18),
				},
				{
					header: "KYC",
					width: 3,
					format: {
						table: ({ amount }) => (meetsKyc(amount) ? "*" : ""),
						tsv: ({ amount }) => (meetsKyc(amount) ? "TRUE" : "FALSE"),
					},
				},
			],
			args,
		);

		for (const [recipient, amount] of Object.entries(payouts)) {
			presenter.writeRow({ recipient, amount });
		}

		presenter.finish(["Unpaid", formatUnits(unpaid, 18), ""]);

		if (args.record) {
			const sanctions = await safenet.sanctionedAccounts(period);
			const db = new MerkleDb({ record: args.record });
			const filters = { sanctions, ...args };
			const update = await db.distribute(period, payouts, unpaid, filters);

			console.log();
			if (update === null) {
				console.warn("WARNING: skipped or already processed reward period, not recording.");
			} else {
				console.log(`Merkle Root:        ${update.merkleRoot}`);
				console.log(`Additional Amount:  ${formatSafeToken(update.additionalAmount).trim()}`);

				if (args.cumulativeMerkleDropAddress !== undefined) {
					const safeTokenAddress = await safenet.safeToken();
					const bundle = await writeTransactionBundle(
						args.record,
						`rewards-${period.toTimestamp}`,
						[
							{
								to: args.cumulativeMerkleDropAddress,
								contractMethod: {
									inputs: [
										{
											name: "merkleRoot_",
											type: "bytes32",
											internalType: "bytes32",
										},
									],
									name: "setMerkleRoot",
									payable: false,
								},
								contractInputsValues: {
									merkleRoot_: update.merkleRoot,
								},
							},
							{
								to: safeTokenAddress,
								contractMethod: {
									inputs: [
										{
											name: "to",
											type: "address",
											internalType: "address",
										},
										{
											name: "amount",
											type: "uint256",
											internalType: "uint256",
										},
									],
									name: "transfer",
									payable: false,
								},
								contractInputsValues: {
									to: args.cumulativeMerkleDropAddress,
									amount: update.additionalAmount,
								},
							},
						],
					);
					console.log(`Transaction Bundle: ${bundle}`);
				}
			}
		}
	},
);
