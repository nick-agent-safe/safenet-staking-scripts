type FormatFn<T> = (item: T) => string;

export type ColumnDef<T> = {
	header: string;
	width: number;
	align?: "left" | "right";
	format: FormatFn<T> | { table: FormatFn<T>; tsv: FormatFn<T> };
};

export type Presenter<T> = {
	writeRow: (item: T) => void;
	finish: (footer?: string[]) => void;
};

const resolveFormat = <T>(col: ColumnDef<T>, mode: "table" | "tsv"): FormatFn<T> =>
	typeof col.format === "function" ? col.format : col.format[mode];

export const createPresenter = <T>(
	columns: ColumnDef<T>[],
	{ tsv = false, writer = console.log }: { tsv?: boolean; writer?: (line: string) => void } = {},
): Presenter<T> => {
	const mode = tsv ? "tsv" : "table";
	let finished = false;

	const sep = columns.map((col) => "-".repeat(col.width + 2)).join("+");
	const fmtCell = (col: ColumnDef<T>, value: string) =>
		col.align === "right" ? ` ${value.padStart(col.width)} ` : ` ${value.padEnd(col.width)} `;
	const fmtRow = (values: string[]) =>
		columns.map((col, i) => fmtCell(col, values[i] ?? "")).join("|");
	const fmtLine = tsv ? (values: string[]) => values.join("\t") : fmtRow;

	writer(fmtLine(columns.map((col) => col.header)));
	if (!tsv) writer(sep);

	const writeRow = (item: T): void => {
		writer(fmtLine(columns.map((col) => resolveFormat(col, mode)(item))));
	};

	const finish = (footer?: string[]): void => {
		if (finished) throw new Error("Presenter already finished");
		finished = true;

		if (!tsv) writer(sep);
		if (footer) writer(fmtLine(footer));
	};

	return { writeRow, finish };
};
