
// fstudio.toolbar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.win-toolbar_[data-area="toolbar"]`),
			btnSidebar: window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
		};
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.toolbar,
			el;
		// console.log(event);
		switch (event.type) {
			case "set-design-mode":
			case "select-design-tool":
				return APP.design.dispatch(event);
			case "toggle-sidebar":
				// proxy event
				return APP.sidebar.dispatch(event);
		}
	}
}
