
// glyphr.blankView

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.blank-view`),
			content: window.find("content"),
		};

		this.dispatch({ type: "init-blank-view" });
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.blankView,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-blank-view":
				// get settings, if any
				let xList = $.xmlFromString(`<Recents/>`);
				let xSamples = window.bluePrint.selectSingleNode(`//Samples`);

				Self.xRecent = window.settings.getItem("recents") || xList.documentElement;
				// add recent files in to data-section
				xSamples.parentNode.append(Self.xRecent);

				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target: Self.els.el,
				});
				break;
			case "hide-blank-view":
				//  change class name of content element
				Self.els.content.removeClass("show-blank-view");
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-sample":
				let url = `~/fonts/FiraSans-Medium.woff`;
					// parts = url.slice(url.lastIndexOf("/") + 1),
					// [ name, kind ] = parts.split("."),
					// file = new karaqu.File({ name, kind });
				// fetch file
				window.fetch(url, { responseType: "arrayBuffer" })
					// forward event to app
					.then(file => {
						let tmp = OpenType.parse(file.arrayBuffer);
						console.log( tmp );

						Self.dispatch({ type: "hide-blank-view" });
					});
				break;
			case "select-recent-file":
				break;
		}
	}
}
