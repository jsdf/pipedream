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
  
  var draw_straight_pipe = (function draw_straight_pipe() {
    for (var x_offset = 0; x_offset < this.cell_width / 2 - this.pipe_width / 2; x_offset++) {
      this.ctx.save();
      this.ctx.strokeStyle = this.pipe_color;
      this.ctx.beginPath();
      this.ctx.translate(0 + x_offset, this.cell_height / 2 + this.pipe_width / 2);
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -1 * this.pipe_width);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }).bind(this);

  var draw_elbow = (function draw_elbow() {
      draw_straight_pipe();
      for (var degrees = 0; degrees < 90; degrees++) {
        this.ctx.save();
        this.ctx.strokeStyle = this.pipe_color;
        this.ctx.beginPath();
        this.ctx.translate(this.cell_width / 2 - this.pipe_width / 2, this.cell_height / 2 + this.pipe_width / 2);
        this.ctx.rotate(degrees * Math.PI / 180);
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -1 * this.pipe_width);
        this.ctx.stroke();
        this.ctx.restore();
      }

      this.ctx.save();
      this.ctx.translate(this.cell_width, this.cell_height / 2 + this.pipe_width / 2);
      this.ctx.rotate(90 * Math.PI / 180);
      draw_straight_pipe();
      this.ctx.restore();
  }).bind(this);

  clear_screen();
  draw_elbow();
  draw_grid();
}



