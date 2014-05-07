window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


function PipedreamEngine(opts) {
  this.background_color = opts.background_color || "gray";
  this.grid_color = opts.grid_color || "white";
  this.pipe_color = opts.pipe_color || "black";
  this.width = opts.canvas_width || 825;
  this.height = opts.canvas_height || 525;
  this.pipe_width = opts.pipe_width || 8;
  this.num_next_pieces = opts.num_next_pieces || 5;
  this.grid_width = opts.grid_width || 10; // how wide the grid is, in number of cells
  this.grid_height = opts.grid_height || 7; // how tall the grid is, in number of cells
  this.grid_line_width = 1;
  this.cell_width = this.width / (this.grid_width + 1); // add 1 for the toolbar
  this.cell_height = this.height / this.grid_height;
  this.toolbar_width = this.cell_width;
  this.playfield_width = this.width - this.toolbar_width;
  this.playfield_height = this.height;

  this.piece_ctors = [ElbowPiece, StraightPiece];
  this.next_pieces = []; // the next pieces that will be drawn when the player clicks an empty cell (FIFO queue)
  this.cells = [];

  $canvas = $("#" + opts.canvas_id);
  this.ctx = $canvas[0].getContext("2d");

  this.ctor = (function PipedreamEngine_ctor() {
    this.init_cells();
    this.init_next_pieces();
    $canvas.attr({ width: this.width, height: this.height });
    $canvas.mouseup(onmouseup);

    this.clear_screen();
    this.draw_grid();
    this.draw_toolbar();

  }).bind(this);

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.add_next_piece = (function add_next_piece() {
    var piece_ctor = this.piece_ctors[getRandomInt(0, this.piece_ctors.length - 1)];
    var possible_rotations = [0, 90, 180, 270];
    var rot_deg = possible_rotations[getRandomInt(0, possible_rotations.length)];
    this.next_pieces.unshift(new piece_ctor({rot_deg: rot_deg, game_engine: this}));
  }).bind(this);

  this.get_next_piece = (function get_next_piece() {
    var next_piece = this.next_pieces.pop();
    this.add_next_piece();
    return next_piece;
  }).bind(this);

  this.init_next_pieces = (function init_next_pieces() {
    for (var i = 0; i < this.num_next_pieces; i++) {
      this.add_next_piece();
    }
  }).bind(this);

  this.draw_toolbar = (function draw_toolbar() {
    this.ctx.save();
    this.ctx.translate(-this.toolbar_width, 0);
    this.draw_next_pieces();
    this.ctx.restore();
    this.draw_toolbar_buttons();
  }).bind(this);

  this.draw_next_pieces = (function draw_next_pieces() {
    for (var i = 0; i < this.num_next_pieces; i++) {
      this.next_pieces[i].cellx = 0;
      this.next_pieces[i].celly = i;
      this.next_pieces[i].draw();
    }
  }).bind(this);

  this.fill_pipes = (function fill_pipes() {
    console.log("fill_pipes");
  }).bind(this);

  this.draw_toolbar_buttons = (function draw_toolbar_buttons() {
    var dx = this.cell_width / 6;
    var dy = this.num_next_pieces * this.cell_height;
    var v1 = {x: 15+dx, y: 30+dy};
    var v2 = {x: dx, y: 40+dy};
    var v3 = {x: dx, y: 20+dy};
    this.playbtn = new PlayButton({v1: v1, v2: v2, v3: v3, ctx: this.ctx, onclick: this.fill_pipes});
    this.playbtn.draw();
  }).bind(this);

  this.clear_cell = (function clear_cell(cellx, celly) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = this.grid_line_width;
    this.ctx.strokeStyle = this.grid_color;
    this.ctx.fillStyle = this.background_color;
    this.ctx.rect(cellx * this.cell_width, celly * this.cell_height, this.cell_width - this.grid_line_width, this.cell_height - this.grid_line_width);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
  }).bind(this);


 
  var onmouseup = (function onmouseup(e){
    var x = e.offsetX - this.toolbar_width;
    var y = e.offsetY;
    if (x > 0) {
      var cellx = Math.floor(x / this.cell_width);
      var celly = Math.floor(y / this.cell_height);
      var cell = this.cells[cellx][celly];
      var next_piece = this.get_next_piece();
      next_piece.cellx = cellx;
      next_piece.celly = celly;
      this.cells[cellx][celly] = next_piece;
      next_piece.draw();
      this.draw_toolbar();
    }
    this.playbtn.click(e.offsetX, e.offsetY);

  }).bind(this);

  this.init_cells = (function init_cells() {
    for (var i = 0; i < this.grid_width; i++) {
      var columnArray = [];
      for (var j = 0; j < this.grid_height; j++) {
        columnArray[j] = null;
      }
      this.cells[i] = columnArray;
    }
  }).bind(this);

  this.clear_screen = (function clear_screen() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.background_color;
    this.ctx.fill();
    this.ctx.restore();
  }).bind(this);

  this.draw_grid = (function draw_grid() {
    this.ctx.save();
    this.ctx.translate(this.toolbar_width, 0);
    for (var i = 0; i < this.grid_width; i++) {
      for (var j = 0; j < this.grid_height; j++) {
        this.clear_cell(i, j);
      }
    }
    this.ctx.restore();
  }).bind(this);

  this.ctor();
}

function StraightPiece(opts) {
  this.cellx = opts.cellx;
  this.celly = opts.celly;
  this.rot_deg = opts.rot_deg;
  this.color = opts.color || 'black';
  this.game_engine = opts.game_engine;
  this.type = "Straight";

  this.draw_pipe_segment = (function draw_pipe_segment(color) {
    this.game_engine.ctx.save();
    this.game_engine.ctx.strokeStyle = color || this.game_engine.pipe_color;
    this.game_engine.ctx.beginPath();
    this.game_engine.ctx.lineWidth = 1;
    this.game_engine.ctx.moveTo(0, 0);
    this.game_engine.ctx.lineTo(0, -1 * this.game_engine.pipe_width);
    this.game_engine.ctx.stroke();
    this.game_engine.ctx.restore();
  }).bind(this);
  
  this.draw_straight_pipe = (function draw_straight_pipe(length) {
    for (var i = 0; i < length; i++) {
      this.draw_pipe_segment(this.game_engine.pipe_color);
      this.game_engine.ctx.translate(1, 0);
    }
  }).bind(this);

  this.render_func = (function render_func() {
    this.draw_straight_pipe(this.game_engine.cell_width);
  }).bind(this);

  this.draw = (function draw() {
    this.game_engine.ctx.save();
    this.game_engine.ctx.strokeStyle = this.color || this.game_engine.pipe_color;
    this.game_engine.ctx.translate(this.game_engine.toolbar_width, 0);
    this.game_engine.clear_cell(this.cellx, this.celly);
    // translate to the center of the cell we're going to draw
    this.game_engine.ctx.translate(this.game_engine.cell_width / 2, this.game_engine.cell_height / 2);
    this.game_engine.ctx.translate(this.game_engine.cell_width * this.cellx, this.game_engine.cell_height * this.celly);
    // rotate the cell the desired number of degrees (about the center of the cell)
    this.game_engine.ctx.rotate(this.rot_deg * Math.PI / 180);
    // translate back to the left edge of the cell, so the drawing begins from there
    this.game_engine.ctx.translate(-this.game_engine.cell_width / 2, this.game_engine.pipe_width / 2);
    this.render_func();
    this.game_engine.ctx.restore();
  }).bind(this);
}

function ElbowPiece(opts) {
  StraightPiece.call(this, opts);
  this.type = "Elbow";

  this.render_func = (function render_func() {
    var straight_pipe_length = this.game_engine.cell_width / 2 - this.game_engine.pipe_width / 2;
    this.draw_straight_pipe(straight_pipe_length);

    // the elbow joint is drawn in this loop
    for (var i = 0; i < 90; i++) {
      this.draw_pipe_segment();
      this.game_engine.ctx.rotate(Math.PI / 180);
    }

    this.draw_straight_pipe(straight_pipe_length);
  }).bind(this);
}

// are these lines necessary?
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
ElbowPiece.prototype = Object.create(StraightPiece.prototype);
ElbowPiece.prototype.constructor = ElbowPiece;

function PlayButton(opts) {
    this.v1 = opts.v1;
    this.v2 = opts.v2;
    this.v3 = opts.v3;
    this.onclick = opts.onclick;
    this.ctx = opts.ctx;

    this.PointInTriangle = (function PointInTriangle(pt, v1, v2, v3) {
      var sign = function(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
      }

      var b1 = sign(pt, v1, v2) < 0;
      var b2 = sign(pt, v2, v3) < 0;
      var b3 = sign(pt, v3, v1) < 0;

      return b1 == b2 && b2 == b3;
    }).bind(this);

    this.click = (function click(x, y) {
      if (this.PointInTriangle({x: x, y: y}, this.v1, this.v2, this.v3)) {
        this.onclick();
      }
    });

    this.draw = (function draw() {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.v1.x, this.v1.y);
      this.ctx.lineTo(this.v2.x, this.v2.y);
      this.ctx.lineTo(this.v3.x, this.v3.y);
      this.ctx.fill();  
      this.ctx.restore();
    });
}
