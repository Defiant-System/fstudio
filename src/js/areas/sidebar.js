
// glyphr.sidebar

{
	init() {
		
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.sidebar,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-tab":
				el = $(event.target);
				if (el.parent().hasClass("sidebar-head")) {
					// update tab row
					el.parent().find(".active").removeClass("active");
					el.addClass("active");
					// update tab body
					let pEl = event.el.parent();
					pEl.find(".active").removeClass("active");
					pEl.find(`.sidebar-body`).get(el.index()).addClass("active");
				}
				break;
		}
	}
}
