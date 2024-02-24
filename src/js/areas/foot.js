
// glyphr.foot

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.foot[data-area="foot"]`),
		};
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.foot,
			el;
		// console.log(event);
		switch (event.type) {
			case "set-count-value":
				Self.els.el.find(".count").html(event.value || 0);
				break;
			case "set-glyph-size":
				// proxy event
				APP.overview.dispatch(event);
				break;
		}
	}
}
