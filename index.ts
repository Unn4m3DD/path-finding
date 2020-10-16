function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
class Point {
  x: number
  y: number
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
const height = 300, width = 300
let maze_container = document.getElementById("maze_container")
let maze: { color: string, previous_node: Point, wall: boolean }[][] = []
let source = { x: 0, y: 0 }
let target = { x: 0, y: 0 }
let table = document.createElement("tbody")
const createMaze = () => {
  for (let x = 0; x < width; x++) {
    let inner: { color: string, previous_node: Point, wall: boolean }[] = []
    for (let y = 0; y < height; y++)
      inner.push({ ...(Math.random() > .3 ? { color: "#fff", wall: false } : { color: "#000", wall: true }), previous_node: { x: - 1, y: -1 } })
    maze.push(inner)
  }
}

const create_table = () => {
  for (let y = 0; y < height; y++) {
    let tr = document.createElement("tr") // <tr> </tr>
    for (let x = 0; x < width; x++) {
      const td = document.createElement("td")
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }
  maze_container.appendChild(table)
}

const render = async () => {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (maze[x][y].color)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = maze[x][y].color
      if (x === source.x && y === source.y)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "green"
      if (x === target.x && y === target.y)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "red"
    }
  }
}

const selectPositions = () => {
  source = {
    x: Math.round(Math.random() * width / 10),
    y: Math.round(Math.random() * height / 10),
  }
  while (maze[source.x][source.y].wall)
    source = {
      x: Math.round(Math.random() * width / 10),
      y: Math.round(Math.random() * height / 10),
    }

  target = {
    x: Math.round(Math.random() * width / 10 + 9 * width / 10 - 1),
    y: Math.round(Math.random() * height / 10 + 9 * height / 10 - 1),
  }
  while (maze[target.x][target.y].wall)
    target = {
      x: Math.round(Math.random() * width / 10 + 9 * width / 10 - 1),
      y: Math.round(Math.random() * height / 10 + 9 * height / 10 - 1),
    }
}


const depth_first_search_rec = async (pos: Point, visited: Point[]) => {
  const inArray = (array: Point[], point: Point) => {
    for (let p of array) if (p.x == point.x && p.y == point.y) return true
  }
  if (inArray(visited, pos))
    return false
  visited.push(pos)
  if (maze?.[pos.x]?.[pos.y])
    maze[pos.x][pos.y].color = "#45f"
  else return false
  if (pos.x === target.x && pos.y === target.y) { console.log(pos); return true }
  //await sleep(0)
  //await render()
  for (let x = -1; x < 2; x += 2)
    if (!maze?.[pos.x + x]?.[pos.y]?.wall)
      if (await depth_first_search_rec({ x: pos.x + x, y: pos.y }, visited)) {
        maze[pos.x][pos.y].color = "#4a7"
        //await sleep(0)
        //await render()
        return true
      }
  for (let y = -1; y < 2; y += 2)
    if (!maze?.[pos.x]?.[pos.y + y]?.wall)
      if (await depth_first_search_rec({ x: pos.x, y: pos.y + y }, visited)) {
        maze[pos.x][pos.y].color = "#4a7"
        //await sleep(0)
        //await render()
        return true
      }

  //await render()
  //await sleep(0)
  return false

}
const depth_first_search = async () => {
  await depth_first_search_rec(source, [])
  await render()
  await sleep(0)
}

const breadth_first_search = async () => {
  const inArray = (array: Point[], point: Point) => {
    for (let p of array) if (p.x == point.x && p.y == point.y) return true
  }
  let queue = [{ ...source, prev: { x: -1, y: -1 } }]
  let visited = []
  while (queue.length != 0) {
    let temp = queue.shift()
    if (inArray(visited, temp)) continue
    visited.push(temp)

    if (!maze?.[temp.x]?.[temp.y]) continue
    maze[temp.x][temp.y].color = "#45f"
    maze[temp.x][temp.y].previous_node = temp.prev
    if (temp.x == target.x && temp.y == target.y) {
      break
    }
    if (!maze?.[temp.x + 1]?.[temp.y]?.wall)
      queue.push({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (!maze?.[temp.x - 1]?.[temp.y]?.wall)
      queue.push({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (!maze?.[temp.x]?.[temp.y + 1]?.wall)
      queue.push({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y } })
    if (!maze?.[temp.x]?.[temp.y - 1]?.wall)
      queue.push({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y } })
    //await sleep(0)
    //await render()
  }
  let current = maze[target.x][target.y]
  while (current.previous_node.x != -1) {
    if (maze?.[current.previous_node.x]?.[current.previous_node.y])
      maze[current.previous_node.x][current.previous_node.y].color = "#4a5"
    current = maze[current.previous_node.x][current.previous_node.y]
    //await sleep(0)
    //await render()
  }
  await sleep(0)
  await render()
}


type Item = { prev: Point, x: number, y: number, dist: number }
const a_star = async () => {
  const inArray = (array: Point[], point: Point) => {
    for (let p of array) if (p.x == point.x && p.y == point.y) return true
  }
  const insert_in_place = (
    queue: Item[],
    item: Item
  ) => {
    let i = 0
    while (i < queue.length && item.dist > queue[i++].dist)
      ;
    queue.splice(i, 0, item)
  }
  let queue: Item[] = [{ ...source, prev: { x: -1, y: -1 }, dist: Math.abs(target.x - source.x) + Math.abs(target.y - source.y) }]
  let visited = []
  while (queue.length != 0) {
    let temp = queue.shift()
    if (inArray(visited, temp) || !maze?.[temp.x]?.[temp.y]) continue
    visited.push(temp)

    maze[temp.x][temp.y].color = "#45f"
    maze[temp.x][temp.y].previous_node = temp.prev
    if (temp.x == target.x && temp.y == target.y) {
      break
    }
    if (!maze?.[temp.x + 1]?.[temp.y]?.wall)
      insert_in_place(queue, ({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x + 1) + Math.abs(target.y - temp.y) }))
    if (!maze?.[temp.x - 1]?.[temp.y]?.wall)
      insert_in_place(queue, ({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x - 1) + Math.abs(target.y - temp.y) }))
    if (!maze?.[temp.x]?.[temp.y + 1]?.wall)
      insert_in_place(queue, ({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x) + Math.abs(target.y - temp.y + 1) }))
    if (!maze?.[temp.x]?.[temp.y - 1]?.wall)
      insert_in_place(queue, ({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y }, dist: Math.abs(target.x - temp.x) + Math.abs(target.y - temp.y - 1) }))

    //await sleep(0)
    //await render()
  }
  let current = maze[target.x][target.y]
  while (current.previous_node.x != -1) {
    if (maze?.[current.previous_node.x]?.[current.previous_node.y])
      maze[current.previous_node.x][current.previous_node.y].color = "#4a5"
    current = maze[current.previous_node.x][current.previous_node.y]
  }
  await sleep(0)
  await render()
}

create_table()
createMaze()
selectPositions()
render()
breadth_first_search()