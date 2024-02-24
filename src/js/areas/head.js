
// glyphr.head

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.head[data-area="head"]`),
			body: window.find(`.body`),
		};
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.head,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-view":
				el = $(event.target);
				if (el.data("view")) {
					// tab row update
					event.el.find(".active").removeClass("active");
					el.addClass("active");
					// tab body update
					Self.els.body.data({ show: el.data("view") });
				}
				break;
		}
	}
}
