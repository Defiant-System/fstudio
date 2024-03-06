
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.content.find(".blank-view .sample:nth(1)").trigger("click"), 100);

		// setTimeout(() => window.find(`.head span[data-view="design"]`).trigger("click"), 100);
		// setTimeout(() => APP.toolbar.els.btnSidebar.trigger("click"), 100);
		setTimeout(() => APP.content.find(`.glyph-list .glyph:nth(1)`).trigger("click"), 500);

		// setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="pen"]`).trigger("click"), 700);

		setTimeout(() => APP.content.find(`.anchor:nth(11)`).trigger("mousedown").trigger("mouseup"), 600);

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


		// { type: "M", x: 171, y: 228 }
		// { type: "C", x: 241, x1: 135, x2: 244, y: 178, y1: 175, y2: 93 }
		// { type: "C", x: 171, x1: 238, x2: 206, y: 228, y1: 263, y2: 279 }
		// { type: "Z" }





		// setTimeout(() => {
		// 	APP.content.find(".zoom-value").html("90%");
		// 	APP.content.find(`span[data-click="zoom-minus"] i`).trigger("click");
		// }, 1100);

		// setTimeout(() => APP.content.find(`.ux-layer svg path`).trigger("mousedown").trigger("mouseup"), 700);

		// setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="preview"]`).trigger("click"), 700);
		// setTimeout(() => APP.content.find(`.sidebar .color-preset_:nth(1)`).trigger("click"), 700);
	}
};
