
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);
		// this._path.bezierCurveTo(x, y, x, y, x, y);
		this._path.lineTo(x, y);
	}

	move(x, y) {
		let last = this._path.commands[this._path.commands.length-1];
		last.x = x;
		last.y = y;
	}

	add(x, y) {
		
	}

	draw(ctx) {
		// ctx.strokeRect(100, 200, 4, 4);

		// ctx.beginPath();
		// ctx.moveTo(102, 202);
		// ctx.lineTo(152, 102);
		// ctx.stroke();
		// ctx.closePath();

		// ctx.strokeRect(150, 100, 4, 4);

		let path = this._path,
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
		ctx.strokeStyle = "#f00";
		ctx.fillStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
}
