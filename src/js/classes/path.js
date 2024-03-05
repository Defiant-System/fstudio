
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);

		this._start = { x, y };
		this._snap = 4;

		this._closed = false;
		this._down = true;
		this.anchors = [{ x, y }];
		this.handles = [{ x, y, aX: x, aY: y }];
	}

	get closed() {
		return this._closed;
	}

	moveHandle(x, y) {
		let len = this._path.commands.length-1,
			p1 = this._path.commands[len],
			p2, dX, dY;

		if (p1.type === "C") {
			len = this.anchors.length-1;
			dX = this.anchors[len].x - x;
			dY = this.anchors[len].y - y;
			p1.x2 = this.anchors[len].x + dX;
			p1.y2 = this.anchors[len].y + dY;

			// mirror
			len = this.handles.length-2;
			this.handles[len].x = p1.x2;
			this.handles[len].y = p1.y2;
		} else if (p1.type === "Z") {
			len = this._path.commands.length-2;
			p1 = this._path.commands[len];
			p2 = this._path.commands[1];

			if (!this._start.radius) {
				dX = p2.x1 - this._start.x;
				dY = p2.y1 - this._start.y;
				this._start.radius = Math.sqrt(dX * dX + dY * dY);
			}

			dX = p1.x - x;
			dY = p1.y - y;

			let rad = Math.atan2(dY, dX) + Math.PI,
				sX = this._start.x + this._start.radius * Math.cos(rad),
				sY = this._start.y + this._start.radius * Math.sin(rad);

			this.handles[0].x = sX;
			this.handles[0].y = sY;
			p2.x1 = sX;
			p2.y1 = sY;

			x = p1.x + dX;
			y = p1.y + dY;

			p1.x2 = x;
			p1.y2 = y;
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
			p2 = this._path.commands[len-1],
			dx = this._start.x - x,
			dy = this._start.y - y;

		// is path closable
		this._loop = Math.sqrt(dx * dx + dy * dy) < this._snap;

		if (this._loop) {
			x = this._start.x;
			y = this._start.y;
		}

		if (p2.type === "C") {
			p2.x = x;
			p2.y = y;
			p2.x2 = x;
			p2.y2 = y;
		}
		this._down = false;
	}

	addAnchor(x, y) {
		let len = this._path.commands.length-1,
			p1 = this._path.commands[len];
		p1.x = x;
		p1.y = y;

		// add handle
		this.handles.push({ x, y, aX: x, aY: y });
		// mirror
		this.handles.push({ x, y, aX: x, aY: y });
		// add anchor
		this.anchors.push({ x, y });

		this._down = true;
	}

	closeLoop(x, y) {
		this._path.close();
		this._closed = true;
		// add handle
		this.handles.push({ x, y, aX: x, aY: y });
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
		ctx.lineWidth = 5;
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
			ctx.beginPath();
			ctx.arc(h.x, h.y, 5, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
		});


		ctx.strokeStyle = "#f00";
		this.anchors.map(a => {
			ctx.beginPath();
			ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
		});
	}
}
