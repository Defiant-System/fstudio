
// fstudio.sidebar

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.sidebar[data-area="sidebar"]`),
			wLayers: window.find(`.layer-rows`),
			preCvs: window.find(`.glyph-preview canvas`),
			content: window.find(`content`),
		};
		// context for preview canvas
		this.els.preCtx = this.els.preCvs[0].getContext("2d");

		// subscript to events
		window.on("glyph-update", this.dispatch);
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.sidebar,
			data,
			path,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "glyph-update":
				// proxy event
				Self.dispatch({ type: "preview-glyph", glyph: event.detail.glyph });
				break;
			// custom events
			case "preview-glyph":
				Self.els.preCvs.attr({ width: 249, height: 140 });
				// preview draw glyph
				path = event.glyph.getPath(89, 114, 140);
				data = { draw: { preview: "#222" } };
				APP.design.draw.path(Self.els.preCtx, path, data);
				break;
			case "render-glyph-layers":
				// split closed paths
				value = event.glyph.path.toSVG().slice(9, -3)
					.split("Z")
					.filter(d => d)
					.map((sP, i) => `<i id="${i+1}" name="Path ${i+1}"><![CDATA[<path d="${sP}Z"/>]]></i>`);

				// render xml to DOM elements
				data = $.xmlFromString(`<data>${value.join("")}</data>`);
				window.render({ template: "glyph-layers-list", target: Self.els.wLayers, data });

				// paint thumbnails
				Self.els.wLayers.find(`canvas`).map(el => {
					let cvs = $(el),
						ctx = el.getContext("2d"),
						svg = cvs.prevAll("svg"),
						shape = svg.find("path")[0],
						bbox = shape.getBBox(),
						// resize path
						size = 19,
						dim = size / Math.max(bbox.width, bbox.height),
						// image to transfer to canvas
						img = new Image;
					
					// resize "path"
					Svg.scale.path(shape, {
							scale: { x: dim, y: dim },
							matrix: Svg.scale.matrix,
							points: shape.pathSegList._list,
							commit: true,
						});

					// move "path"
					bbox = shape.getBBox();
					Svg.translate.path(shape, {
							move: {
								x: -bbox.x + ((size - bbox.width) / 2),
								y: -bbox.y + ((size - bbox.height) / 2),
							},
							matrix: Svg.translate.matrix,
							points: shape.pathSegList._list,
							commit: true,
						});

					// reset canvas
					cvs.attr({ width: size, height: size });
					// wait until image is "transfered"
					img.onload = () => ctx.drawImage(img, 0, 0, size, size);
					img.src = `data:image/svg+xml,${encodeURIComponent(svg[0].xml)}`;
				});
				break;
			case "toggle-sidebar":
				value = Self.els.content.hasClass("show-sidebar");
				Self.els.content.toggleClass("show-sidebar", value);
				return !value;
			case "select-tab":
				el = $(event.target);
				if (el.parent().hasClass("sidebar-head")) {
					// update tab row
					el.parent().find(".active").removeClass("active");
					el.addClass("active");
					// update tab body
					let pEl = event.el.parent();
					pEl.find(".sidebar-body.active").removeClass("active");
					pEl.find(`.sidebar-body`).get(el.index()).addClass("active");
				}
				break;
			case "deselect-layer":
				Self.els.wLayers.find(".selected").removeClass("selected");
				break;
			case "select-layer":
				if (event.id) event.target = Self.els.wLayers.find(`.row[data-id="${event.id}"]`)[0];
				Self.els.wLayers.find(".selected").removeClass("selected");
				el = $(event.target).parents("?.row");
				el.addClass("selected");
				break;
			case "toggle-visibility":
				el = $(event.el).find("i");
				if (el.hasClass("icon-eye-off")) {
					el.removeClass("icon-eye-off icon-eye-on").addClass("icon-eye-on");
					el.parents(".row").removeClass("layer-off");
				} else {
					el.removeClass("icon-eye-off icon-eye-on").addClass("icon-eye-off");
					el.parents(".row").addClass("layer-off");
				}
				Self.dispatch({ type: "select-layer", target: event.target });
				break;
			case "delete-layer":
				break;
			// forward popup events
			case "popup-color-ring":
			case "popup-color-palette-1":
			case "popup-color-palette-2":
			case "popup-color-palette-3":
				APP.popups.dispatch(event);
				break;
		}
	}
}
