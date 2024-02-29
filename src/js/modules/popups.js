
// fstudio.popups

{
	init() {
		// fast references
		this.els = {
			el: window.find(".popups"),
		};
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.popups,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-mode":
				break;
		}
	}
}
