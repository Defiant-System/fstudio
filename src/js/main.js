
@import "./ext/opentypejs_1-3-1.js"
@import "./classes/file.js"
@import "./modules/color.js"
@import "./modules/test.js"

let FontFile;


const fstudio = {
	init() {
		// fast references
		this.content = window.find("content");

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = fstudio,
			name,
			value,
			pEl,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.resize":
				// proxy event
				Self[Self.head.active].dispatch(event);
				break;
			// custom events
			case "load-sample":
				// temp font file
				value = `~/fonts/${event.name}`;
				// fetch file
				window.fetch(value, { responseType: "arrayBuffer" })
					// forward event to app
					.then(file => Self.dispatch({ type: "handle-font-file", file }));
				break;
			case "open-file":
				window.dialog.open({
					otf: file => Self.dispatch({ type: "handle-font-file", file }),
					ttf: file => Self.dispatch({ type: "handle-font-file", file }),
					woff: file => Self.dispatch({ type: "handle-font-file", file }),
				});
				break;
			case "handle-font-file":
				FontFile = new File(event.file);
				// hide blank view
				Self.blankView.dispatch({ type: "hide-blank-view" });
				// init overview view
				Self.overview.dispatch({ type: "render-initial-view" });
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			default:
				if (event.el) {
					pEl = event.el.data("area") ? event.el : event.el.parents("div[data-area]");
					name = pEl.data("area");
					if (pEl.length && Self[name].dispatch) {
						return Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "areas/blank-view.js",
	popups: @import "modules/popups.js",
	toolbar: @import "areas/toolbar.js",
	head: @import "areas/head.js",
	overview: @import "areas/overview.js",
	design: @import "areas/design.js",
	kerning: @import "areas/kerning.js",
	preview: @import "areas/preview.js",
	sidebar: @import "areas/sidebar.js",
	foot: @import "areas/foot.js",
};

window.exports = fstudio;
