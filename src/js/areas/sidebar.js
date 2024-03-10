
// fstudio.sidebar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.sidebar[data-area="sidebar"]`),
			wLayers: window.find(`.layer-rows`),
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
			case "select-layer":
				Self.els.wLayers.find(".selected").removeClass("selected");
				el = $(event.target).parents("?.row");
				el.addClass("selected");
				break;
			case "toggle-visibility":
				el = $(event.el).find("i");
				if (el.hasClass("icon-eye-off")) {
					el.removeClass("icon-eye-off icon-eye-on").addClass("icon-eye-on");
					el.parents(".row").removeClass("layer-off");
				} else {
					el.removeClass("icon-eye-off icon-eye-on").addClass("icon-eye-off");
					el.parents(".row").addClass("layer-off");
				}
				Self.dispatch({ type: "select-layer", target: event.target });
				break;
			case "delete-layer":
				break;
			// forward popup events
			case "popup-color-ring":
			case "popup-color-palette-1":
			case "popup-color-palette-2":
			case "popup-color-palette-3":
				APP.popups.dispatch(event);
				break;
		}
	}
}
