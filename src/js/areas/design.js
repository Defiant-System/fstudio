
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
			fontSize: 300,
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
			Data = Self.data,
			ctx = Self.els.ctx,
			glyph,
			path,
			width,
			height,
			zoom,
			x, y,
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
				// console.log( Font.draw );

				el = Self.els.cvs.parent();
				width = el.prop("offsetWidth");
				height = el.prop("offsetHeight");
				Self.els.cvs.attr({ width, height });
				// ctx.translate(.5, .5);

				Data.glyph = Font.glyphs.get(37);

				Self.dispatch({ type: "draw-glyph" });
				break;
			case "draw-glyph":
				x = Data.view.dx;
				y = Data.view.dy;
				zoom = Data.view.dz;
				glyph = Data.glyph;

				console.log( ctx.bezierCurveTo );
				// ctx.fillStyle = '#606060';
				// path = glyph.path;
				// path.fill = "#808080";
				// path.stroke = "#f00";
				// path.strokeWidth = 1.5;

				glyph.draw(ctx, x, y, Data.fontSize);
				// glyph.drawPoints(Self.els.ctx, x, y, Data.fontSize);
				// glyph.drawMetrics(Self.els.ctx, x, y, Data.fontSize);


				function drawAnchors(l, x, y, scale) {
					let size = 7,
						hS = size * .5;
					ctx.fillStyle = "#fff";
					ctx.strokeStyle = "#00a7fa";
					for (let j=0; j<l.length; j+=1) {
						let rx = x + (l[j].x * scale) - hS,
							ry = y + (l[j].y * scale) - hS;
						ctx.fillRect(rx, ry, size, size);
						ctx.strokeRect(rx, ry, size, size);
					}
				}

				function drawHandles(l, x, y, scale) {
					ctx.fillStyle = "red";
					ctx.beginPath();
					for (let j=0; j<l.length; j+=1) {
						ctx.moveTo(x + (l[j].x * scale), y + (l[j].y * scale));
						ctx.arc(x + (l[j].x * scale), y + (l[j].y * scale), 4, 0, Math.PI * 2, false);
					}
					ctx.closePath();
					ctx.fill();
				}

				let scale = 1 / glyph.path.unitsPerEm * Data.fontSize;
				let blueCircles = [];
				let redCircles = [];
				
				path = glyph.path;
				
				for (let i = 0; i < path.commands.length; i += 1) {
					let cmd = path.commands[i];
					if (cmd.x !== undefined) {
						blueCircles.push({x: cmd.x, y: -cmd.y});
					}
					if (cmd.x1 !== undefined) {
						redCircles.push({x: cmd.x1, y: -cmd.y1});
					}
					if (cmd.x2 !== undefined) {
						redCircles.push({x: cmd.x2, y: -cmd.y2});
					}
				}

				drawAnchors(blueCircles, x, y, scale);
				// drawHandles(redCircles, x, y, scale);

				break;
			case "draw-glyph-points":
				break;
			case "draw-glyph-metrics":
				break;
		}
	}
}
