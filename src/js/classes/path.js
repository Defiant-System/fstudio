
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);

		this.anchor = { x, y };
		this._down = true;

		// this._path.bezierCurveTo(x, y, x, y, x, y);
		// this._path.lineTo(x, y);
	}

	moveHandle(x, y) {
		let len = this._path.commands.length,
			p1 = this._path.commands[len-1];

		if (p1.type === "C") {
			p1.x2 = x;
			p1.y2 = y;
		}

		this.handle = { x, y };
		this._down = true;
	}

	releaseHandle(x, y) {
		this._path.bezierCurveTo(x, y, x, y, x, y);

		this.handle = { x, y };
		this._down = false;
	}

	moveAnchor(x, y) {
		let len = this._path.commands.length,
			p2 = this._path.commands[len-1];
		p2.x = x;
		p2.y = y;

		// this.handle = { x, y };
		this._down = false;
	}

	addAnchor(x, y) {
		let len = this._path.commands.length,
			p1 = this._path.commands[len-1];

		p1.x = x;
		p1.y = y;

		// this._path.bezierCurveTo(x, y, x, y, x, y);

		this.anchor = { x, y };
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
		x1 = this.anchor.x;
		y1 = this.anchor.y;
		x2 = this.handle.x;
		y2 = this.handle.y;
		
		ctx.strokeStyle = "#090";
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.closePath();

		ctx.strokeStyle = "#f00";
		ctx.strokeRect(x1-2, y1-2, 4, 4);
		ctx.strokeStyle = "#00f";
		ctx.strokeRect(x2-2, y2-2, 4, 4);
	}
}
