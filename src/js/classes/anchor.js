
class Anchor {
	constructor(path, index) {
		this.path = path;
		this.index = index;

		// console.log( index, this.path.commands.length );

		let p1 = path.commands[index],
			p2 = path.commands[index+1];

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
