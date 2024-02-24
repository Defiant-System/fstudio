
// glyphr.overview

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.area-body[data-area="overview"]`),
		};

		// translate all unicodes in data.xml
		window.bluePrint.selectNodes(`//Unicode/*[not(@value)]`).map(x =>
			x.setAttribute("value", String.fromCharCode(x.getAttribute("id"))));
		// console.log( window.bluePrint.root );

		// render glyph list
		setTimeout(() => this.dispatch({ type: "render-glyph-list" }), 10);
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.overview,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "render-glyph-list":
				window.render({
					template: "glyph-list",
					match: `//Data`,
					target: Self.els.el,
				});
				// update glyph count in footer
				value = Self.els.el.find(".glyph").length;
				APP.foot.dispatch({ type: "set-count-value", value });
				break;
			case "set-glyph-size":
				Self.els.el.css({ "--gSize": event.value });
				break;
		}
	}
}
