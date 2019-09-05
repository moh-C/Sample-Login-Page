import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

const TAU = Math.PI * 2;

const distanceBetween = (v1, v2) => {
  // Approximation by using octagons approach
  var x = v2.x - v1.x;
  var y = v2.y - v1.y;
  return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
};

class Stage {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');

    this.setSize(width, height);
  }

  clear() {
    // this.context.clearRect(0, 0, this.width, this.height);

    this.context.globalCompositeOperation = 'destination-out';
    this.context.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.globalCompositeOperation = 'lighter';
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;

    this.centerX = this.width * 0.5;
    this.centerY = this.height * 0.5;

    this.radius = Math.min(this.width, this.height) * 0.5;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.center = new Vector(this.centerX, this.centerY);
  }

  getRandomPosition() {
    return new Vector(this.width * Math.random(), this.height * Math.random());
  }
}


class Boid {
	constructor({ position, velocity, mass, maxVelocity = 1.5 }) {
		this.position = position;
		this.velocity = velocity;
		this.maxVelocity = maxVelocity;
		this.mass = mass;

		this.acceleration = new Vector();

		this.cellIndex = 0;
		this.regionCells = [];

		this.hue = 0;
	}

	applyForce(force) {
		// force = mass * acceleration
		// acceleration = force / mass
		this.acceleration.addSelf(force.divideSelf(this.mass));
	}

	update(hueTarget, stage) {
		this.hue += (hueTarget - this.hue) * 0.05;

		this.velocity.addSelf(this.acceleration);
		this.velocity.limit(this.maxVelocity);

		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);

		this.checkBounds(stage);
	}

	draw(ctx, radius = 1.5) {
		const fill = `hsl(${this.hue}, 100%, 60%)`;

		ctx.save();
		ctx.translate(this.position.x, this.position.y);

		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	getForces(boids, separationPerception, alignmentPerception, cohesionPerception) {
		let separationCount = 0;
		const separation = new Vector();

		let alignmentCount = 0;
		const alignment = new Vector();

		let cohesionCount = 0;
		const cohesion = new Vector();

		boids.forEach((boid) => {
			if (boid === this) {
				return;
			}

			// if (!this.regionCells.includes(boid.cellIndex)) {
			// 	return;
			// }

			const difference = this.position.subtract(boid.position);
			const distance = distanceBetween(this.position, boid.position);

			// separation
			if (distance <= separationPerception) {
				difference.normalize();
				difference.divideSelf(Math.max(distance, 1));

				separation.addSelf(difference);

				separationCount++;
			}

			// alignment
			if (distance <= alignmentPerception) {
				alignment.addSelf(boid.velocity);

				alignmentCount++;
			}

			// cohesion
			if (distance <= cohesionPerception) {
				cohesion.addSelf(boid.position);

				cohesionCount++;
			}
		});

		if (separationCount > 0) {
			separation.divideSelf(separationCount);
		}

		if (alignmentCount > 0) {
			alignment.divideSelf(alignmentCount);
			alignment.multiplySelf(0.2);
		}

		if (cohesionCount > 0) {
			cohesion.divideSelf(cohesionCount);
			cohesion.subtractSelf(this.position);
			cohesion.length = 0.01;
		}

		return { separation, alignment, cohesion };
	}

	flee(predator, perception = 100) {
		const difference = this.position.subtract(predator.position);
		const distance = difference.length;
		const force = distance / perception;

		const flee = new Vector();

		// separation
		if (distance <= perception) {
			difference.normalize().multiplySelf(force);

			flee.addSelf(difference);
		}

		return flee;
	}

	goto(destination) {
		return destination
			.clone()
			.subtract(this.position)
			.multiply(0.0001);
	}

	getNearest(boids) {
		const sorted = boids.map((b) => {
			const distance = distanceBetween(this.position, b.position);
			return { position: b.position, distance };
		}).sort((a, b) => a.distance - b.distance);

		return sorted[0];
	}

	checkBounds(stage) {
		const { width, height } = stage;

		if (this.position.x > width) {
			this.position.x = 0;
		}

		if (this.position.x < 0) {
			this.position.x = width;
		}

		if (this.position.y > height) {
			this.position.y = 0;
		}

		if (this.position.y < 0) {
			this.position.y = height;
		}
	}
}

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const pointer = { position: stage.center.clone() };

let scatter = false;
const numBoids = 400;

const controlSeparation = document.getElementById('separation');
const controlCohesion = document.getElementById('cohesion');
const controlAlignment = document.getElementById('alignment');
const controlPerception = document.getElementById('perception');
const controlPredators = document.getElementById('predators');

const boids = new Array(numBoids).fill().map((_, i) => {
	const position = stage.getRandomPosition();
	const mass = 1;
	const maxVelocity = 1.5;

	const a = Math.random() * TAU;
	const velocity = new Vector();
	velocity.length = maxVelocity;
	velocity.angle = a;

	return new Boid({ position, mass, velocity, maxVelocity });
});

const numPredators = 4;
const predators = new Array(numPredators).fill().map(() => {
	return new Boid({
		position: stage.getRandomPosition(),
		velocity: new Vector(Math.cos(Math.random() * TAU), Math.sin(Math.random() * TAU)),
		mass: 1,
		maxVelocity: 2,
	});
});

const loop = () => {
	stats.begin();
	stage.clear();

	const perception = controlPerception.value;
	const applyPredators = controlPredators.checked;

	boids.forEach((boid, i) => {
		const { separation, alignment, cohesion } = boid.getForces(boids, perception * 0.5, perception, perception);
		const directionalForce = boid.goto(stage.center);

		boid.applyForce(directionalForce.multiplySelf(0.2));
		boid.applyForce(cohesion.multiplySelf(controlCohesion.value));
		boid.applyForce(alignment.multiplySelf(controlAlignment.value));
		boid.applyForce(separation.multiplySelf(controlSeparation.value));

		if (applyPredators) {
			predators.forEach((predator) => {
				boid.applyForce(boid.flee(predator, stage.width * 0.1));
			});
		}

		if (scatter) {
			const predatorForce = boid.flee(pointer, stage.width * 0.1);

			boid.applyForce(predatorForce);

		}

		const hue = 180 + (Math.cos((boid.position.x + boid.position.y) * 0.001) * 180);
		boid.update(hue, stage);
		boid.draw(stage.context);
	});

	if (applyPredators) {
		predators.forEach((predator) => {
			const nearest = predator.getNearest(boids);
			predator.applyForce(predator.goto(nearest.position).multiplySelf(5));
			predator.update(0, stage);
			predator.draw(stage.context, 3);
		});
	}

	stats.end();

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});

document.body.addEventListener('pointermove', (e) => {
	pointer.position.x = e.clientX;
	pointer.position.y = e.clientY;
});

document.body.addEventListener('pointerdown', () => {
	scatter = true;
});

document.body.addEventListener('pointerup', () => {
	scatter = false;
});
