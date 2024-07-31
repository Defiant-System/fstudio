
// fstudio.toolbar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.win-toolbar_[data-area="toolbar"]`),
			btnSidebar: window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
		};
		// primary tools
		this.editTools = ["move", "pan", "pen", "anchor-add", "path-rectangle", "path-oval", "path-add", "preview", "outline"];
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.toolbar,
			el;
		// console.log(event);
		switch (event.type) {
			case "enable-tools":
				Self.editTools.map(arg => {
					Self.els.el.find(`.toolbar-tool_[data-arg="${arg}"]`).removeClass("tool-disabled_");
				});
				// make tools active
				["move", "outline"].map(arg => {
					Self.els.el.find(`.toolbar-tool_[data-arg="${arg}"]`).addClass("tool-active_");
				});
				break;
			case "disable-tools":
				break;
			case "set-design-mode":
			case "select-design-tool":
				return APP.design.dispatch(event);
			case "toggle-sidebar":
				// proxy event
				return APP.sidebar.dispatch(event);
		}
	}
}
