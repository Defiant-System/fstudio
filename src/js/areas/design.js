
// glyphr.design

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
			content: window.find("content"),
		};
		// get reference to canvas
		this.els.ctx = this.els.cvs[0].getContext("2d");

		// bind event handlers
		this.els.cvs.on("mousedown", this.viewPan);

		// view preferences
		this.data = {
			tool: "pan",
			cvsDim: { width: 0, height: 0 },
			draw: {
				lines: "#cccccc",
				fill: "#11111122",
				stroke: "#66666677",
				strokeWidth: 1.25,
				anchors: true,
				handles: false,
				guides: true,
			},
			fontSize: 350,
			view: {
				dX: 300,
				dY: 380,
				dZ: 1,
			}
		};
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.design,
			Font = FontFile.font,
			width,
			height,
			el;
		// console.log(event);
		switch (event.type) {
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

				// console.log( FontFile );

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
					dX = (Self.data.cvsDim.width - (glyph.advanceWidth * dZ)) >> 1,
					dY = (os2.sTypoAscender - os2.sTypoDescender) * dZ;
				
				Self.data.view = { dX, dY, dZ };
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
			// for sharper lines
			ctx.translate(-.5, -.5);

			if (Data.draw.guides) {
				ctx.fillStyle = Data.draw.lines;
				this.hLine(ctx, "Baseline", Data, 0);
				// this.hLine(ctx, "yMax", Data, Font.tables.head.yMax);
				// this.hLine(ctx, "yMin", Data, Font.tables.head.yMin);
				// this.hLine(ctx, "Ascender", Data, Font.tables.hhea.ascender);
				// this.hLine(ctx, "Descender", Data, Font.tables.hhea.descender);
				this.hLine(ctx, "Ascent", Data, Font.tables.os2.sTypoAscender);
				this.hLine(ctx, "Descent", Data, Font.tables.os2.sTypoDescender);
				
				this.vLine(ctx, "Left side", Data, 0);
				this.vLine(ctx, "Right side", Data, glyph.advanceWidth);
			}

			// draw glyph base
			path = glyph.getPath(Data.view.dX, Data.view.dY, Data.fontSize);
			this.path(ctx, path, Data);

			// draw glyph path anchors + handles
			for (let i=0, il=commands.length; i<il; i += 1) {
				let cmd = commands[i];
				if (cmd.x !== undefined) {
					anchors.push({ x: cmd.x, y: -cmd.y });
				}
				if (cmd.x1 !== undefined) {
					let anchor = anchors[anchors.length-2];
					handles.push({ ox: anchor.x, oy: anchor.y, x: cmd.x1, y: -cmd.y1 });
				}
				if (cmd.x2 !== undefined) {
					let anchor = anchors[anchors.length-1];
					handles.push({ ox: anchor.x, oy: anchor.y, x: cmd.x2, y: -cmd.y2 });
				}
			}

			if (Data.draw.handles) this.handles(ctx, handles, Data.view);
			if (Data.draw.anchors) this.anchors(ctx, anchors, Data.view);
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
		anchors(ctx, l, view) {
			let size = 6,
				hS = size * .5;
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#aaa";
			for (let j=0, jl=l.length; j<jl; j+=1) {
				let rx = Math.round(view.dX + (l[j].x * view.dZ) - hS),
					ry = Math.round(view.dY + (l[j].y * view.dZ) - hS);
				ctx.fillRect(rx, ry, size, size);
				ctx.strokeRect(rx, ry, size, size);
			}
		},
		handles(ctx, l, view) {
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#aaa";

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				ctx.moveTo(view.dX + (l[j].ox * view.dZ), view.dY + (l[j].oy * view.dZ));
				ctx.lineTo(view.dX + (l[j].x * view.dZ), view.dY + (l[j].y * view.dZ));
			}
			ctx.closePath();
			ctx.stroke();

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				let hx = Math.round(view.dX + (l[j].x * view.dZ)),
					hy = Math.round(view.dY + (l[j].y * view.dZ));
				ctx.moveTo(hx, hy);
				ctx.arc(hx, hy, 2.5, 0, Math.PI * 2, false);
			}
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		},
		vLine(ctx, text, Data, x) {
			let xpx = Math.round(Data.view.dX + x * Data.view.dZ),
				h = Data.cvsDim.height;
			ctx.fillText(text, xpx + 3, 12);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(xpx, 0, 1, h);
			ctx.restore();
		},
		hLine(ctx, text, Data, y) {
			let ypx = Math.round(Data.view.dY - y * Data.view.dZ),
				w = Data.cvsDim.width;
			ctx.fillText(text, 2, ypx - 3);
			ctx.save();
			ctx.globalAlpha = .5;
			ctx.fillRect(0, ypx, w, 1);
			ctx.restore();
		}
	},
	viewLasso(event) {

	},
	viewPan(event) {
		let Self = glyphr.design,
			Drag = Self.drag;
		switch(event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

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
