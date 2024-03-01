
// fstudio.popups

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			root: window.find(".popups"),
			content: window.find("content"),
			colorRing: window.find(".popups .popup-colour-ring .ring-wrapper"),
			palette: window.find(".popups .popup-palette"),
		};

		// bind event handlers
		// this.els.colorRing.on("mousedown", this.doColorRing);
	},
	// handler listens for next click event - to close popup
	closeHandler(event) {
		let Self = fstudio.popups;
		// if click inside popup element
		if ($(event.target).parents(".popups").length) return;
		Self.dispatch({ type: "close-popup" });
		// unbind event handler
		Self.els.doc.unbind("mouseup", Self.closeHandler);
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.popups,
			dim, pos, top, left,
			step,
			data,
			name,
			value,
			str,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-color":
				el = $(event.target);
				value = el.attr("style").match(/#.[\w\d]+/)[0];
				Self.els.palette.find(".palette-wrapper .active").removeClass("active");
				el.addClass("active");

				if (Self.origin) {
					Self.origin.el
						.removeClass("active_")
						.css({ "--preset-color": value });
					// proxy event
					pEl = Self.origin.el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length && APP[name].dispatch) {
						let type = Self.origin.el.data("change"),
							origin = Self.origin;
						APP[name].dispatch({ type, value, origin });
					}
				}
				/* falls through */
			case "close-popup":
				// prepare to close popup
				Self.els.content.removeClass("cover");
				Self.els.root.find("> div.pop")
					.cssSequence("pop-hide", "animationend", el => el.removeClass("pop pop-hide"));

				if (Self.origin) {
					// reset origin el
					Self.origin.el.removeClass("active_");
				}
				Self.origin = null;
				// unbind event handler
				Self.els.doc.unbind("mouseup", Self.closeHandler);
				break;
			case "do-popup-navigation":
				el = $(event.target);
				if (el.hasClass("active")) return;
				// navigation dots UI change
				el.parent().find(".active").removeClass("active");
				el.addClass("active");
				// trigger change in reel
				event.el.parent().data({ step: el.index() + 1 });
				break;
			case "popup-color-palette-1":
			case "popup-color-palette-2":
			case "popup-color-palette-3":
			case "popup-color-ring":
				// prepare to open popup
				pEl = Self.els.palette;
				step = event.type.split("-")[3] || "4";
				pEl.data({ step });
				// correctify navigation
				pEl.find(".grid-nav li.active").removeClass("active");
				pEl.find(`.grid-nav li:nth(${step-1})`).addClass("active");

				dim = pEl[0].getBoundingClientRect();
				pos = Self.getPosition(event.target, Self.els.content[0]);
				top = pos.top + event.target.offsetHeight + 13;
				left = Math.round(pos.left - (dim.width / 2) + (event.target.offsetWidth / 2) - 25);

				// prepare popup contents
				el = $(event.target).addClass("active_");
				value = el.cssProp(el.hasClass("color-preset_") ? "--preset-color" : "--color");
				if (value === "transparent") value = "#ffffffff";
				Self.origin = { el, value };
				let [hue, sat, lgh, alpha] = Color.hexToHsl(value.trim());

				// ring rotation
				pEl.find(".color-ring span").css({ transform: `rotate(${hue}deg)` });
				// box
				let hsv = Color.hexToHsv(value.trim()),
					hex = Color.hslToHex(hue, sat, lgh, alpha),
					w = +Self.els.colorRing.find(".color-box").prop("offsetWidth") - 1,
					l = w * hsv[1],
					t = w * (1-hsv[2]);
				if (hex.slice(0, -2) === "#ffffff") t = l = 0;
				pEl.find(".color-box span").css({ left: l, top: t });
				// alpha
				pEl.find(".color-alpha span").css({ top: `${alpha * 159}px` });
				// root element css variables
				Self.els.colorRing.css({
					"--hue-color": Color.hslToHex(hue, 1, .5),
					"--color": hex,
					"--color-opaque": hex.slice(0, -2),
				});
				// position popup
				pEl.css({ top, left }).addClass("pop");
				Self.els.content.addClass("cover");
				// bind event handler
				Self.els.doc.bind("mouseup", Self.closeHandler);
				break;
		}
	},
	getOffset(el, pEl) {
		let rect1 = el.getBoundingClientRect(),
			rect2 = pEl.getBoundingClientRect(),
			top = Math.floor(rect1.top - rect2.top) + pEl.offsetTop - 2,
			left = Math.floor(rect1.left - rect2.left) + pEl.offsetLeft - 2,
			width = rect1.width + 5,
			height = rect1.height + 5;
		return { top, left, width, height };
	},
	getPosition(el, rEl) {
		let pEl = el,
			pos = { top: 0, left: 0 };
		while (pEl !== rEl) {
			pos.top += (pEl.offsetTop - pEl.parentNode.scrollTop);
			pos.left += (pEl.offsetLeft - pEl.parentNode.scrollLeft);
			pEl = pEl.offsetParent;
		}
		return pos;
	}
}
