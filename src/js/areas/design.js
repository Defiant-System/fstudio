
// glyphr.design

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
		};
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

				let ctx = Self.els.cvs[0].getContext("2d"),
					options = {
						kerning: true,
						hinting: true,
						features: {
							liga: true,
							rlig: true
						}
					},
					fontSize = 224;
				
				Font.draw(ctx, "A", 0, 200, fontSize, options);

				break;
		}
	}
}
