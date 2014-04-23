window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

function PipedreamEngine(opts) {
  this.background_color = opts.background_color || "gray";
  this.grid_color = opts.grid_color || "white";
  this.pipe_color = opts.pipe_color || "black";
  this.width = opts.canvas_width || 750;
  this.height = opts.canvas_height || 525;
  this.grid_width = opts.grid_width || 10; // how wide the grid is, in number of cells
  this.grid_height = opts.grid_height || 7; // how tall the grid is, in number of cells
  this.grid_line_width = opts.grid_line_width || 1;
  this.pipe_width = opts.pipe_width || 8;
  this.cell_width = this.width / this.grid_width;
  this.cell_height = this.height / this.grid_height;

  $canvas = $("#" + opts.canvas_id);
  this.ctx = $canvas[0].getContext("2d");
  this.cells = [];

  this.ctor = (function() {
    for (var i = 0; i < this.grid_width; i++) {
      var columnArray = [];
      for (var j = 0; j < this.grid_height; j++) {
        columnArray[j] = {};
      }
      this.cells[i] = columnArray;
    }

    $canvas.attr({ width: this.width, height: this.height });

    this.clear_screen();
    this.draw_grid();

    /*draw_piece(draw_elbow_piece, 0, 0, 0, 'green');
      draw_piece(draw_elbow_piece, 2, 2, -90);
      draw_piece(draw_elbow_piece, 2, 3, 90);
      draw_piece(draw_elbow_piece, 4, 4, -180);
      draw_piece(draw_straight_piece, 2, 0, 0);
      draw_piece(draw_straight_piece, 4, 0, 90);*/

    this.add_piece_and_draw(ElbowPiece, 0, 0, 0, 'green');
    this.add_piece_and_draw(StraightPiece, 1, 0, 0);

  }).bind(this);

  this.add_piece_and_draw = (function add_piece_and_draw(piece_ctor, cellx, celly, rot_deg, color) {
    this.cells[0][0] = new piece_ctor({cellx: cellx, celly: celly, rot_deg: rot_deg, color: color, game_engine: this});
    this.cells[0][0].draw();
  }).bind(this);

  this.clear_screen = (function clear_screen() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.background_color;
    this.ctx.fill();
  }).bind(this);

  this.draw_grid = (function draw_grid() {
    for (var i = 0; i < this.grid_width; i++) {
      for (var j = 0; j < this.grid_height; j++) {
        var x = i * this.cell_width;
        var y = j * this.cell_height;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.grid_color;
        this.ctx.lineWidth = this.grid_line_width;
        this.ctx.rect(x, y, this.cell_width, this.cell_height);
        this.ctx.stroke();
      }
    }
  }).bind(this);


  this.ctor();
}

function StraightPiece(opts) {
  this.cellx = opts.cellx;
  this.celly = opts.celly;
  this.rot_deg = opts.rot_deg;
  this.color = opts.color || 'black';
  this.game_engine = opts.game_engine;

  this.draw_pipe_segment = (function draw_pipe_segment() {
      this.game_engine.ctx.beginPath();
      this.game_engine.ctx.lineWidth = 1;
      this.game_engine.ctx.moveTo(0, 0);
      this.game_engine.ctx.lineTo(0, -1 * this.game_engine.pipe_width);
      this.game_engine.ctx.stroke();
  }).bind(this);
  
  this.draw_straight_pipe = (function draw_straight_pipe(length) {
    for (var i = 0; i < length; i++) {
      this.draw_pipe_segment();
      this.game_engine.ctx.translate(1, 0);
    }
  }).bind(this);

  this.render_func = (function render_func() {
    this.draw_straight_pipe(this.game_engine.cell_width);
  }).bind(this);

  this.draw = (function draw() {
    this.game_engine.ctx.strokeStyle = this.color || this.pipe_color;
    this.game_engine.ctx.save();
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
