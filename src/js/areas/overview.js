
// glyphr.overview

{
	init() {
		// fast references
		this.els = {
			body: window.find(".view-overview"),
			left: window.find(".left-side"),
			body: window.find(".area-body"),
		};

		// translate all unicodes in data.xml
		window.bluePrint.selectNodes(`//Unicode/*[not(@value)]`).map(x =>
			x.setAttribute("value", String.fromCharCode(x.getAttribute("id"))));
		// console.log( window.bluePrint.root );

		// render glyph list
		setTimeout(() => this.dispatch({ type: "render-initial-view" }), 10);
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.overview,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "render-initial-view":
				// left side tree
				window.render({
					template: "overview-tree",
					match: `//Data/Overview`,
					target: Self.els.left,
				});
				// auto select first tree item
				Self.els.left.find("ul li:first-child").trigger("click");

				// update glyph count in footer
				value = Self.els.body.find(".glyph").length;
				APP.foot.dispatch({ type: "set-count-value", value });
				break;
			case "select-tree-item":
				el = $(event.target);
				if (el.nodeName() !== "li") return;
				Self.els.left.find(".active").removeClass("active");
				el.addClass("active");

				// glyph list
				window.render({
					template: "glyph-list",
					match: `//Data`,
					target: Self.els.body,
				});
				break;
			case "set-glyph-size":
				Self.els.body.css({ "--gSize": event.value });
				break;
		}
	}
}
