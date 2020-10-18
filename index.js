function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
const height = 100, width = Math.round(height * 16 / 9);
let maze_container = document.getElementById("maze_container");
let maze = [];
let source = { x: 0, y: 0 };
let target = { x: 0, y: 0 };
var canvas = document.getElementById('canvas');
canvas.style.padding = "0px";
var ctx = canvas.getContext('2d');
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let rect_width = ctx.canvas.width / width;
let rect_height = ctx.canvas.height / height;
const createMaze = () => {
    for (let x = 0; x < width; x++) {
        let inner = [];
        for (let y = 0; y < height; y++)
            inner.push({ ...(Math.random() > .4 ? { color: "#fff", wall: false } : { color: "#000", wall: true }), previous_node: { x: -1, y: -1 } });
        maze.push(inner);
    }
};
const render_piece = async (x, y) => {
    ctx.fillStyle = maze[x][y].color;
    ctx.fillRect(rect_width * x, rect_height * y, rect_width, rect_height);
};
const render = async () => {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (x === source.x && y === source.y)
                ctx.fillStyle = maze[x][y].color = "green";
            if (x === target.x && y === target.y)
                ctx.fillStyle = maze[x][y].color = "red";
            ctx.fillStyle = maze[x][y].color;
            ctx.fillRect(rect_width * x, rect_height * y, rect_width, rect_height);
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
};
const depth_first_search_rec = async (pos, visited) => {
    const inArray = (array, point) => {
        for (let p of array)
            if (p.x == point.x && p.y == point.y)
                return true;
    };
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
createMaze();
selectPositions();
render();
a_star();
