
class File {
	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "otf" });
		// reference to loaded font object
		this.font = OpenType.parse(fsFile.arrayBuffer);

		// draw black glyph and put it in app cache
		this._cached = [];
		let cvs = $(`<canvas width="50" height="59" style="position: absolute; top: 0; left: 0;"></canvas>`)[0],
			ctx = cvs.getContext("2d", { willReadFrequently: true }),
			glyphs = this.font.glyphs,
			keys = Object.keys(glyphs.glyphs),
			// for progress bar
			workload = keys.length-1,
			pEl,
			// work function
			parseNext = () => {
				let glyph = glyphs.get(+keys.shift()),
					hexCode = (glyph.unicode || 0).toHex(),
					fontSize = 47,
					scale = 1 / glyph.path.unitsPerEm * fontSize,
					w = 50,
					x = (w - (glyph.advanceWidth * scale)) >> 1,
					y = 47;
				
				// clear canvas
				cvs.width = w;
				glyph.draw(ctx, x, y, fontSize);

				// update progress-bar
				if (!pEl || !pEl.length) {
					pEl = window.find(`.font-details .progress`);
					pEl.parent().addClass("working");
				}
				pEl.css({ "--progress": (1 - (keys.length / workload)) * 100 | 1 });

				cvs.toBlob(async blob => {
					let name = `${hexCode}.png`;
					await window.cache.set({ name, blob });
					// add bg-node for rendereing
					this._cached.push(hexCode);
					// look up HTML element & add attribute
					window.find(`.glyph-list .glyph[data-id="${hexCode}"]`).css({ "--bg": `url('~/cache/${name}')` });
					// draw next glyph
					if (keys.length) parseNext();
					else pEl.parent().removeClass("working");
				});
			};
		// temp:
		// this._cached.push("0x41", "0x42", "0x43");
		parseNext();

		// add font details to app blueprint
		let tables = this.font.tables.name,
			xParent = window.bluePrint.selectSingleNode(`//Data/Files`),
			xAttr = [],
			xGroups = [];
		// font object 
		tables = tables.fontFamily ? tables : tables.macintosh || tables.windows;
		// font node details
		xAttr.push(`name="${tables.fontFamily.en}"`);
		xAttr.push(`style="${tables.fontSubfamily.en || "Regular"}"`);
		xAttr.push(`glyphs="${this.font.numGlyphs}"`);
		xAttr.push(`filename="${this.base}"`);
		xAttr.push(`size="${+(fsFile.size / 1024).toFixed(1)} kB"`);
		// sidebar tree
		xGroups.push(`<Group name="Categories">
						<i name="All" icon="icon-category-all" sets="1,2,3,4,5,6,7"/>
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

		// add to app blueprint
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

	getGlyphByUnicode(uc) {
		let glyphs = this.font.glyphs,
			keys = Object.keys(glyphs.glyphs),
			unicode = +uc;
		while (keys.length) {
			let glyph = glyphs.get(+keys.shift());
			if (glyph.unicode === unicode) return glyph;
		}
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
