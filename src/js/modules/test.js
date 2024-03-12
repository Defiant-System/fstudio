
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.content.find(".blank-view .sample:nth(1)").trigger("click"), 100);

		// setTimeout(() => window.find(`.head span[data-view="design"]`).trigger("click"), 100);
		// setTimeout(() => APP.toolbar.els.btnSidebar.trigger("click"), 100);
		setTimeout(() => APP.content.find(`.glyph-list .glyph:nth(1)`).trigger("click"), 600);

		// return;
		// setTimeout(() => APP.content.find(`.ux-layer svg path:nth(2)`).trigger("mousedown").trigger("mouseup"), 700);

		return;
		// setTimeout(() => APP.content.find(`.anchor:nth(10)`).trigger("mousedown").trigger("mouseup"), 600);

		// setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="pan"]`).trigger("click"), 700);
		// return setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="pen"]`).trigger("click"), 700);

		return setTimeout(() => {
			APP.content.find(".zoom-value").html("130%");
			APP.content.find(`span[data-click="zoom-minus"] i`).trigger("click");
		}, 700);



		// setTimeout(() => {
		// 	let Self = APP.design,
		// 		anchors = window.find(".anchor")
		// 						.filter(e => e.getAttribute("data-i") >= 11 && e.getAttribute("data-i") <= 11)
		// 						.map(e => {
		// 							e.classList.add("selected");
		// 							return +e.getAttribute("data-i");
		// 						});
		// 	Self.data.draw.anchor.selected = anchors;
		// 	Self.draw.glyph(Self);
		// }, 500);


		setTimeout(() => {
			let _view = APP.design.els.uxLayer.offset();
			let commands = [
					{ type: "M", x: 166, y: 299 },
					{ type: "L", x: 262, y: 157 },
					{ type: "L", x: 311, y: 351 },
					{ type: "L", x: 260, y: 271 },
					{ type: "Z" },
				];
			APP.design.glyph.add({ commands, _view });
		}, 800);

		// setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="preview"]`).trigger("click"), 700);
		// setTimeout(() => APP.content.find(`.sidebar .color-preset_:nth(1)`).trigger("click"), 700);
	}
};
