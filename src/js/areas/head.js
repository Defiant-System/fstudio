
// fstudio.head

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.head[data-area="head"]`),
			content: window.find(`content`),
			main: window.find(`.main`),
		};
		// default active view
		this.active = "overview";
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.head,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-view":
				el = $(event.target);
				if (el.data("view")) {
					// reference t oactive view
					Self.active = el.data("view");
					// tab row update
					Self.els.el.find(".head-reel .active").removeClass("active");
					el.addClass("active");
					// tab body update
					Self.els.main.data({ show: Self.active });

					value = Self.active === "overview";
					Self.els.content.toggleClass("show-sidebar", value);
					// auto resize for canvas
					APP[Self.active].dispatch({ type: "window.resize" });
				}
				break;
		}
	}
}
