
let Test = {
	init(APP) {
		
		setTimeout(() => APP.content.find(".blank-view .sample:nth(1)").trigger("click"), 100);

		// setTimeout(() => window.find(`.head span[data-view="design"]`).trigger("click"), 100);
		// setTimeout(() => APP.toolbar.els.btnSidebar.trigger("click"), 100);
	}
};
