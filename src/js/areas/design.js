
// fstudio.design

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
			uxWrapper: window.find(".ux-wrapper"),
			uxLayer: window.find(".ux-layer"),
			lasso: window.find(".ux-lasso"),
			content: window.find("content"),
		};
		// get reference to canvas
		this.els.ctx = this.els.cvs[0].getContext("2d");

		// bind event handlers
		this.els.el.on("mousedown", this.dispatch);

		// view preferences
		this.data = {
			tool: "move",
			TAU: Math.PI * 2,
			cvsDim: {
				width: 0,
				height: 0,
			},
			draw: {
				lines: "#99999977",
				fill: "#11111122",
				stroke: "#66666677",
				strokeWidth: 1.25,
				guides: {
					stroke: "#66666644",
					on: true,
				},
				anchor: {
					on: false,
					size: 6,
					fill: "#fff",
					stroke: "#aaa",
					selected: [],
				},
				handle: {
					on: false,
					radius: 3,
					fill: "#fff",
					stroke: "#aaa",
				}
			},
			fontSize: 420,
			view: {
				dZ: 1,
				dX: 0,
				dY: 0,
				dW: 0,
				dH: 0,
			}
		};
	},
	dispatch(event) {
		let APP = fstudio,
			Self = APP.design,
			Font = FontFile.font,
			width,
			height,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				el = $(event.target);
				// proxy event depending on active tool
				switch (true) {
					case !!el.data("click"): /* prevent further checks & allow normal flow */ break;
					case el.hasClass("anchor"): return Self.dispatch({ type: "select-anchor", el });
					case el.hasClass("zoom-value"): return Self.viewZoom(event);
					case el.nodeName() === "path": return Self.viewMove(event);
					case el.hasClass("glyph-editor") && Self.data.tool === "move": return Self.viewLasso(event);
					// case (Self.data.tool === "move"): return Self.viewMove(event);
					case (Self.data.tool === "pan"): return Self.viewPan(event);
					case (Self.data.tool === "rotate"): return Self.viewRotate(event);
				}
				break;
			// system events
			case "window.resize":
				el = Self.els.cvs.parent();
				Self.data.cvsDim = {
					width: el.prop("offsetWidth"),
					height: el.prop("offsetHeight"),
				};
				Self.els.cvs.attr(Self.data.cvsDim);
				break;
			case "init-view":
				if (APP.head.active !== "design") APP.head.els.el.find(`span[data-view="design"]`).trigger("click");
				if (!Self.data.cvsDim.width) Self.dispatch({ type: "window.resize" });
				// fetch flyph by unicode
				Self.data.glyph = FontFile.getGlyphByUnicode(event.id);

				// console.log( FontFile.font );

				Self.draw.glyph(Self);
				break;
			// custom events
			case "select-anchor":
				Self.els.uxLayer.find(".selected").removeClass("selected");
				event.el.addClass("selected");

				Self.data.draw.anchor.selected = [+event.el.data("i")];
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "zoom-minus":
			case "zoom-plus":
				console.log(event);
				break;
			case "zoom-fit":
				let glyph = Self.data.glyph,
					os2 = FontFile.font.tables.os2,
					dZ = 1 / glyph.path.unitsPerEm * Self.data.fontSize,
					dW = glyph.advanceWidth * dZ,
					dX = (Self.data.cvsDim.width - dW) >> 1,
					dY = (os2.sTypoAscender - os2.sTypoDescender) * dZ;
				
				Self.data.view = { dZ, dX, dY, dW, dH: dY };
				// update canvas
				Self.draw.glyph(Self);
				break;
		}
	},
	draw: {
		glyph(Self) {
			let Font = FontFile.font,
				Data = Self.data,
				ctx = Self.els.ctx,
				glyph = Data.glyph,
				commands = glyph.path.commands,
				anchors = [],
				handles = [],
				path;
			// set zoom / scale
			Data.view.dZ = 1 / glyph.path.unitsPerEm * Data.fontSize,
			// reset canvas
			Self.els.cvs.attr(Self.data.cvsDim);

			if (Data.draw.guides.on) {
				ctx.fillStyle = Data.draw.guides.stroke;
				// horisontal lines
				this.hLine(ctx, "Baseline", Data, 0);
				this.hLine(ctx, "xheight", Data, Font.tables.os2.sxHeight);
				this.hLine(ctx, "Ascent", Data, Font.tables.os2.sTypoAscender);
				this.hLine(ctx, "Descent", Data, Font.tables.os2.sTypoDescender);
				// vertical lines
				this.vLine(ctx, "Left side", Data, 0);
				this.vLine(ctx, "Right side", Data, glyph.advanceWidth);
			}

			// draw glyph base
			path = glyph.getPath(Data.view.dX-1, Data.view.dY, Data.fontSize);
			this.path(ctx, path, Data);

			// draw glyph path anchors + handles
			for (let i=0, il=commands.length; i<il; i += 1) {
				let cmd = commands[i];
				if (cmd.x !== undefined) {
					anchors.push({ i, x: cmd.x, y: -cmd.y });
				}
				if (cmd.x1 !== undefined) {
					let anchor = anchors[anchors.length - 2];
					handles.push({ i: anchor.i, ox: anchor.x, oy: anchor.y, x: cmd.x1, y: -cmd.y1 });
				}
				if (cmd.x2 !== undefined) {
					let anchor = anchors[anchors.length - 1];
					handles.push({ i: anchor.i, ox: anchor.x, oy: anchor.y, x: cmd.x2, y: -cmd.y2 });
				}
			}

			// for sharper lines
			ctx.translate(-.5, -.5);
			if (Data.draw.handle.on) this.handles(ctx, handles, Data);
			if (Data.draw.anchor.on) this.anchors(ctx, anchors, Data);

			// selected anchor handles
			this.selected(ctx, handles, Data);


			let half = Data.draw.anchor.size * .5,
				baseline = Font.tables.os2.sTypoAscender * Data.view.dZ,
				xheight = baseline - Font.tables.os2.sxHeight * Data.view.dZ,
				style = {
					top: Data.view.dY - baseline,
					left: Math.round(Data.view.dX),
					width: Math.round(Data.view.dW) + 1,
					height: Math.round(Data.view.dH) + 1,
					"--xheight": `${xheight}px`,
					"--baseline": `${baseline}px`,
				},
				str = anchors.map((a, i) => {
					let top = Math.round(style.height - style.top + (a.y * Data.view.dZ) - half),
						left = Math.round((a.x * Data.view.dZ) - half);
					return `<b class="anchor" data-i="${i}" style="top: ${top}px; left: ${left}px;"></b>`;
				});
			if (!Self.els.uxLayer[0].childNodes.length) {
				str.push(`<svg><g>${glyph.path.toSVG()}</g></svg>`);
				Self.els.uxLayer.html(str.join(""));
			}
			if (style.top > 0) {
				let bbox = glyph.path.getBoundingBox(),
					tY = bbox.y2 - bbox.y1 - Data.view.dH + 2,
					transform = `translate(-0.5,${tY}) scale(${Data.view.dZ}, -${Data.view.dZ})`;
				// svg element "scale"
				Self.els.uxLayer.find("svg g").attr({ transform });
				// ux-layer dimensions
				Self.els.uxLayer.css(style);
			}
		},
		path(ctx, path, Data) {
			var cmd, x1, y1, x2, y2;
			ctx.beginPath();
			for (let i=0, il=path.commands.length; i<il; i += 1) {
				cmd = path.commands[i];
				if (cmd.type === "M") {
					ctx.moveTo(cmd.x, cmd.y);
				} else if (cmd.type === "L") {
					ctx.lineTo(cmd.x, cmd.y);
					x1 = x2;
					y1 = y2;
				} else if (cmd.type === "C") {
					ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
					x1 = cmd.x2;
					y1 = cmd.y2;
				} else if (cmd.type === "Q") {
					ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
					x1 = cmd.x1;
					y1 = cmd.y1;
				} else if (cmd.type === "Z") {
					ctx.closePath();
				}
				x2 = cmd.x;
				y2 = cmd.y;
			}
			ctx.save();
			ctx.fillStyle = Data.draw.fill;
			ctx.fill();
			ctx.strokeStyle = Data.draw.stroke;
			ctx.lineWidth = Data.draw.strokeWidth;
			ctx.stroke();
			ctx.restore();
		},
		anchors(ctx, l, Data) {
			let size = Data.draw.anchor.size,
				half = size * .5;
			ctx.fillStyle = Data.draw.anchor.fill;
			ctx.strokeStyle = Data.draw.anchor.stroke;
			for (let j=0, jl=l.length; j<jl; j+=1) {
				let rx = Math.round(Data.view.dX + (l[j].x * Data.view.dZ) - half),
					ry = Math.round(Data.view.dY + (l[j].y * Data.view.dZ) - half);
				ctx.fillRect(rx, ry, size, size);
				ctx.strokeRect(rx, ry, size, size);
			}
		},
		handles(ctx, l, Data) {
			let radius = Data.draw.handle.radius;
			ctx.fillStyle = Data.draw.handle.fill;
			ctx.strokeStyle = Data.draw.handle.stroke;

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				ctx.moveTo(Data.view.dX + (l[j].ox * Data.view.dZ), Data.view.dY + (l[j].oy * Data.view.dZ));
				ctx.lineTo(Data.view.dX + (l[j].x * Data.view.dZ), Data.view.dY + (l[j].y * Data.view.dZ));
			}
			ctx.closePath();
			ctx.stroke();

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				let hx = Math.round(Data.view.dX + (l[j].x * Data.view.dZ)),
					hy = Math.round(Data.view.dY + (l[j].y * Data.view.dZ));
				ctx.moveTo(hx, hy);
				ctx.arc(hx, hy, radius, 0, Data.TAU, false);
			}
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		},
		selected(ctx, l, Data) {
			let radius = Data.draw.handle.radius;
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#888";

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				if (Data.draw.anchor.selected.includes(l[j].i)) {
					ctx.moveTo(Data.view.dX + (l[j].ox * Data.view.dZ), Data.view.dY + (l[j].oy * Data.view.dZ));
					ctx.lineTo(Data.view.dX + (l[j].x * Data.view.dZ), Data.view.dY + (l[j].y * Data.view.dZ));
				}
			}
			ctx.closePath();
			ctx.stroke();

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				if (Data.draw.anchor.selected.includes(l[j].i)) {
					let hx = Math.round(Data.view.dX + (l[j].x * Data.view.dZ)),
						hy = Math.round(Data.view.dY + (l[j].y * Data.view.dZ));
					ctx.moveTo(hx, hy);
					ctx.arc(hx, hy, radius, 0, Data.TAU, false);
				}
			}
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		},
		vLine(ctx, text, Data, x) {
			let xpx = Math.round(Data.view.dX + x * Data.view.dZ),
				h = 35; //Data.cvsDim.height;
			ctx.fillText(text, xpx + 3, 12);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(xpx, 0, 1, h);
			ctx.restore();
		},
		hLine(ctx, text, Data, y) {
			let ypx = Math.round(Data.view.dY - y * Data.view.dZ),
				w = 65; //Data.cvsDim.width;
			ctx.fillText(text, 2, ypx - 3);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(0, ypx, w, 1);
			ctx.restore();
		}
	},
	viewZoom(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let doc = $(document),
					el = $(event.target).addClass("active"),
					knob = el.parent().find(".inline-menubox .pan-knob"),
					limit = {
						min: -50,
						max: 50,
					},
					click = {
						x: event.clientX - +knob.data("value"),
					};
				// drag object
				Self.drag = { el, knob, limit, doc, click };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewZoom);
				break;
			case "mousemove":
				let value = Math.max(Math.min(event.clientX - Drag.click.x, Drag.limit.max), Drag.limit.min),
					perc = ((value + 50) * 2) || 1;
				// update knob
				Drag.knob.data({ value });
				// update zoom value
				Drag.el.html(`${perc}%`);
				break;
			case "mouseup":
				// reset "zoom-value" element
				Drag.el.removeClass("active");
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewZoom);
				break;
		}
	},
	viewRotate(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let el = $(event.target),
					doc = $(document),
					offset = {
						y: Self.data.view.dY,
						x: Self.data.view.dX,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				// drag object
				Self.drag = { el, doc, click, offset };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewRotate);
				break;
			case "mousemove":
				break;
			case "mouseup":
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewRotate);
				break;
		}
	},
	viewMove(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let el = $(event.target),
					doc = $(document),
					offset = {
						y: Self.data.view.dY,
						x: Self.data.view.dX,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				// drag object
				Self.drag = { el, doc, click, offset };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewMove);
				break;
			case "mousemove":
				break;
			case "mouseup":
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewMove);
				break;
		}
	},
	viewLasso(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let doc = $(document),
					el = Self.els.lasso,
					rect = el.parent()[0].getBoundingClientRect(),
					uxTop = +Self.els.uxLayer.prop("offsetTop"),
					uxLeft = +Self.els.uxLayer.prop("offsetLeft"),
					anchors = Self.els.uxLayer.find(".anchor").map(el => {
						return {
							el,
							index: +el.getAttribute("data-i"),
							y: el.offsetTop + uxTop,
							x: el.offsetLeft + uxLeft,
							w: el.offsetWidth,
							h: el.offsetHeight,
						};
					}),
					offset = {
						y: event.clientY - rect.top,
						x: event.clientX - rect.left,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				Self.drag = { el, doc, click, offset, anchors };

				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewLasso);
				break;
			case "mousemove":
				let top = Drag.offset.y,
					left = Drag.offset.x,
					height = event.clientY - Drag.click.y,
					width = event.clientX - Drag.click.x,
					selected = [];
				
				if (height < 0) {
					top += height;
					height = Drag.click.y - event.clientY;
				}
				if (width < 0) {
					left += width;
					width = Drag.click.x - event.clientX;
				}
				Drag.el.css({ top, left, width, height });

				// UI update
				Drag.anchors.map(anchor => {
					let intersect = left <= anchor.x + anchor.w && anchor.x <= left + width && top <= anchor.y + anchor.h && anchor.y <= top + height;
					if (intersect) {
						anchor.el.classList.add("selected");
						selected.push(anchor.index);
					} else {
						anchor.el.classList.remove("selected");
					}
				});
				// update canvas
				Self.data.draw.anchor.selected = selected;
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// reset lasso
				Drag.el.css({ top: -999, left: -999, width: 0, height: 0 });
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewLasso);
				break;
		}
	},
	viewPan(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let el = $(event.target),
					doc = $(document),
					offset = {
						y: Self.data.view.dY,
						x: Self.data.view.dX,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				// drag object
				Self.drag = { el, doc, click, offset };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewPan);
				break;
			case "mousemove":
				let dY = event.clientY - Drag.click.y + Drag.offset.y,
					dX = event.clientX - Drag.click.x + Drag.offset.x;
				Self.data.view.dY = dY;
				Self.data.view.dX = dX;
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewPan);
				break;
		}
	}
}
