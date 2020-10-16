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
const height = 150, width = 150
let maze_container = document.getElementById("maze_container")
let maze: { color_id: number, previous_node: Point }[][] = []
let source = { x: 0, y: 0 }
let target = { x: 0, y: 0 }
let table = document.createElement("tbody")
const createMaze = () => {
  for (let x = 0; x < width; x++) {
    let inner = []
    for (let y = 0; y < height; y++)
      inner.push({ color_id: Math.random() > .3 ? 0 : 1, previous_node: { x: - 1, y: -1 } })
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
      if (maze[x][y].color_id === 1)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "#000"
      if (maze[x][y].color_id === 2)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "blue"
      if (maze[x][y].color_id === 3)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "green"
      if (maze[x][y].color_id === 4)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "#aaa"
      if (x === source.x && y === source.y)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "green"
      if (x === target.x && y === target.y)
        (table.children[y].children[x] as HTMLTableDataCellElement).style.backgroundColor = "red"
    }
  }
}

const selectPositions = () => {
  source = {
    x: Math.round(Math.random() * width / 2),
    y: Math.round(Math.random() * height / 2),
  }
  while (maze[source.x][source.y].color_id != 0)
    source = {
      x: Math.round(Math.random() * width / 2),
      y: Math.round(Math.random() * height / 2),
    }

  target = {
    x: Math.round(Math.random() * width / 2 + width / 2 - 1),
    y: Math.round(Math.random() * height / 2 + height / 2 - 1),
  }
  while (maze[target.x][target.y].color_id != 0)
    target = {
      x: Math.round(Math.random() * width / 2 + width / 2 - 1),
      y: Math.round(Math.random() * height / 2 + height / 2 - 1),
    }
}


const depth_first_search_rec = async (pos: Point) => {
  maze[pos.x][pos.y].color_id = 2
  if (pos.x === target.x && pos.y === target.y) { console.log(pos); return true }
  await sleep(0)
  await render()
  for (let x = -1; x < 2; x += 2)
    if (maze?.[pos.x + x]?.[pos.y]?.color_id === 0)
      if (await depth_first_search_rec({ x: pos.x + x, y: pos.y })) {
        maze[pos.x][pos.y].color_id = 3
        await sleep(0)
        await render()
        return true
      }
  for (let y = -1; y < 2; y += 2)
    if (maze?.[pos.x]?.[pos.y + y]?.color_id === 0)
      if (await depth_first_search_rec({ x: pos.x, y: pos.y + y })) {
        maze[pos.x][pos.y].color_id = 3
        await sleep(0)
        await render()
        return true
      }

  await render()
  await sleep(0)
  return false

}
const depth_first_search = async () => {
  depth_first_search_rec(source)
}

const breadth_first_search = async () => {
  const inArray = (array: Point[], point: Point) => {
    for (let p of array) if (p.x == point.x && p.y == point.y) return true
  }
  let queue = [{ ...source, prev: { x: -1, y: -1 } }]
  while (queue.length != 0) {
    let temp = queue.shift()
    maze[temp.x][temp.y].color_id = 2
    maze[temp.x][temp.y].previous_node = temp.prev
    if (temp.x == target.x && temp.y == target.y) {
      break
    }
    if (maze?.[temp.x + 1]?.[temp.y]?.color_id === 0 && !inArray(queue, { x: temp.x + 1, y: temp.y }))
      queue.push({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x - 1]?.[temp.y]?.color_id === 0 && !inArray(queue, { x: temp.x - 1, y: temp.y }))
      queue.push({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x]?.[temp.y + 1]?.color_id === 0 && !inArray(queue, { x: temp.x, y: temp.y + 1 }))
      queue.push({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x]?.[temp.y - 1]?.color_id === 0 && !inArray(queue, { x: temp.x, y: temp.y - 1 }))
      queue.push({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y } })
    await sleep(0)
    await render()
  }
  let current = maze[target.x][target.y]
  while (current.previous_node.x != -1) {
    if (maze?.[current.previous_node.x]?.[current.previous_node.y])
      maze[current.previous_node.x][current.previous_node.y].color_id = 3
    current = maze[current.previous_node.x][current.previous_node.y]
    await sleep(0)
    await render()
  }
}



const a_star = async () => {
  const inArray = (array: Point[], point: Point) => {
    for (let p of array) if (p.x == point.x && p.y == point.y) return true
  }
  let queue = [{ ...source, prev: { x: -1, y: -1 } }]
  while (queue.length != 0) {
    let temp = queue.shift()
    maze[temp.x][temp.y].color_id = 2
    maze[temp.x][temp.y].previous_node = temp.prev
    if (temp.x == target.x && temp.y == target.y) {
      break
    }
    if (maze?.[temp.x + 1]?.[temp.y]?.color_id === 0 && !inArray(queue, { x: temp.x + 1, y: temp.y }))
      queue.push({ x: temp.x + 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x - 1]?.[temp.y]?.color_id === 0 && !inArray(queue, { x: temp.x - 1, y: temp.y }))
      queue.push({ x: temp.x - 1, y: temp.y, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x]?.[temp.y + 1]?.color_id === 0 && !inArray(queue, { x: temp.x, y: temp.y + 1 }))
      queue.push({ x: temp.x, y: temp.y + 1, prev: { x: temp.x, y: temp.y } })
    if (maze?.[temp.x]?.[temp.y - 1]?.color_id === 0 && !inArray(queue, { x: temp.x, y: temp.y - 1 }))
      queue.push({ x: temp.x, y: temp.y - 1, prev: { x: temp.x, y: temp.y } })

    queue.sort(
      (p1, p2) => (
        (p1.x - target.x) * (p1.x - target.x) + (p1.y - target.y) * (p1.y - target.y) <
        (p2.x - target.x) * (p2.x - target.x) + (p2.y - target.y) * (p2.y - target.y) ?
        -1 : 1
      )
    )
    await sleep(0)
    await render()
  }
  let current = maze[target.x][target.y]
  while (current.previous_node.x != -1) {
    if (maze?.[current.previous_node.x]?.[current.previous_node.y])
      maze[current.previous_node.x][current.previous_node.y].color_id = 3
    current = maze[current.previous_node.x][current.previous_node.y]
    await sleep(0)
    await render()
  }
}

create_table()
createMaze()
selectPositions()
render()
a_star()