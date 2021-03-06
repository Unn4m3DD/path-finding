function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
let generating = false;
const inArray = (array, point) => {
    for (let p of array)
        if (p.x == point.x && p.y == point.y)
            return true;
};
const height = 64 + 1;
const width = 128 + 2;
//let width = Math.round(height * window.innerWidth / window.innerHeight)
//
//if (width % 2 == 0) width++;
let maze_container = document.getElementById("maze_container");
let maze = [];
let source = { x: 0, y: 0 };
let target = { x: 0, y: 0 };
var canvas = document.getElementById('canvas');
canvas.style.padding = "0px";
canvas.style.height = "" + (32 * window.innerWidth / 64 - 200);
canvas.style.width = "" + window.innerWidth * .9;
var ctx = canvas.getContext('2d');
ctx.canvas.width = window.innerHeight * .9;
ctx.canvas.height = 32 * window.innerHeight / 64 - 200;
let rect_width = ctx.canvas.width / width;
let rect_height = ctx.canvas.height / height;
const createRandomMaze = () => {
    maze = [];
    for (let x = 0; x < width; x++) {
        let inner = [];
        for (let y = 0; y < height; y++)
            inner.push({ ...(Math.random() > .3 ? { color: "#fff", wall: false } : { color: "#000", wall: true }), previous_node: { x: -1, y: -1 } });
        maze.push(inner);
    }
};
const createMaze1 = async () => {
    maze = [];
    for (let x = 0; x < width; x++) {
        let inner = [];
        for (let y = 0; y < height; y++)
            inner.push({
                ...(((x % 2) == 0 || (y % 2) == 0) ? { color: "#000", wall: true } : { color: "#fff", wall: false }), previous_node: { x: -1, y: -1 }
            });
        maze.push(inner);
    }
    let start_pos = new Point(1, 1);
    let stack = [start_pos];
    let visited = [];
    while (stack.length != 0) {
        let current_pos = stack.pop();
        let pool = [new Point(1, 0), new Point(-1, 0), new Point(0, -1), new Point(0, 1)];
        while (pool.length > 0) {
            console.log(pool);
            const dir = Math.floor(Math.random() * pool.length);
            let choice = pool[dir];
            pool.splice(dir, 1);
            const new_position = new Point(current_pos.x + choice.x * 2, current_pos.y + choice.y * 2);
            if (0 < new_position.x && new_position.x < width - 1 &&
                0 < new_position.y && new_position.y < height - 1 &&
                !inArray(visited, new_position)) {
                maze[current_pos.x + choice.x][current_pos.y + choice.y] = { color: "#fff", wall: false, previous_node: { x: -1, y: -1 } };
                stack.push(new_position);
                visited.push(new_position);
            }
        }
        await render();
        await sleep(0);
    }
};
const createMaze2 = async () => {
    maze = [];
    for (let x = 0; x < width; x++) {
        let inner = [];
        for (let y = 0; y < height; y++)
            inner.push({
                color: "#fff", wall: false, previous_node: { x: -1, y: -1 }
            });
        maze.push(inner);
    }
    for (let x = 0; x < width; x++) {
        maze[x][0] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
        maze[x][height - 1] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
    }
    for (let y = 0; y < height; y++) {
        maze[0][y] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
        maze[width - 1][y] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
    }
    const recursive_paint = async (x_begin, x_end, y_begin, y_end, parity_check, not_recursive) => {
        const h_middle = Math.floor((x_end + x_begin) / 2);
        const v_middle = Math.floor((y_end + y_begin) / 2);
        if (x_end - x_begin < 3 || y_end - y_begin < 3)
            return;
        let pool = [
            { x: [h_middle, h_middle], y: [y_begin + 1, v_middle - 1] },
            { x: [h_middle, h_middle], y: [v_middle + 1, y_end] },
            { x: [x_begin + 1, h_middle - 1], y: [v_middle, v_middle] },
            { x: [h_middle + 1, x_end], y: [v_middle, v_middle] },
        ];
        let not_included = [];
        for (let i = 0; i < 3; i++) {
            let choice = Math.floor(Math.random() * pool.length);
            let range = pool[choice];
            pool.splice(choice, 1);
            let point = {
                x: Math.floor(Math.random() * (range.x[1] - range.x[0]) + range.x[0]),
                y: Math.floor(Math.random() * (range.y[1] - range.y[0]) + range.y[0])
            };
            if (point.x != h_middle && (point.x + parity_check) % 2 == 0)
                point.x++;
            if (point.y != v_middle && (point.y) % 2 == 0)
                point.y++;
            not_included.push(point);
        }
        for (let x = Math.floor(x_begin); x < x_end; x++) {
            if (!inArray(not_included, { x, y: v_middle }))
                maze[x][v_middle] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
            await render_piece(x, v_middle);
            await sleep(30);
        }
        for (let y = Math.floor(y_begin); y < y_end; y++) {
            if (!inArray(not_included, { x: h_middle, y }))
                maze[h_middle][y] = { color: "#000", wall: true, previous_node: { x: -1, y: -1 } };
            await render_piece(h_middle, y);
            await sleep(30);
        }
        if (not_recursive)
            return;
        await Promise.all([
            recursive_paint(x_begin, h_middle, y_begin, v_middle, parity_check),
            recursive_paint(x_begin, h_middle, v_middle, y_end, parity_check),
            recursive_paint(h_middle, x_end, y_begin, v_middle, parity_check),
            recursive_paint(h_middle, x_end, v_middle, y_end, parity_check)
        ]);
    };
    await render();
    await sleep(0);
    await Promise.all([
        recursive_paint(0, Math.floor(width / 2), 0, height - 1, 0, false),
        recursive_paint(Math.floor(width / 2), width - 1, 0, height - 1, 1, false)
    ]);
    return;
};
const render_piece = async (x, y) => {
    maze[source.x][source.y].color = "green";
    ctx.fillStyle = maze[x][y].color;
    ctx.fillRect(rect_width * x - .05, rect_height * y - .05, rect_width + .1, rect_height + .1);
};
const render = async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear html5 canvas
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            render_piece(x, y);
        }
    }
};
const selectPositions = () => {
    source = {
        x: Math.round(Math.random() * width / 10),
        y: Math.round(Math.random() * height / 10),
    };
    while (maze[source.x][source.y].wall)
        source = {
            x: Math.round(Math.random() * width / 10),
            y: Math.round(Math.random() * height / 10),
        };
    target = {
        x: Math.round(Math.random() * width / 10 + 9 * width / 10 - 1),
        y: Math.round(Math.random() * height / 10 + 9 * height / 10 - 1),
    };
    while (maze[target.x][target.y].wall)
        target = {
            x: Math.round(Math.random() * width / 10 + 9 * width / 10 - 1),
            y: Math.round(Math.random() * height / 10 + 9 * height / 10 - 1),
        };
    ctx.fillStyle = maze[source.x][source.y].color = "green";
    ctx.fillStyle = maze[target.x][target.y].color = "red";
};
const depth_first_search_rec = async (pos, visited) => {
    if (inArray(visited, pos))
        return false;
    visited.push(pos);
    if (maze?.[pos.x]?.[pos.y])
        maze[pos.x][pos.y].color = "#45f";
    else
        return false;
    if (pos.x === target.x && pos.y === target.y) {
        console.log(pos);
        return true;
    }
    await sleep(0);
    await render_piece(pos.x, pos.y);
    for (let x = -1; x < 2; x += 2)
        if (!maze?.[pos.x + x]?.[pos.y]?.wall)
            if (await depth_first_search_rec({ x: pos.x + x, y: pos.y }, visited)) {
                maze[pos.x][pos.y].color = "#4a7";
                await sleep(0);
                await render_piece(pos.x, pos.y);
                return true;
            }
    for (let y = -1; y < 2; y += 2)
        if (!maze?.[pos.x]?.[pos.y + y]?.wall)
            if (await depth_first_search_rec({ x: pos.x, y: pos.y + y }, visited)) {
                maze[pos.x][pos.y].color = "#4a7";
                await sleep(0);
                await render_piece(pos.x, pos.y);
                return true;
            }
    await render();
    await sleep(0);
    return false;
};
const depth_first_search = async () => {
    await depth_first_search_rec(source, []);
    await render();
    await sleep(0);
};
const breadth_first_search = async () => {
    const inArray = (array, point) => {
        for (let p of array)
            if (p.x == point.x && p.y == point.y)
                return true;
    };
    let queue = [{ ...source, prev: { x: -1, y: -1 } }];
    let visited = [];
    while (queue.length != 0) {
        let temp = queue.shift();
        if (inArray(visited, temp))
            continue;
        visited.push(temp);
        if (!maze?.[temp.x]?.[temp.y])
            continue;
        maze[temp.x][temp.y].color = "#45f";
        maze[temp.x][temp.y].previous_node = temp.prev;
        if (temp.x == target.x && temp.y == target.y) {
            break;
        }
        if (!maze?.[temp.x + 1]?.[temp.y]?.wall)
            queue.push({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y } });
        if (!maze?.[temp.x - 1]?.[temp.y]?.wall)
            queue.push({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y } });
        if (!maze?.[temp.x]?.[temp.y + 1]?.wall)
            queue.push({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y } });
        if (!maze?.[temp.x]?.[temp.y - 1]?.wall)
            queue.push({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y } });
        await sleep(0);
        await render_piece(temp.x, temp.y);
    }
    let current = maze[target.x][target.y];
    while (current.previous_node.x != -1) {
        if (maze?.[current.previous_node.x]?.[current.previous_node.y]) {
            maze[current.previous_node.x][current.previous_node.y].color = "#4a5";
            await render_piece(current.previous_node.x, current.previous_node.y);
        }
        current = maze[current.previous_node.x][current.previous_node.y];
    }
    await render();
};
const a_star = async () => {
    const inArray = (array, point) => {
        for (let p of array)
            if (p.x == point.x && p.y == point.y)
                return true;
    };
    const insert_in_place = (queue, item) => {
        let i = 0;
        while (i < queue.length && item.dist > queue[i++].dist)
            ;
        queue.splice(i, 0, item);
    };
    let queue = [{ ...source, prev: { x: -1, y: -1 }, dist: Math.abs(target.x - source.x) + Math.abs(target.y - source.y) }];
    let visited = [];
    while (queue.length != 0) {
        let temp = queue.shift();
        if (inArray(visited, temp) || !maze?.[temp.x]?.[temp.y])
            continue;
        visited.push(temp);
        maze[temp.x][temp.y].color = "#4455" + (Math.round(temp.dist / (height + width) * 255)).toString(16).padStart(2, "0");
        maze[temp.x][temp.y].previous_node = temp.prev;
        if (temp.x == target.x && temp.y == target.y) {
            break;
        }
        if (!maze?.[temp.x + 1]?.[temp.y]?.wall)
            insert_in_place(queue, ({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x + 1) + Math.abs(target.y - temp.y) }));
        if (!maze?.[temp.x - 1]?.[temp.y]?.wall)
            insert_in_place(queue, ({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x - 1) + Math.abs(target.y - temp.y) }));
        if (!maze?.[temp.x]?.[temp.y + 1]?.wall)
            insert_in_place(queue, ({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x) + Math.abs(target.y - temp.y + 1) }));
        if (!maze?.[temp.x]?.[temp.y - 1]?.wall)
            insert_in_place(queue, ({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x) + Math.abs(target.y - temp.y - 1) }));
        await sleep(0);
        await render_piece(temp.x, temp.y);
    }
    let current = maze[target.x][target.y];
    while (current.previous_node.x != -1) {
        if (maze?.[current.previous_node.x]?.[current.previous_node.y]) {
            maze[current.previous_node.x][current.previous_node.y].color = "#4a5";
            await render_piece(current.previous_node.x, current.previous_node.y);
        }
        current = maze[current.previous_node.x][current.previous_node.y];
    }
    await sleep(0);
    await render();
};
const generate_maze = async () => {
    if (generating)
        return;
    generating = true;
    await createMaze1();
    selectPositions();
    render();
    generating = false;
};
const generate_random_map = async () => {
    if (generating)
        return;
    generating = true;
    await createRandomMaze();
    await selectPositions();
    await render();
    generating = false;
};
const generate_hard_maze = async () => {
    if (generating)
        return;
    generating = true;
    await createMaze2();
    await selectPositions();
    await render();
    generating = false;
};
generate_hard_maze();
