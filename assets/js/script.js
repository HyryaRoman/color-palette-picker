const rgb2okhsl = culori.converter("okhsl");
const okhsl2hsl = culori.converter("hsl");

function createDiv(className = undefined, parent = undefined) {
  const e = document.createElement("div");
  if (className) {
    e.classList.add(className);
  }
  if (parent && parent.appendChild) {
    parent.appendChild(e);
  }
  return e;
}

function createLine(text, parent = undefined, className = undefined) {
  const e = document.createElement("span");
  e.innerHTML = text + "<br />";
  // if (className) {
  //   e.classList.add(className);
  // }
  if (parent && parent.appendChild) {
    parent.appendChild(e);
  }
  return e;
}

class Switch {
  constructor(root, color = "#777776") {
    this.root = root;
    this.display = root.querySelector(".switch-value");
    this.picker = Pickr.create({
      el: root.querySelector(".switch-picker"),
      default: color,
      ...pickerSettings,
    }).on("change", this.update.bind(this));

    this.update(color);
  }

  get color() {
    const [r, g, b, a] = this.picker.getColor().toRGBA();
    return {
      mode: "rgb",
      r: r / 255.0,
      g: g / 255.0,
      b: b / 255.0,
      a: 1.0,
    };
  }

  set color(value) {
    this.picker.setColor(value);
    this.picker.applyColor();
    this.update();
  }

  get colorHex() {
    return culori.formatHex(this.color);
  }

  update(color = undefined) {
    const c = rgb2okhsl(culori.parse(color) || this.color);
    this.display.innerHTML = (c.l * 100).toFixed(1);
    if (this.onUpdate) this.onUpdate();
  }

  static createElement(parent = undefined, color = "#777776") {
    const root = createDiv("switch");
    createDiv("switch-picker", root);
    createDiv("switch-value", root);

    if (parent && parent.appendChild) {
      parent.appendChild(root);
    }

    return new Switch(root, color);
  }
}

const pickerSettings = {
  theme: "monolith", // 'classic', 'monolith', or 'nano'

  lockOpacity: true,
  comparison: false,

  appClass: "picker-block",
  container: ".picker",

  defaultRepresentation: "HSLA",

  components: {
    // Main components
    preview: false,
    opacity: false,
    hue: true,

    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: false,
      save: false,
    },
  },
};

class Grid {
  constructor(board, width, height, colorData = undefined) {
    this.recreate(board, width, height, colorData);
  }

  recreate(board, width, height, colorData = undefined) {
    this.width = width;
    this.height = height;
    this.root = board;
    this.grid = [];

    board.replaceChildren();

    for (let y = 0; y < this.height; y++) {
      let div = createDiv("board-row", board);
      let row = [];
      for (let x = 0; x < this.width; x++) {
        let s;
        if (colorData) {
          s = Switch.createElement(div, colorData[y][x]);
        } else {
          s = Switch.createElement(div);
        }

        s.onUpdate = this.update.bind(this);

        row.push(s);
      }
      this.grid.push(row);
    }
  }

  store() {
    const buffer = {
      width: this.width,
      height: this.height,
      grid: [],
    };

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.getColor(x, y));
      }
      buffer.grid.push(row);
    }

    window.localStorage.setItem("color-grid", JSON.stringify(buffer));
  }

  static load(board) {
    const buffer = JSON.parse(window.localStorage.getItem("color-grid"));

    if (!buffer) return undefined;

    board.replaceChildren();

    const g = new Grid(board, buffer.width, buffer.height, buffer.grid);

    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        g.setColor(x, y, buffer.grid[y][x]);
      }
    }

    return g;
  }

  getColor(x, y) {
    return this.grid[y][x].colorHex;
  }

  setColor(x, y, color) {
    this.grid[y][x].color = color;
  }

  update() {
    this.store();
    if (this.onUpdate) this.onUpdate();
  }

  clear() {
    this.root.replaceChildren();
    this.grid = [];

    for (let y = 0; y < this.height; y++) {
      let div = createDiv("board-row", this.root);
      let row = [];
      for (let x = 0; x < this.width; x++) {
        const s = Switch.createElement(div);
        s.onUpdate = this.update.bind(this);
        row.push(s);
      }
      this.grid.push(row);
    }

    this.update();
  }

  fillWithColors(colorCalc) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setColor(x, y, colorCalc(x, y));
      }
    }
  }
}

const board = document.getElementById("board-1");
const grid = Grid.load(board) || new Grid(board, 9, 1);

// const board2 = document.getElementById('board-2');
// const grid2 = new Grid(board2, 9, 8);

// const colorNames = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'gray', 'black', 'white'];
const colorNames = [
  "red-loud",
  "red-muted",
  "orange-loud",
  "orange-muted",
  "yellow-loud",
  "yellow-muted",
  "green-loud",
  "green-muted",
  "cyan-loud",
  "cyan-muted",
  "blue-loud",
  "blue-muted",
  "purple-loud",
  "purple-muted",
  "pink-loud",
  "pink-muted",
  // 'red',
  // 'orange',
  // 'yellow',
  // 'green',
  // 'cyan',
  // 'blue',
  // 'purple',
  // 'pink',
  "gray",
];

function getColorName(x, y) {
  const color = colorNames[y];
  let number = Math.floor((x / (grid.width - 1)) * 800) + 100;
  if (number < 10) {
    number = "00" + number.toFixed(0);
  } else if (number < 100) {
    number = "0" + number.toFixed(0);
  } else {
    number = number.toFixed(0);
  }
  return `${color}-${number}`;
}

const sassOutput = document.getElementById("sass-result");
function updateSassOutput() {
  sassOutput.replaceChildren();

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      createLine(
        `<span class="var">$${getColorName(x, y)}</span>: <span class="value">${grid.getColor(x, y)}</span>;`,
        sassOutput
      );
    }
    if (y + 1 < grid.height) createLine("", sassOutput);
  }
}

const jsonOutput = document.getElementById("json-result");
function updateJsonOutput() {
  jsonOutput.replaceChildren();
  createLine("{", jsonOutput);

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      createLine(
        `  <span class="var">"${getColorName(x, y)}"</span>: <span class="value">"${grid.getColor(x, y)}"</span>,`,
        jsonOutput
      );
    }
    if (y + 1 < grid.height) createLine("", jsonOutput);
  }
  createLine("}", jsonOutput);
}

const luaOutput = document.getElementById("lua-result");
function updateLuaOutput() {
  luaOutput.replaceChildren();
  createLine("{", luaOutput);

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      createLine(
        `  <span class="var">["${getColorName(x, y)}"]</span> = <span class="value">"${grid.getColor(x, y)}"</span>,`,
        luaOutput
      );
    }
    if (y + 1 < grid.height) createLine("", luaOutput);
  }
  createLine("}", luaOutput);
}

function updateOutput() {
  updateSassOutput();
  updateJsonOutput();
  updateLuaOutput();
}

grid.onUpdate = updateOutput.bind(this);
updateOutput();

[...document.querySelectorAll(".btn-class-toggle")].forEach((btn) => {
  btn.addEventListener("click", () => {
    board.classList.toggle(btn.getAttribute("data-toggle-class"));
    // board2.classList.toggle(btn.getAttribute('data-toggle-class'));
  });
});

/*
1: red
2: orange
3: yellow
4: green
5: cyan
6: blue
7: purple
8: pink
9: gray
*/

// let colorHues = [30, 50, 88, 135, 185, 255, 300, 328];

// let hueShift = [-10, -8, -6, -4, -2, 0, 7, 14];
// let saturation = [1, 0.95, 0.925, 0.9, 0.875, 0.85, 0.65, 0.5];

// function cc(pl, ps) {
//   return (x, y) => {
//     const h = colorHues[y] + hueShift[x] * ((y > 100 && y < 264) ? 1 : -1);
//     // const s = Math.pow((x + 2) / 10, ps);
//     const s = saturation[x];
//     const l = Math.pow((x + 2) / 10, pl);
//     const colorOKHSL = {mode: 'okhsl', h, s, l};
//     const res = culori.formatHex(okhsl2hsl(colorOKHSL));
//     return res;
//   }
// }
