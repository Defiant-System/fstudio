
// glyphr.head

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.head[data-area="head"]`),
			content: window.find(`content`),
			main: window.find(`.main`),
		};
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.head,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-view":
				el = $(event.target);
				if (el.data("view")) {
					// tab row update
					Self.els.el.find(".head-reel .active").removeClass("active");
					el.addClass("active");
					// tab body update
					Self.els.main.data({ show: el.data("view") });

					value = el.data("view") === "overview";
					Self.els.content.toggleClass("show-sidebar", value);
				}
				break;
		}
	}
}
