
// fstudio.sidebar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.sidebar[data-area="sidebar"]`),
			content: window.find(`content`),
		};
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.sidebar,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "toggle-sidebar":
				value = Self.els.content.hasClass("show-sidebar");
				Self.els.content.toggleClass("show-sidebar", value);
				return !value;
			case "select-tab":
				el = $(event.target);
				if (el.parent().hasClass("sidebar-head")) {
					// update tab row
					el.parent().find(".active").removeClass("active");
					el.addClass("active");
					// update tab body
					let pEl = event.el.parent();
					pEl.find(".sidebar-body.active").removeClass("active");
					pEl.find(`.sidebar-body`).get(el.index()).addClass("active");
				}
				break;
		}
	}
}
