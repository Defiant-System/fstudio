
class Anchor {
	constructor(path, index) {
		this.path = path;
		this.index = index;

		// console.log( index, this.path.commands.length );

		let p1 = path.commands[index],
			p2 = path.commands[index+1],
			d1Y = p1.y - p1.y2,
			d1X = p1.x - p1.x2,
			d2Y = p1.y - p2.y1,
			d2X = p1.x - p2.x1,
			aDiff = Math.abs((Math.abs(Math.atan2(d1Y, d1X)) + Math.abs(Math.atan2(d2Y, d2X))) - Math.PI).toFixed(2),
			radius1 = Math.abs(Math.sqrt(d1X * d1X + d1Y * d1Y)),
			radius2 = Math.abs(Math.sqrt(d2X * d2X + d2Y * d2Y)),
			rDiff = (Math.abs(radius1 - radius2) / (radius1 + radius2)).toFixed(2);
		// "guessing" type of anchor
		switch (true) {
			case (aDiff > 0.01): this.type = "corner"; break;
			case (rDiff >= 0.1): this.type = "flat"; break;
			default: this.type = "symmetric";
		}
		// console.log( rDiff );

		// handle 1
		this.h1 = {
			oY: p1.y2,
			oX: p1.x2,
			set y(v) { if (p1.y2) p1.y2 = this.oY + v; },
			set x(v) { if (p1.x2) p1.x2 = this.oX + v; },
		};

		// handle 2
		this.h2 = {
			oY: p2.y1,
			oX: p2.x1,
			set y(v) { if (p2.y1) p2.y1 = this.oY + v; },
			set x(v) { if (p2.x1) p2.x1 = this.oX + v; },
		};

		// save reference & "origo" values
		this.oY = p1.y;
		this.oX = p1.x;
		this.p1 = [p1];

		if (p2.type === "Z") {
			this.p1.push(path.commands[0]);
			// alter "point 2"
			p2 = path.commands[1];
			this.h2.oY = p2.y1;
			this.h2.oX = p2.x1;
		}
	}

	set y(v) {
		this.p1.map(p => p.y = this.oY + v);
	}

	set x(v) {
		this.p1.map(p => p.x = this.oX + v);
	}

	move(diff) {
		this.y = diff.y;
		this.x = diff.x;
		// handle 1
		this.h1.y = diff.y;
		this.h1.x = diff.x;
		// handle 1
		this.h2.y = diff.y;
		this.h2.x = diff.x;
	}
}
