
class Path {
	constructor(x, y) {
		this._path = new OpenType.Path();
		this._path.moveTo(x, y);
		this._path.bezierCurveTo(x, y, x, y, x, y);
		// this._path.lineTo(x, y);
	}

	move(x, y) {
		let last = this._path.commands[this._path.commands.length-1];
		last.x = x;
		last.y = y;
	}

	add(x, y) {
		let last = this._path.commands[this._path.commands.length-1];
		last.x1 = x;
		last.y1 = y;
		last.x2 = x;
		last.y2 = y;

		// this._path.bezierCurveTo(x, y, x, y, x, y);
	}

	draw(ctx) {
		let path = this._path,
			cmd, x1, y1, x2, y2;
		
		// path
		ctx.save();
		ctx.beginPath();
		for (let i=0, il=path.commands.length; i<il; i += 1) {
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
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 5;
		ctx.fill();
		ctx.stroke();
		ctx.restore();


		// handles
		let p1 = path.commands[path.commands.length-2],
			p2 = path.commands[path.commands.length-1];
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 1;
		// ctx.strokeRect(100, 200, 4, 4);

		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();
		ctx.closePath();

		// ctx.strokeRect(150, 100, 4, 4);

	}
}
