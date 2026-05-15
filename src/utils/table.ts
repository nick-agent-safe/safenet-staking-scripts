/**
 * Utilities for rendering aligned text tables to stdout.
 *
 * The format is:
 *   ` cell | cell | cell`           (row: leading space, ` | ` between cells)
 *   `------+------+------`          (separator: width+2 dashes per column, `+` joins)
 *
 * Column widths control only the separator dash count. Cell strings are written
 * verbatim; callers pad cells to the desired width using `padStart` / `padEnd`,
 * or pre-padded formatters like `formatSafeToken`.
 */

export type Column = {
	header: string;
	width: number;
};

/**
 * Prints one row from already-formatted cell strings.
 */
export const printRow = (cells: readonly string[]): void => {
	console.log(` ${cells.join(" | ")}`);
};

/**
 * Prints a `---+---` separator for the given columns.
 */
export const printSeparator = (columns: readonly Column[]): void => {
	console.log(columns.map(({ width }) => "-".repeat(width + 2)).join("+"));
};

/**
 * Prints the header row followed by a separator.
 */
export const printTableHeader = (columns: readonly Column[]): void => {
	printRow(columns.map(({ header }) => header));
	printSeparator(columns);
};
