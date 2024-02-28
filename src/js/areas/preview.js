
// fstudio.preview

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-preview"),
			cvs: window.find("canvas.preview-editor"),
		};
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.preview,
			el;
		// console.log(event);
		switch (event.type) {
			case "window.resize":
				el = Self.els.cvs.parent();
				Self.els.cvs.attr({
					width: el.prop("offsetWidth"),
					height: el.prop("offsetHeight"),
				});
				break;
			case "init-mode":
				break;
		}
	}
}
