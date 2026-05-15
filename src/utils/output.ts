/**
 * Utilities for rendering data to stdout in various formats.
 *
 * The table format is:
 *   ` cell | cell | cell`           (row: leading space, ` | ` between cells)
 *   `------+------+------`          (separator: width+2 dashes per column, `+` joins)
 *
 * Column widths control only the separator dash count. Each column's `format`
 * function converts a typed value to the final cell string; callers are
 * responsible for any padding within that function.
 */

export type Column<T> = {
	header: string;
	width: number;
	format: (value: T) => string;
};

type RowValues<C extends readonly Column<any>[]> = {
	[K in keyof C]: C[K] extends Column<infer T> ? T : never;
};

type TableWriter<C extends readonly Column<any>[]> = {
	row: (values: RowValues<C>) => void;
	separator: () => void;
};

/**
 * Creates a table writer that renders rows as aligned, pipe-delimited text.
 *
 * Prints the header and opening separator immediately. Call `row` for each
 * data row and `separator` to insert an additional separator (e.g. before a
 * footer row).
 */
export const tableWriter = <const C extends readonly Column<any>[]>(columns: C): TableWriter<C> => {
	const sep = () => console.log(columns.map(({ width }) => "-".repeat(width + 2)).join("+"));

	console.log(` ${columns.map(({ header }) => header).join(" | ")}`);
	sep();

	return {
		row: (values) => {
			const cells = columns.map((col, i) => col.format((values as any)[i]));
			console.log(` ${cells.join(" | ")}`);
		},
		separator: sep,
	};
};
