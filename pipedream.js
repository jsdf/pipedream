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

  var $canvas = $("#" + opts.canvas_id);
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");
  this.ctx = context;

  $canvas.attr({ width: this.width, height: this.height });

  var clear_screen = (function clear_screen() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.background_color;
    this.ctx.fill();
  }).bind(this);

  var draw_grid = (function draw_grid() {
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

  var draw_pipe_segment = (function draw_pipe_segment() {
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -1 * this.pipe_width);
      this.ctx.stroke();
  }).bind(this);
  
  var draw_straight_pipe = (function draw_straight_pipe(length) {
    for (var i = 0; i < length; i++) {
      draw_pipe_segment();
      this.ctx.translate(1, 0);
    }
  }).bind(this);

  var draw_elbow_piece = (function draw_elbow() {
    var straight_pipe_length = this.cell_width / 2 - this.pipe_width / 2;
    draw_straight_pipe(straight_pipe_length);

    // the elbow joint is drawn in this loop
    for (var i = 0; i < 90; i++) {
      draw_pipe_segment();
      this.ctx.rotate(Math.PI / 180);
    }

    draw_straight_pipe(straight_pipe_length);
  }).bind(this);

  var draw_straight_piece = (function draw_straight_piece() {
    draw_straight_pipe(this.cell_width);
  }).bind(this);

  var draw_piece = (function draw_piece(piece_draw_func, cellx, celly, rot_deg, color) {
    this.ctx.strokeStyle = color || this.pipe_color;
    this.ctx.save();
    // translate to the center of the cell we're going to draw
    this.ctx.translate(this.cell_width / 2, this.cell_height / 2);
    this.ctx.translate(this.cell_width * cellx, this.cell_height * celly);
    // rotate the cell the desired number of degrees (about the center of the cell)
    this.ctx.rotate(rot_deg * Math.PI / 180);
    // translate back to the left edge of the cell, so the drawing begins from there
    this.ctx.translate(-this.cell_width / 2, this.pipe_width / 2);
    piece_draw_func();
    this.ctx.restore();
  }).bind(this);

  clear_screen();
  draw_grid();

  draw_piece(draw_elbow_piece, 0, 0, 0, 'green');
  draw_piece(draw_elbow_piece, 2, 2, -90);
  draw_piece(draw_elbow_piece, 2, 3, 90);
  draw_piece(draw_elbow_piece, 4, 4, -180);
  draw_piece(draw_straight_piece, 2, 0, 0);
  draw_piece(draw_straight_piece, 4, 0, 90);
}



