
// glyphr.toolbar

{
	init() {
		
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.toolbar,
			el;
		// console.log(event);
		switch (event.type) {
			case "toggle-sidebar":
				// proxy event
				return APP.sidebar.dispatch(event);
		}
	}
}
