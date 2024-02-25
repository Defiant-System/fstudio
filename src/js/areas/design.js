
// glyphr.design

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
		};
		// get reference to canvas
		this.els.ctx = this.els.cvs[0].getContext("2d");
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.design,
			width,
			height,
			el;
		// console.log(event);
		switch (event.type) {
			case "window.resize":
				el = Self.els.cvs.parent();
				width = el.prop("offsetWidth");
				height = el.prop("offsetHeight");
				Self.els.cvs.attr({ width, height });
				break;
			case "init-view":
				// console.log( Font.draw );

				el = Self.els.cvs.parent();
				width = el.prop("offsetWidth");
				height = el.prop("offsetHeight");
				Self.els.cvs.attr({ width, height });

				let fontSize = 300,
					x = 300,
					y = 380;

				// let glyph = Font.glyphs.get(36);
				let glyph = Font.glyphs.get(34);
				console.log( glyph.path );

				Self.els.ctx.translate(.5, .5);

				glyph.draw(Self.els.ctx, x, y, fontSize);
				glyph.drawPoints(Self.els.ctx, x, y, fontSize);
				// glyph.drawMetrics(Self.els.ctx, x, y, fontSize);
				break;
		}
	}
}
