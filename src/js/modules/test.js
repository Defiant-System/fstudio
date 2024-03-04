
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.content.find(".blank-view .sample:nth(1)").trigger("click"), 100);

		// setTimeout(() => window.find(`.head span[data-view="design"]`).trigger("click"), 100);
		// setTimeout(() => APP.toolbar.els.btnSidebar.trigger("click"), 100);
		setTimeout(() => APP.content.find(`.glyph-list .glyph:nth(1)`).trigger("click"), 500);

		setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="pen"]`).trigger("click"), 700);

		// setTimeout(() => {
		// 	APP.content.find(".zoom-value").html("90%");
		// 	APP.content.find(`span[data-click="zoom-minus"] i`).trigger("click");
		// }, 1100);

		// setTimeout(() => APP.content.find(`.ux-layer svg path`).trigger("mousedown").trigger("mouseup"), 700);

		// setTimeout(() => APP.toolbar.els.el.find(`div[data-arg="preview"]`).trigger("click"), 700);
		// setTimeout(() => APP.content.find(`.sidebar .color-preset_:nth(1)`).trigger("click"), 700);
	}
};
