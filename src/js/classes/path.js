
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);

		this._down = true;
		this.anchors = [{ x, y }];
		this.handles = [{ x, y, aX: x, aY: y }];
	}

	moveHandle(x, y) {
		let len = this._path.commands.length-1,
			p1 = this._path.commands[len];

		if (p1.type === "C") {
			len = this.anchors.length-1;
			let dX = this.anchors[len].x - x,
				dY = this.anchors[len].y - y;
			p1.x2 = this.anchors[len].x + dX;
			p1.y2 = this.anchors[len].y + dY;

			// mirror
			len = this.handles.length-2;
			this.handles[len].x = p1.x2;
			this.handles[len].y = p1.y2;
		}

		len = this.handles.length-1;
		this.handles[len].x = x;
		this.handles[len].y = y;

		this._down = true;
	}

	releaseHandle(x, y) {
		this._path.bezierCurveTo(x, y, x, y, x, y);

		let len = this.handles.length-1;
		this.handles[len].x = x;
		this.handles[len].y = y;
		this._down = false;
	}

	moveAnchor(x, y) {
		let len = this._path.commands.length,
			p2 = this._path.commands[len-1];
		p2.x = x;
		p2.y = y;

		this._down = false;
	}

	addAnchor(x, y) {
		let len = this._path.commands.length-1,
			p1 = this._path.commands[len];
		p1.x = x;
		p1.y = y;

		// add handle
		this.handles.push({ x, y });
		len = this.handles.length-1;
		this.handles[len].aX = x;
		this.handles[len].aY = y;

		// mirror
		this.handles.push({ x, y });
		len = this.handles.length-1;
		this.handles[len].aX = x;
		this.handles[len].aY = y;


		// add anchor
		this.anchors.push({ x, y });
		len = this.anchors.length-1;
		this.anchors[len].x = x;
		this.anchors[len].y = y;
		this._down = true;
	}

	closeLoop(x, y) {
		
	}

	draw(ctx) {
		let path = this._path,
			len = path.commands.length,
			cmd, x1, y1, x2, y2;
		
		// path
		ctx.save();
		ctx.beginPath();
		for (let i=0, il=len; i<il; i += 1) {
			cmd = path.commands[i];
			switch (cmd.type) {
				case "M":
					ctx.moveTo(cmd.x, cmd.y);
					break;
				case "L":
					ctx.lineTo(cmd.x, cmd.y);
					x1 = x2;
					y1 = y2;
					break;
				case "C":
					ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
					x1 = cmd.x2;
					y1 = cmd.y2;
					break;
				case "Q":
					ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
					x1 = cmd.x1;
					y1 = cmd.y1;
					break;
				case "Z":
					ctx.closePath();
					break;
			}
			x2 = cmd.x;
			y2 = cmd.y;
		}
		ctx.save();
		ctx.strokeStyle = "#33333377";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();


		// handles
		ctx.strokeStyle = "#090";
		ctx.beginPath();
		this.handles.map(h => {
			ctx.moveTo(h.aX, h.aY);
			ctx.lineTo(h.x, h.y);
		});
		ctx.stroke();
		ctx.closePath();

		ctx.strokeStyle = "#00f";
		this.handles.map(h => {
			ctx.strokeRect(h.x-3, h.y-3, 6, 6);
		});


		ctx.strokeStyle = "#f00";
		this.anchors.map(a => {
			ctx.strokeRect(a.x-2, a.y-2, 4, 4);
		});
	}
}
