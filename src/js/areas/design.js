
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
			el;
		// console.log(event);
		switch (event.type) {
			case "window.resize":
				el = Self.els.cvs.parent();
				Self.els.cvs.attr({
					width: el.prop("offsetWidth"),
					height: el.prop("offsetHeight"),
				});
				break;
			case "init-mode":
				break;
		}
	}
}
