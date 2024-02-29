
let Test = {
	init(APP) {
		
		// setTimeout(() => APP.content.find(".blank-view .sample:nth(1)").trigger("click"), 100);

		// setTimeout(() => window.find(`.head span[data-view="design"]`).trigger("click"), 100);
		// setTimeout(() => APP.toolbar.els.btnSidebar.trigger("click"), 100);
		setTimeout(() => APP.content.find(`.glyph-list .glyph:nth(1)`).trigger("click"), 300);
		setTimeout(() => APP.content.find(`span[data-click="zoom-fit"] i`).trigger("click"), 900);
	}
};
