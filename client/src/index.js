import {
    Bodies,
    Body,
    Bounds,
    Engine,
    Events,
    Mouse,
    MouseConstraint,
    Render,
    Vector,
    World,
} from 'matter-js';

const AVATAR_AIR_FRICTION = 0.1;
const AVATAR_FORCE = 1;
const AVATAR_MASS = 50;
const AVATAR_RADIUS = 20;
const AVATAR_STOP_SPEED = 5;

// create an engine
let engine = Engine.create();
let world = engine.world;

// create a renderer
let matterFrame = document.getElementById("matter-frame");
let render = Render.create({
    element: matterFrame,
    engine: engine
});

// Turn off gravity
world.gravity.y = 0;

let userAvatar = Bodies.circle(40, 40, AVATAR_RADIUS, {
    frictionAir: AVATAR_AIR_FRICTION,
});
Body.setMass(userAvatar, AVATAR_MASS);

let mouse = Mouse.create(render.canvas);

// keep the render in sync with the mouse.
render.mouse = mouse;

/**
 * Accelerate `body` towards `point`, stopping at the point if
 * `point` is within `body` and `body` is going sufficiently slowly.
 *
 * @param body - The body to update the force on
 * @param point - The point to accelerate towards
 * @param mag - The magnitude of the force to apply
 */
function setForceTowards(body, point, mag) {
    const rawForceVec = {
        x: point.x - body.position.x,
        y: point.y - body.position.y,
    };

    let unitForceVec = Vector.normalise(rawForceVec);

    if (Bounds.contains(body.bounds, point)) {
        if (body.speed > AVATAR_STOP_SPEED) {
            unitForceVec = Vector.mult(Vector.normalise(body.velocity), -1);
        } else {
            Body.setVelocity(body, { x: 0, y: 0 });
            return;
        }
    }

    const forceVec = Vector.mult(unitForceVec, mag);
    Body.applyForce(body, body.position, forceVec);
}

// Listen for mouse movements so we can update the acceleration
// of our userAvatar.
let mouseInBounds = false;
render.canvas.onmouseenter = () => {
    mouseInBounds = true;
};
render.canvas.onmouseleave = () => {
    mouseInBounds = false;
};
Events.on(engine, "beforeUpdate", (moveEvent) => {
    if (mouseInBounds) {
        setForceTowards(userAvatar, mouse.position, AVATAR_FORCE);
    }
});

World.add(world, [userAvatar]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
