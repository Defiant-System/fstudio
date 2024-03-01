
class Anchor {
	constructor(path, index) {
		this.path = path;
		this.index = index;

		let point = path.commands[index],
			p2 = path.commands[index+1];
		this.y = point.y;
		this.x = point.x;

		// handle 1
		this.h1 = {
			oY: point.y2,
			oX: point.x2,
			set y(v) { point.y2 = v; },
			set x(v) { point.x2 = v; },
		};

		// handle 2
		this.h2 = {
			oY: p2.y1,
			oX: p2.x1,
			set y(v) { p2.y1 = v; },
			set x(v) { p2.x1 = v; },
		};

		// save reference & orginal copy
		this.point = point;
		this._point = { ...point };
	}

	move(diff) {
		this.point.y = this._point.y + diff.y;
		this.point.x = this._point.x + diff.x;
		// handle 1
		this.h1.y = this.h1.oY + diff.y;
		this.h1.x = this.h1.oX + diff.x;
		// handle 1
		this.h2.y = this.h2.oY + diff.y;
		this.h2.x = this.h2.oX + diff.x;
	}
}
