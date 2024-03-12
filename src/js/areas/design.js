
// fstudio.design

{
	init() {
		// fast references
		this.els = {
			_anchors: [],
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
			uxWrapper: window.find(".ux-wrapper"),
			uxLayer: window.find(".ux-layer"),
			hBox: window.find(".handle-box"),
			lasso: window.find(".ux-lasso"),
			content: window.find("content"),
			zoomTools: window.find(".zoom-tools"),
		};
		// get reference to canvas
		this.els.ctx = this.els.cvs[0].getContext("2d");

		// bind event handlers
		this.els.el.on("mousedown", this.dispatch);

		// view preferences
		this.data = {
			tool: "move",
			mode: "outline",
			TAU: Math.PI * 2,
			cvsDim: {
				width: 0,
				height: 0,
			},
			draw: {
				preview: "#000000",
				lines: "#99999977",
				fill: "#11111122",
				stroke: "#66666677",
				strokeWidth: 1.25,
				guides: {
					stroke: "#66666644",
					on: true,
				},
				rotation: {
					color: "#489bf7",
					on: false,
					cY: 0,
					cX: 0,
					radius: 0,
					radians: 0,
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
				},
			},
			fontSize: 430,
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
			top,
			left,
			width,
			height,
			value,
			perc,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				el = $(event.target);
				if (!el.hasClass("handle-box") && !el.hasClass("hb-handle") && !el.hasClass("rotator")) {
					Self.dispatch({ type: "hide-handle-box" });
				}
				// proxy event depending on active tool
				switch (true) {
					case (Self.data.tool === "pen"): return Self.viewPath(event);
					case !!Self.drag?.path: /* prevent further checks; creatin new path */ break;
					case !!el.data("click"): /* prevent further checks & allow normal flow */ break;
					case el.hasClass("anchor"): return Self.viewAnchor(event);
					case el.hasClass("handle"): return Self.viewHandle(event);
					case el.hasClass("zoom-value"): return Self.viewZoom(event);
					case el.hasClass("glyph-editor") && Self.data.tool === "move": return Self.viewLasso(event);
					case el.hasClass("rotator"): return Self.viewRotate(event);
					case el.hasClass("hb-handle"): return Self.viewResize(event);
					case el.hasClass("handle-box"): return Self.viewMove(event);
					case el.nodeName() === "path":
						Self.dispatch({ type: "show-handle-box", target: event.target });
						return Self.viewMove({
							type: "mousedown",
							target: Self.els.hBox[0],
							clientX: event.clientX,
							clientY: event.clientY,
						});
					case (Self.data.tool === "pan"): return Self.viewPan(event);
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

				// reset ux-wrapper
				Self.els.uxLayer.html("");

				// console.log( FontFile.font );
				// console.log( Self.data.glyph.path.commands[1] );

				// auto fit glyph in work area
				Self.dispatch({ type: "zoom-fit" });
				// render sidebar glyph layers
				APP.sidebar.dispatch({ type: "render-glyph-layers", glyph: Self.data.glyph });
				break;
			// custom events
			case "clear-selected-anchors":
				// auto-clear selected anchors (temp)
				Self.els.uxLayer.find(".selected").removeClass("selected");
				// update canvas
				Self.data.draw.anchor.selected = [];
				Self.draw.glyph(Self);
				break;
			case "anchors-selected":
				if (event.anchors.length === 1) {
					let type = event.anchors[0].anchor.type,
						opt = Self.els.content.find(`.design-sidebar .anchor-type .option-buttons_ span[data-name="${type}"]`);
					opt.parent().find(".active_").removeClass("active_");
					opt.addClass("active_");
				}
				break;
			case "zoom-minus":
			case "zoom-plus":
				el = Self.els.zoomTools.find(".zoom-value");
				value = parseInt(el.text(), 10);
				value -= value % 10;
				value += event.type === "zoom-plus" ? 10 : -10;
				value = Math.min(200, value);
				// update integers
				el.html(`${value}%`);
				// update canvas
				perc = value / 200;
				Self.data.fontSize = Math.lerp(30, 830, perc);
				Self.draw.glyph(Self);
				// update zoom knob
				value = (perc * 100) - 50 | 0;
				Self.els.zoomTools.find(`.inline-menubox .pan-knob`).data({ value });
				break;
			case "zoom-fit":
				let glyph = Self.data.glyph,
					os2 = FontFile.font.tables.os2,
					fontSize = 430,
					dZ = 1 / glyph.path.unitsPerEm * fontSize,
					dW = glyph.advanceWidth * dZ,
					dX = (Self.data.cvsDim.width - dW) >> 1,
					dY = (os2.sTypoAscender - os2.sTypoDescender) * dZ;
				// temp
				// dX += 150;

				Self.data.view = { dZ, dX, dY, dW, dH: dY };
				Self.data.fontSize = fontSize;
				// reset zoom tools
				Self.els.zoomTools.find(".zoom-value").html("100%");
				Self.els.zoomTools.find(".inline-menubox .pan-knob").data({ value: 0 });
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "set-design-mode":
				Self.data.mode = event.arg;
				Self.els.uxLayer.data({ mode: event.arg });
				// update canvas
				Self.draw.glyph(Self);
				return true;
			case "select-design-tool":
				Self.data.tool = event.arg;
				Self.els.el.data({ cursor: `tool-${event.arg}` });
				return true;
			case "hide-handle-box":
				// auto-hide handle box
				Self.els.hBox.removeClass("show");
				// deselect sidebar layer
				APP.sidebar.dispatch({ type: "deselect-layer" });
				break;
			case "show-handle-box":
				// clear selected anchors
				Self.dispatch({ type: "clear-selected-anchors" });
				Self.shape = event.target;

				let bbox = Self.shape.getBBox(),
					offset = Self.els.uxLayer.offset(),
					baseline = FontFile.font.tables.os2.sTypoAscender * Self.data.view.dZ,
					pY = +Self.shape.parentNode.getAttribute("tY");

				width = Math.round(bbox.width * Self.data.view.dZ);
				height = Math.round(bbox.height * Self.data.view.dZ);
				top = Math.round(offset.top + (bbox.y * Self.data.view.dZ) + pY);
				left = Math.round(offset.left + (bbox.x * Self.data.view.dZ)) - 1;
				
				// show handle box
				Self.els.hBox.addClass("show").css({ top, left, width, height });
				// select sidebar layer
				APP.sidebar.dispatch({ type: "select-layer", id: Self.shape.getAttribute("data-id") });
				break;
		}
	},
	glyph: {
		add(path) {
			let Self = fstudio.design,
				Data = Self.data,
				glyph = Data.glyph.path,
				scale = Data.view.dZ,
				dX = -path._view.left,
				dY = path._view.height;
			// console.log( path );
			path.commands.map(cmd => {
				let x = (dX + (cmd.x || 0)) / scale,
					y = (dY - (cmd.y || 0)) / scale,
					x1 = (dX + (cmd.x1 || 0)) / scale,
					y1 = (dY - (cmd.y1 || 0)) / scale,
					x2 = (dX + (cmd.x2 || 0)) / scale,
					y2 = (dY - (cmd.y2 || 0)) / scale;
				switch (cmd.type) {
					case "M": glyph.moveTo(x, y); break;
					case "L": glyph.lineTo(x, y); break;
					case "C": glyph.bezierCurveTo(x1, y1, x2, y2, x, y); break;
					case "Q": glyph.quadraticCurveTo(x1, y1, x, y); break;
					case "Z": glyph.close(); break;
				}
			});
			Self.draw.glyph(Self);
		},
		getPoints() {
			let Self = fstudio.design,
				shapeName = Self.shape.nodeName,
				points = Self.shape.getAttribute("points");
			// special cases
			switch (shapeName) {
				case "line":
					points = [
						{ x: +Self.shape.getAttribute("x1"), y: +Self.shape.getAttribute("y1") },
						{ x: +Self.shape.getAttribute("x2"), y: +Self.shape.getAttribute("y2") }
					];
					break;
				case "path":
					points = Self.shape.pathSegList._list;
					break;
			}
			// return points
			return points;
		}
	},
	draw: {
		glyph(Self, opt={}) {
			let Font = FontFile.font,
				Data = Self.data,
				os2 = Font.tables.os2,
				ctx = Self.els.ctx,
				glyph = Data.glyph,
				commands = glyph.path.commands,
				anchors = [],
				handles = [],
				path;
			// set zoom / scale
			Data.view.dZ = 1 / glyph.path.unitsPerEm * Data.fontSize;
			Data.view.dW = glyph.advanceWidth * Data.view.dZ;
			Data.view.dH = (os2.sTypoAscender - os2.sTypoDescender) * Data.view.dZ;
			
			// reset canvas
			Self.els.cvs.attr(Self.data.cvsDim);

			if (Data.draw.guides.on) {
				ctx.fillStyle = Data.draw.guides.stroke;
				// horisontal lines
				this.hLine(ctx, "Baseline", Data, 0);
				this.hLine(ctx, "xheight", Data, os2.sxHeight);
				this.hLine(ctx, "Ascent", Data, os2.sTypoAscender);
				this.hLine(ctx, "Descent", Data, os2.sTypoDescender);
				// vertical lines
				this.vLine(ctx, "Left side", Data, 0);
				this.vLine(ctx, "Right side", Data, glyph.advanceWidth);
			}

			// draw glyph base
			path = glyph.getPath(Data.view.dX-1, Data.view.dY, Data.fontSize);
			this.path(ctx, path, Data);

			// glyph path info; anchors + handles
			for (let i=0, il=commands.length-1; i<il; i += 1) {
				let cmd = commands[i];
				if (cmd.x !== undefined) {
					anchors.push({ i: anchors.length, type: cmd.type, x: cmd.x, y: -cmd.y });
				}
				if (cmd.x1 !== undefined) {
					let anchor = anchors[anchors.length - 2];
					if (anchor) handles.push({ i: anchor.i, hI: handles.length, h: 1, ox: anchor.x, oy: anchor.y, x: cmd.x1, y: -cmd.y1 });
				}
				if (cmd.x2 !== undefined) {
					let anchor = anchors[anchors.length - 1];
					if (anchor) handles.push({ i: anchor.i, hI: handles.length, h: 2, ox: anchor.x, oy: anchor.y, x: cmd.x2, y: -cmd.y2 });
				}
			}

			// for sharper lines
			ctx.translate(-.5, -.5);
			if (Data.draw.handle.on) this.handles(ctx, handles, Data);
			if (Data.draw.anchor.on) this.anchors(ctx, anchors, Data);
			if (Data.draw.rotation.on) this.rotation(ctx, Data);
			// selected anchor handles
			if (Data.draw.anchor.selected.length) this.selected(ctx, handles, Data);

			// prepare UI / style update
			let half = Data.draw.anchor.size * .5,
				baseline = os2.sTypoAscender * Data.view.dZ,
				xheight = baseline - os2.sxHeight * Data.view.dZ,
				style = {
					top: Data.view.dY - baseline,
					left: Math.round(Data.view.dX),
					width: Math.round(Data.view.dW) + 1,
					height: Math.round(Data.view.dH) + 1,
					"--xheight": `${xheight}px`,
					"--baseline": `${baseline}px`,
				};

			if (opt.newPath) {
				// draw svg path as it is
				this.path(ctx, opt.newPath._path, Data);
				// draw new path with anchors & handles
				opt.newPath.draw(ctx, Data, Self);
			} else {
				// puts SVG "ghost" & HTML anchors
				if (!Self.els.uxLayer[0].childNodes.length) {
					let str = anchors.filter(a => a.type !== "M").map(a => {
							let top = Math.round(style.height - style.top + (a.y * Data.view.dZ) - half),
								left = Math.round((a.x * Data.view.dZ) - half),
								aHandles = [];
							for (let i=0, il=handles.length; i<il; i++) {
								if (handles[i].i === a.i) {
									let hy = ((handles[i].y - a.y) * Data.view.dZ) + 9,  // TODO: fix this
										hx = ((handles[i].x - a.x) * Data.view.dZ) + 10; // TODO: fix this
									aHandles.push(`<u class="handle" data-i="${handles[i].i}" data-hI="${handles[i].hI}" data-h="${handles[i].h}" style="top: ${hy}px; left: ${hx}px;"></u>`);
								}
							}
							return `<b class="anchor" data-i="${a.i}" style="top: ${top}px; left: ${left}px;">${aHandles.join("")}</b>`;
						});
					str.push(`<svg><g></g></svg>`);
					Self.els.uxLayer.html(str.join(""));

				} else if (!Self.els._anchors.length) {
					Self.els._anchors = Self.els.uxLayer.find(".anchor").map(elem => {
						let el = $(elem),
							handles = el.find(".handle"),
							i = +elem.getAttribute("data-i");
						return { i, el, handles };
					});
				}

				if (!opt.skipGhostTransform) {
					let bbox = glyph.path.getBoundingBox(),
						// tY = baseline - (bbox.y1 * Data.view.dZ),
						tY = baseline - ((bbox.y2 + bbox.y1) * Data.view.dZ),
						tX = -1,
						// svg element "scale"
						transform = `translate(${tX},${tY}) scale(${Data.view.dZ}, ${Data.view.dZ})`;
					Self.els.uxLayer.find("svg g").attr({ tX, tY, transform });
				}

				// ghost SVG
				if (!Self.els.uxLayer.find("svg g path").length) {
					// split closed paths
					let p = glyph.path.toSVG().slice(9, -3).split("Z").filter(d => d)
								.map((sP, i) => `<path data-id="${i+1}" d="${sP}Z"/>`);
					Self.els.uxLayer.find("svg g").html(p.join(""));
				}
				// ux-layer dimensions
				Self.els.uxLayer.css(style);

				// update anchor / handles positions
				Self.els._anchors.map(item => {
					let a = anchors[item.i];
					if (!a) return;
					let top = Math.round(baseline + (a.y * Data.view.dZ) - half),
						left = Math.round((a.x * Data.view.dZ) - half);
					item.el.css({ top, left });

					if (item.el.hasClass("selected")) {
						// update handles
						item.handles.map((h, j) => {
							let hEl = item.handles.get(j),
								hI = +hEl.data("hI"),
								hy = ((handles[hI].y - a.y) * Data.view.dZ) + 9,
								hx = ((handles[hI].x - a.x) * Data.view.dZ) + 10;
							hEl.css({ top: hy, left: hx });
						});
					}
				});
			}
		},
		path(ctx, path, Data) {
			let isOutline = Data.mode === "outline",
				cmd, x1, y1, x2, y2;
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
			ctx.fillStyle = isOutline ? Data.draw.fill : Data.draw.preview;
			ctx.strokeStyle = isOutline ? Data.draw.stroke : "";
			ctx.lineWidth = isOutline ? Data.draw.strokeWidth : 0;
			ctx.fill();
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
			let selected = Data.draw.anchor.selected;
			ctx.strokeStyle = "#5aa";
			ctx.lineWidth = .75;
			
			// handle arms
			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				if (selected.includes(l[j].i)) {
					ctx.moveTo(Data.view.dX + (l[j].ox * Data.view.dZ), Data.view.dY + (l[j].oy * Data.view.dZ));
					ctx.lineTo(Data.view.dX + (l[j].x * Data.view.dZ), Data.view.dY + (l[j].y * Data.view.dZ));
				}
			}
			ctx.closePath();
			ctx.stroke();
		},
		rotation(ctx, Data) {
			let color = Data.draw.rotation.color,
				cY = Data.draw.rotation.cY,
				cX = Data.draw.rotation.cX,
				radius = Data.draw.rotation.radius,
				rStart = -Math.PI * .5,
				radians = Data.draw.rotation.radians - rStart,
				rEnd = rStart + radians,
				nY = cY + radius * Math.cos(Math.PI - radians),
				nX = cX + radius * Math.sin(Math.PI - radians),
				angle = radians * (180 / Math.PI);

			angle = (angle + 360) % 360;
			if (angle > 180) angle -= 360;

			ctx.fillStyle = `${color}44`;
			ctx.strokeStyle = `${color}aa`;

			ctx.beginPath();
			ctx.moveTo(cX, cY);
			ctx.arc(cX, cY, radius, rStart, rEnd, angle < 0);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(cX, cY);
			ctx.lineTo(nX, nY);
			ctx.closePath();
			ctx.stroke();

			ctx.font = "16px Roboto";
			ctx.textAlign = "center";
			ctx.fillStyle = color;
			ctx.fillText(`${angle | 0}°`, cX, cY - radius - 11);
		},
		vLine(ctx, text, Data, x) {
			let xpx = Math.round(Data.view.dX + x * Data.view.dZ),
				h = 25; //Data.cvsDim.height;
			ctx.fillText(text, xpx + 3, 12);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(xpx, 0, 1, h);
			ctx.restore();
		},
		hLine(ctx, text, Data, y) {
			let ypx = Math.round(Data.view.dY - y * Data.view.dZ),
				w = 50; //Data.cvsDim.width;
			ctx.fillText(text, 2, ypx - 3);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(0, ypx, w, 1);
			ctx.restore();
		}
	},
	viewAnchor(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let sel = Self.els.uxLayer.find(".selected"),
					tgt = $(event.target);
				if (tgt.hasClass("anchor") && !tgt.hasClass("selected")) {
					sel.removeClass("selected");
					sel = Self.els.uxLayer.find(".selected");
				}
				if (!sel.length) sel = tgt.addClass("selected");

				let doc = $(document),
					path = Self.data.glyph.path,
					// include all selected anchors for movement
					el = sel.map(elem => {
						let el = $(elem),
							oY = elem.offsetTop + parseInt(el.css("margin-top"), 10),
							oX = elem.offsetLeft + parseInt(el.css("margin-left"), 10),
							anchor = new Anchor(path, +elem.getAttribute("data-i"));
						return { el, oY, oX, anchor };
					}),
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				// drag object
				Self.drag = { el, doc, click };
				// console.log( path );

				// update selected anchor list + update canvas
				Self.data.draw.anchor.selected = sel.map(elem => +elem.getAttribute("data-i"));
				Self.draw.glyph(Self);
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewAnchor);
				break;
			case "mousemove":
				let dY = event.clientY - Drag.click.y,
					dX = event.clientX - Drag.click.x;
				// move anchors (HTML elements)
				Drag.el.map(item => {
					item.el.css({ top: dY + item.oY, left: dX + item.oX });
					// update anchor + handles
					item.anchor.move({ y: -dY / Self.data.view.dZ, x: dX / Self.data.view.dZ });
				});
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// do appropriate stuff when anchor(s) are selected
				Self.dispatch({ type: "anchors-selected", anchors: Drag.el });
				// cover app body
				Self.els.content.removeClass("cover hide-cursor");
				// bind events
				Drag.doc.off("mousemove mouseup", Self.viewAnchor);
				break;
		}
	},
	viewHandle(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let doc = $(document),
					el = $(event.target),
					pO = el.offset(".ux-layer"),
					dZ = Self.data.view.dZ,
					baseline = FontFile.font.tables.os2.sTypoAscender * dZ,
					index = +el.data("i") + (el.data("h") === "1" ? 1 : 0),
					command = Self.data.glyph.path.commands[index],
					key = {
						nY: `y${el.data("h")}`,
						nX: `x${el.data("h")}`,
					},
					offset = {
						y: +el.prop("offsetTop") - parseInt(el.css("margin-top"), 10),
						x: +el.prop("offsetLeft") - parseInt(el.css("margin-left"), 10),
						pY: baseline - +el.parent().prop("offsetTop"),
						pX: +el.parent().prop("offsetLeft"),
					},
					click = {
						y: event.clientY - offset.y,
						x: event.clientX - offset.x,
					};
					
				// drag object
				Self.drag = { el, doc, click, offset, command, key, dZ };

				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewHandle);
				break;
			case "mousemove":
				let top = event.clientY - Drag.click.y,
					left = event.clientX - Drag.click.x;
				Drag.el.css({ top, left });

				// TODO
				Drag.command[Drag.key.nY] = (Drag.offset.pY - top) / Drag.dZ;
				Drag.command[Drag.key.nX] = (Drag.offset.pX + left) / Drag.dZ;
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// uncover app body
				Self.els.content.removeClass("cover hide-cursor");
				// unbind events
				Drag.doc.off("mousemove mouseup", Self.viewHandle);
				break;
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
					size = {
						value: Self.data.fontSize,
					},
					limit = {
						min: -50,
						max: 50,
					},
					click = {
						x: event.clientX - +knob.data("value"),
					};
				// drag object
				Self.drag = { el, knob, limit, size, doc, click };
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
				// update canvas
				Self.data.fontSize = Math.lerp(30, 830, perc / 200);
				Self.draw.glyph(Self);
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
				let doc = $(document),
					el = $(event.target),
					bY = +el.parent().prop("offsetTop"),
					bX = +el.parent().prop("offsetLeft"),
					bW = +el.parent().prop("offsetWidth"),
					bH = +el.parent().prop("offsetHeight"),
					rotation = Self.data.draw.rotation,
					click = {
						y: event.clientY + (bH >> 1) + 29,
						x: event.clientX - event.offsetX,
					},
					TAU = Math.PI / 180,
					points = Self.glyph.getPoints(),
					matrix = Svg.rotate.matrix,
					rotateFn = Svg.rotate[Self.shape.nodeName],
					matrixDot = Svg.matrixDot;
				// drag object
				Self.drag = { el, doc, click, rotation, TAU, points, matrix, rotateFn, matrixDot };

				// start drawing rotation
				Self.drag.rotation.on = true;
				Self.drag.rotation.cY = bY + (bH >> 1);
				Self.drag.rotation.cX = bX + (bW >> 1);
				Self.drag.rotation.radius = (Math.max(bW, bH) + 7) >> 1;
				// trigger mousemove event to "draw"
				Self.viewRotate({ type: "mousemove", clientY: event.clientY, clientX: event.clientX });
				// hide handle box
				Self.els.hBox.removeClass("show");
				// cover app body
				Self.els.content.addClass("cover");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewRotate);
				break;
			case "mousemove":
				let dY = event.clientY - Drag.click.y,
					dX = event.clientX - Drag.click.x;
				Drag.rotation.radians = Math.atan2(dY, dX);
				// rotate selected "path"
				let rot = {
						cY: Drag.rotation.cY,
						cX: Drag.rotation.cX,
						radians: -Drag.rotation.radians - (Math.PI * .5),
					};
				Drag.rotateFn(Self.shape, { ...rot, matrix: Drag.matrix, points: Drag.points });
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// stop drawing rotation
				Drag.rotation.on = false;
				Self.draw.glyph(Self);
				// show handle box
				Self.els.hBox.addClass("show");
				// uncover app body
				Self.els.content.removeClass("cover");
				// unbind events
				Drag.doc.off("mousemove mouseup", Self.viewRotate);
				break;
		}
	},
	viewResize(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let doc = $(document),
					hBox = Self.els.hBox,
					el = $(event.target),
					type = el.prop("className").split(" ")[1],
					offset = {
						y: +hBox.prop("offsetTop"),
						x: +hBox.prop("offsetLeft"),
						w: +hBox.prop("offsetWidth"),
						h: +hBox.prop("offsetHeight"),
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					points = Self.glyph.getPoints(),
					matrix = Svg.scale.matrix,
					scaleFn = Svg.scale[Self.shape.nodeName],
					matrixDot = Svg.matrixDot;

				// drag object
				Self.drag = { el, type, hBox, doc, offset, click, points, matrix, scaleFn, matrixDot };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewResize);
				break;
			case "mousemove":
				let dim = {
						top: Drag.offset.y,
						left: Drag.offset.x,
						width: Drag.offset.w,
						height: Drag.offset.h,
					};
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
				}
				Drag.hBox.css(dim);

				// calculate scale
				let scale = {
						x: dim.width / Drag.offset.w,
						y: dim.height / Drag.offset.h,
					};
				// move selected "path"
				Drag.scaleFn(Self.shape, { ...dim, scale, matrix: Drag.matrix, points: Drag.points });
				// update canvas
				Self.draw.glyph(Self);
				break;
			case "mouseup":
				// uncover app body
				Self.els.content.removeClass("cover hide-cursor");
				// unbind events
				Drag.doc.off("mousemove mouseup", Self.viewResize);
				break;
		}
	},
	viewMove(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				let doc = $(document),
					el = $(event.target),
					offset = {
						y: +el.prop("offsetTop"),
						x: +el.prop("offsetLeft"),
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					dZ = Self.data.view.dZ,
					target = Self.data.glyph.path,
					bbox = target.getBoundingBox(),
					yBase = bbox.y2 + bbox.y1,
					pathEl = $(Self.shape),
					pathIndex = pathEl.index(),
					paths = pathEl.parent().find("path").map(s => s.getAttribute("d")),
					points = Self.glyph.getPoints(),
					matrix = Svg.translate.matrix,
					translateFn = Svg.translate[Self.shape.nodeName],
					matrixDot = Svg.matrixDot;

				// drag object
				Self.drag = { el, doc, click, offset, dZ, target, yBase, paths, pathIndex, points, matrix, translateFn, matrixDot };
				// cover app body
				Self.els.content.addClass("cover hide-cursor");
				// bind events
				Self.drag.doc.on("mousemove mouseup", Self.viewMove);
				break;
			case "mousemove":
				let y = event.clientY - Drag.click.y,
					x = event.clientX - Drag.click.x,
					move = {
						top: y + Drag.offset.y,
						left: x + Drag.offset.x,
					};
				Drag.el.css(move);

				// move selected "path"
				move.y = y / Drag.dZ,
				move.x = x / Drag.dZ;
				Drag.translateFn(Self.shape, { move, matrix: Drag.matrix, points: Drag.points });

				// move selected path points with matrix
				Drag.paths[Drag.pathIndex] = Self.shape.getAttribute("d");
				Drag.target.fromSVG(Drag.paths.join(" "), { flipYBase: Drag.yBase });

				// update canvas
				Self.draw.glyph(Self, { skipGhostTransform: true });
				break;
			case "mouseup":
				// uncover app body
				Self.els.content.removeClass("cover hide-cursor");
				// unbind events
				Drag.doc.off("mousemove mouseup", Self.viewMove);
				break;
		}
	},
	viewLasso(event) {
		let Self = fstudio.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				// clear selected anchors
				Self.dispatch({ type: "clear-selected-anchors" });

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
				// uncover app body
				Self.els.content.removeClass("cover hide-cursor");
				// unbind events
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
				// uncover app body
				Self.els.content.removeClass("cover hide-cursor");
				// unbind events
				Drag.doc.off("mousemove mouseup", Self.viewPan);
				break;
		}
	},
	viewPath(event) {
		let Self = fstudio.design,
			Drag = Self.drag || {},
			x, y, dx, dy,
			cursor;
		switch(event.type) {
			case "mousedown":
				if (!Drag.path) {
					let doc = $(document),
						el = $(event.target),
						ux = Self.els.uxLayer.offset(),
						start = {
							y: event.offsetY,
							x: event.offsetX,
						},
						click = {
							y: event.clientY - start.y,
							x: event.clientX - start.x,
						},
						path = new Path(start, ux),
						cursor = "tool-pen";

					// drag object
					Self.drag = { el, doc, path, click, start, cursor, downState: true };
					// empty UX layer
					Self.els.uxLayer.html("");
					Self.data.draw.anchor.selected = [];
					// bind events
					Self.drag.doc.on("mousemove mouseup", Self.viewPath);
				} else {
					x = event.offsetX;
					y = event.offsetY;
					// path actions
					if (Drag.path._loop) Drag.path.closeLoop(x, y);
					else Drag.path.addAnchor(x, y);
					// down state
					Drag.downState = true;
				}
				break;
			case "mousemove":
				y = event.clientY - Drag.click.y;
				x = event.clientX - Drag.click.x;
				if (Drag.downState) Drag.path.moveHandle(x, y);
				else Drag.path.moveAnchor(x, y);

				// changes cursor
				cursor = Drag.path._loop ? "tool-pen-loop" : "tool-pen";
				if (cursor !== Drag.cursor) {
					// make sure DOM is not "bothered" if not needed
					Self.els.el.data({ cursor });
					Drag.cursor = cursor;
				}
				// update canvas with new path
				Self.draw.glyph(Self, { newPath: Drag.path });
				break;
			case "mouseup":
				if (!Drag.path.closed) {
					y = event.clientY - Drag.click.y;
					x = event.clientX - Drag.click.x;
					Drag.path.releaseHandle(x, y);
				} else {
					// clear new handles / anchors
					Self.els.uxLayer.find(".anchor.new, .handle.new").remove();
					// add new path to glyph
					Self.glyph.add(Drag.path);
				}
				// down state
				Self.drag.downState = false;

				if (Drag.path.closed) {
					// reset cursor
					Self.els.el.data({ cursor: "tool-pen" });
					// reset path
					delete Drag.path;
					// unbind events
					Drag.doc.off("mousemove mouseup", Self.viewPath);
				}
				break;
		}
	}
}
