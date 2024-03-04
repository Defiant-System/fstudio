
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);

		this._down = true;
		this.anchors = [{ x, y }];
		this.handles = [{ x, y }];

		// this._path.bezierCurveTo(x, y, x, y, x, y);
		// this._path.lineTo(x, y);
	}

	moveHandle(x, y) {
		let len = this._path.commands.length,
			p1 = this._path.commands[len-1];

		if (p1.type === "C") {
			let dX = this.anchors[0].x - x,
				dY = this.anchors[0].y - y;
			p1.x2 = this.anchors[0].x + dX;
			p1.y2 = this.anchors[0].y + dY;
		}

		this.handles[0].x = x;
		this.handles[0].y = y;
		this._down = true;
	}

	releaseHandle(x, y) {
		this._path.bezierCurveTo(x, y, x, y, x, y);

		this.handles[0].x = x;
		this.handles[0].y = y;
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
		let len = this._path.commands.length,
			p1 = this._path.commands[len-1];
		p1.x = x;
		p1.y = y;

		this.anchors[0].x = x;
		this.anchors[0].y = y;
		this._down = true;
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
		x1 = this.anchors[0].x;
		y1 = this.anchors[0].y;
		x2 = this.handles[0].x;
		y2 = this.handles[0].y;
		
		ctx.strokeStyle = "#090";
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.closePath();

		ctx.strokeStyle = "#f00";
		this.anchors.map(a => {
			ctx.strokeRect(a.x-2, a.y-2, 4, 4);
		});

		ctx.strokeStyle = "#00f";
		this.handles.map(h => {
			ctx.strokeRect(h.x-2, h.y-2, 4, 4);
		});
	}
}
