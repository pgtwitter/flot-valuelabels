/**
 * Value Labels Plugin for flot.
 * http://leonardoeloy.github.com/flot-valuelabels
 * http://wiki.github.com/leonardoeloy/flot-valuelabels/
 *
 * Using canvas.fillText instead of divs, which is better for printing - by Leonardo Eloy, March 2010.
 * Tested with Flot 0.6 and JQuery 1.3.2.
 *
 * Original homepage: http://sites.google.com/site/petrsstuff/projects/flotvallab
 * Released under the MIT license by Petr Blahos, December 2009.
 */
(function ($) {
  var options = {
    valueLabels: {
      show:            false,
      showAsHtml:      false, // Set to true if you wanna switch back to DIV usage (you need plot.css for this)
      showLastValue:   false, // Use this to show the label only for the last value in the series
      labelFormatter:  function(v) { return v; }, // Format the label value to what you want
      align:           'start', // can also be 'center', 'left' or 'right'
      plotAxis:        'y', // Set to the axis values you wish to plot
      hideZero:        false
    }
  };

  function init(plot) {
    plot.hooks.draw.push( function (plot, ctx) {

      if (!plot.getOptions().valueLabels.show) return;

      var showLastValue  = plot.getOptions().valueLabels.showLastValue;
      var showAsHtml     = plot.getOptions().valueLabels.showAsHtml;
      var plotAxis       = plot.getOptions().valueLabels.plotAxis;
      var labelFormatter = plot.getOptions().valueLabels.labelFormatter;
      var fontcolor      = plot.getOptions().valueLabels.fontcolor;
      var xoffset        = plot.getOptions().valueLabels.xoffset;
      var yoffset        = plot.getOptions().valueLabels.yoffset;
      var align          = plot.getOptions().valueLabels.align;
      var font           = plot.getOptions().valueLabels.font;
      // var ctx            = plot.getCanvas().getContext("2d");
      var hideZero       = plot.getOptions().valueLabels.hideZero;

      var prevY= [];
      var prevYY= [];
      var firstDataLength= plot.getData()[0].data.length;
      for(var i= 0; i < firstDataLength; i++) {prevY[i]= 0; prevYY[i]= 0;}

      $.each(plot.getData(), function(ii, series) {
        // Workaround, since Flot doesn't set this value anymore
        series.seriesIndex = ii;

        if (showAsHtml) {
          plot.getPlaceholder().find("#valueLabels"+ii).remove();
        }

        var html       = '<div id="valueLabels' + series.seriesIndex + '" class="valueLabels">';
        var last_val   = null;
        var last_x     = -1000;
        var last_y     = -1000;
        var categories = series.xaxis.options.mode == 'categories';

        for (var i = 0; i < series.data.length; ++i) {

          if (series.data[i] === null || (showLastValue && i != series.data.length-1))  continue;

          var x = series.data[i][0], y = series.data[i][1];

          if (categories) {
            x = series.xaxis.categories[x];
          }

          if (x < series.xaxis.min || x > series.xaxis.max || y < series.yaxis.min || y > series.yaxis.max)  continue;

          var val = ( plotAxis === 'x' ) ? x : y;

          if ( val === 0 && hideZero ) continue;

          if (series.valueLabelFunc) {
            val = series.valueLabelFunc({ series: series, seriesIndex: ii, index: i });
          }

          val = "" + val;
          val = labelFormatter(val);

          if (val != last_val || i == series.data.length - 1 || plot.getOptions().series.stack) {
            var xx = series.xaxis.p2c(x) + plot.getPlotOffset().left;
            if(plot.getOptions().series.stack) {
              y+= prevY[i];
              prevY[i]= y
            }
            var yy = series.yaxis.p2c(y) - 12 + plot.getPlotOffset().top;
            if(plot.getOptions().series.stack) {
              if(ii > 0) {
                yy-= (prevYY[i] - yy < 12)? 12: 0;
              }
              prevYY[i]= yy;
            }

            if ( Math.abs(yy - last_y) > 20 || last_x < xx) {
              last_val = val;
              last_x = xx + val.length * 8;
              last_y = yy;
              if (!showAsHtml) {
                // Little 5 px padding here helps the number to get
                // closer to points
                x_pos = xx;
                y_pos = yy + 6;

                // If the value is on the top of the canvas, we need
                // to push it down a little
                if (yy <= 0) y_pos = 18;

                // The same happens with the x axis
                if (xx >= plot.width()) {
                  x_pos = plot.width();
                }

                if (font) {
                  ctx.font = font;
                }

                ctx.fillStyle     = fontcolor;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur    = 1.5;
                ctx.shadowColor   = fontcolor;
                ctx.textAlign     = align;

                ctx.fillText(val, x_pos, y_pos);
              }
              else {
                var head = '<div style="left:' + xx + 'px;top:' + yy + 'px;" class="valueLabel';
                var tail = '">' + val + '</div>';
                html += head + "Light" + tail + head + tail;
              }
            }
          }
        }
        if (showAsHtml) {
          html += "</div>";
          plot.getPlaceholder().append(html);
        }
      });
      if(showAsHtml && align == 'center') {
        var tmpdivs= $(".valueLabel,.valueLabelLight");
        $.each(tmpdivs, function(i, o) {
          var left= $(o).position().left;
          $(o).css('left', left - $(o).width() / 2);
        })
      }
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'valueLabels',
    version: '1.2'
  });
})(jQuery);

