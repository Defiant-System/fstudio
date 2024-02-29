
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
			case "select-design-tool":
				APP.design.data.tool = event.arg;
				return true;
			case "toggle-sidebar":
				// proxy event
				return APP.sidebar.dispatch(event);
		}
	}
}
