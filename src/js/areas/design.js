
// glyphr.design

{
	init() {
		// fast references
		this.els = {
			el: window.find(".view-design"),
			cvs: window.find("canvas.glyph-editor"),
		};
		// get reference to canvas
		this.els.ctx = this.els.cvs[0].getContext("2d");

		this.data = {
			draw: {
				fill: "#11111122",
				stroke: "#66666677",
				strokeWidth: 1,
				anchors: true,
				handles: true,
			},
			fontSize: 350,
			view: {
				dx: 300,
				dy: 380,
				dz: 1,
			}
		};
	},
	dispatch(event) {
		let APP = glyphr,
			Self = APP.design,
			width,
			height,
			el;
		// console.log(event);
		switch (event.type) {
			case "window.resize":
				el = Self.els.cvs.parent();
				width = el.prop("offsetWidth");
				height = el.prop("offsetHeight");
				Self.els.cvs.attr({ width, height });
				break;
			case "init-view":
				el = Self.els.cvs.parent();
				width = el.prop("offsetWidth");
				height = el.prop("offsetHeight");
				Self.els.cvs.attr({ width, height });
				// ctx.translate(.5, .5);

				Self.data.glyph = Font.glyphs.get(37);

				Self.draw.glyph();
				break;
			case "zoom-minus":
			case "zoom-plus":
			case "zoom-fit":
				console.log(event);
				break;
		}
	},
	draw: {
		glyph() {
			let APP = glyphr,
				Data = APP.design.data,
				ctx = APP.design.els.ctx,
				glyph = Data.glyph,
				scale = 1 / glyph.path.unitsPerEm * Data.fontSize,
				commands = glyph.path.commands,
				anchors = [],
				handles = [],
				path;

			// draw glyph base
			path = glyph.getPath(Data.view.dx, Data.view.dy, Data.fontSize);
			path.fill = Data.draw.fill;
			path.stroke = Data.draw.stroke;
			path.strokeWidth = Data.draw.strokeWidth;
			this.path(ctx, path);

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

			if (Data.draw.anchors) this.anchors(ctx, anchors, Data.view.dx, Data.view.dy, scale);
			if (Data.draw.handles) this.handles(ctx, handles, Data.view.dx, Data.view.dy, scale);
		},
		path(ctx, path) {
			var i, cmd, x1, y1, x2, y2;
			ctx.beginPath();
			for (i = 0; i < path.commands.length; i += 1) {
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
			if (path.fill) {
				ctx.fillStyle = path.fill;
				ctx.fill();
			}
			if (path.stroke) {
				ctx.strokeStyle = path.stroke;
				ctx.lineWidth = path.strokeWidth;
				ctx.stroke();
			}
		},
		anchors(ctx, l, x, y, scale) {
			let size = 6,
				hS = size * .5;
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#999";
			for (let j=0, jl=l.length; j<jl; j+=1) {
				let rx = x + (l[j].x * scale) - hS,
					ry = y + (l[j].y * scale) - hS;
				ctx.fillRect(rx, ry, size, size);
				ctx.strokeRect(rx, ry, size, size);
			}
		},
		handles(ctx, l, x, y, scale) {
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#999";

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				ctx.moveTo(x + (l[j].ox * scale), y + (l[j].oy * scale));
				ctx.lineTo(x + (l[j].x * scale), y + (l[j].y * scale));
			}
			ctx.closePath();
			ctx.stroke();

			ctx.beginPath();
			for (let j=0, jl=l.length; j<jl; j+=1) {
				ctx.moveTo(x + (l[j].x * scale), y + (l[j].y * scale));
				ctx.arc(x + (l[j].x * scale), y + (l[j].y * scale), 3, 0, Math.PI * 2, false);
			}
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
	},
	pan(event) {
		let Self = glyphr,
			Drag = Self.drag;
	}
}
