
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
		this.dispatch({ type: "render-glyph-list" });
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.overview,
			el;
		// console.log(event);
		switch (event.type) {
			case "render-glyph-list":
				window.render({
					template: "glyph-list",
					match: `//Data`,
					target: Self.els.el,
				});
				break;
		}
	}
}
