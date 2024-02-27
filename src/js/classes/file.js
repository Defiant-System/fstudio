
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "otf" });
		// reference to loaded font object
		this.font = OpenType.parse(fsFile.arrayBuffer);

		console.log( this.font );

		let xParent = window.bluePrint.selectSingleNode(`//Data/Files`);
		let xAttr = [],
			xGroups = [];

		xAttr.push(`name="${this.font.tables.name.fontFamily.en}"`);
		xAttr.push(`style="${this.font.tables.name.fontSubfamily.en}"`);
		xAttr.push(`glyphs="${this.font.numGlyphs}"`);
		xAttr.push(`filename="${this.base}"`);
		xAttr.push(`size="${+(fsFile.size / 1024).toFixed(1)} kB"`);

		xGroups.push(`<Group name="Categories">
						<i name="All" icon="icon-category-all"/>
						<i name="Letter" icon="icon-category-letter" sets="1,2"/>
						<i name="Number" icon="icon-category-number" sets="3"/>
						<i name="Punctuation" icon="icon-category-punctuation" sets="4"/>
						<i name="Separator" icon="icon-category-separator" sets="5"/>
						<i name="Symbol" icon="icon-category-symbol" sets="6"/>
						<i name="Ligature" icon="icon-category-ligature" sets="7"/>
					</Group>`);
		xGroups.push(`<Group name="Languages">
						<i state="disabled" name="Latin" icon="icon-language-latin"/>
						<i state="disabled" name="Cryllic" icon="icon-language-cryllic"/>
						<i state="disabled" name="Greek" icon="icon-language-greek"/>
					</Group>`);

		let xNode = $.nodeFromString(`<File ${xAttr.join(" ")}>${xGroups.join("\n")}</File>`);
		this._xNode = xParent.appendChild(xNode);

		switch (this.kind) {
			case "otf":
			case "ttf":
			case "woff":
				break;
		}
	}

	get kind() {
		return this._file.kind;
	}

	get base() {
		let path = this._file.path,
			base = this._file.base;
		if (!base) base = path.slice(path.lastIndexOf("/") + 1);
		return base;
	}

	toBlob(opt={}) {
		let kind = opt.kind || this.kind,
			type;

		switch (kind) {
			case "otf":
			case "ttf":
			case "woff":
				break;
		}
		// console.log( data );
		return new Blob([data], { type });
	}
}
