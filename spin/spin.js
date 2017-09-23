


  


function Spin(doc) {

this.Sx = 0; this.Sy = 0; this.Sz = -1

this.advance_paulis = function(dt, Wx, Wy, Wz)
{
	this.Sx += (Wy*this.Sz - Wz*this.Sy)*dt
	this.Sy += (-Wx*this.Sz + Wz*this.Sx)*dt
	this.Sz += (Wx*this.Sy - Wy*this.Sx)*dt
}

} // end Spin


function cabinet_projector(theta)
{
	const pi = Math.PI, sin = Math.sin, cos = Math.cos

	return function project(x, y, z) {
		var	px = y - x*sin(pi*theta/180),
			py = z - x*cos(pi*theta/180) 

		return [px, py]
	}
}


function SpinView(spin, doc, projector) {

this.trace_on = false
this.s = spin

var proj = projector
if(typeof proj === 'undefined')
	proj = cabinet_projector(60)

var bloch_vec = doc.getElementById("bloch-vector"),
	projx = doc.getElementById("projx"),
	projy = doc.getElementById("projy"),
	helpx = doc.getElementById("helpx"),
	helpy = doc.getElementById("helpy"),
	helpxy = doc.getElementById("helpxy"),
	qu_head = doc.getElementById("qu-triangle"),
	overxy = doc.getElementById("overxy"),
	overz = doc.getElementById("overz"),
	overhelpxy = doc.getElementById("overhelpxy"),
	trace = doc.getElementById("trace")

console.log(doc, bloch_vec)

function move_bloch_vector()
{
	var xy = proj(this.s.Sx, this.s.Sy, this.s.Sz)
	var x = xy[0], y = xy[1]

	var scr_bx = 0.9*x*100 + 160.0,
		scr_by = 0.9*y*-100 + 160.0; // vector shaft tip
	bloch_vec.setAttribute("x2", scr_bx)
	bloch_vec.setAttribute("y2", scr_by)
	scr_bx = x*100 + 160.0; scr_by = y*-100 + 160.0; // shaft + arrowhead
	// set the arrowhead length
	qu_head.setAttribute("markerWidth",
		0.1*Math.sqrt(10000*x*x + 10000*y*y))

	return {x:scr_bx, y:scr_by}
}

function correct_depth_order()
{
	// Behind or over the XY plane elements?
	overxy.setAttribute("opacity", 1*(this.s.Sz < 0))
	// ... the 0z axis?
	overz.setAttribute("opacity", 1*(this.s.Sx < 0))
	// ... the xy plane projection helper
	overhelpxy.setAttribute("opacity", 1*(this.s.Sx > 0))
}

function move_projections(scr_b)
{
	var scr_pyx = this.s.Sy*100 + 160.0, scr_pzy = this.s.Sz*-100 + 160.0;
	projy.setAttribute("x2", scr_pyx)
	xy = proj(this.s.Sx, 0, 0)
	x = xy[0], y = xy[1]
	var scr_pxx = x*100 + 160.0, scr_pxy = y*-100 + 160.0
	projx.setAttribute("x2", scr_pxx)
	projx.setAttribute("y2", scr_pxy)

	xy = proj(this.s.Sx, this.s.Sy, 0)
	x = xy[0], y = xy[1]
	var scr_pxy_x = x*100 + 160.0, scr_pxy_y = y*-100 + 160.0

	helpx.setAttribute("x1", scr_pxy_x)
	helpx.setAttribute("y1", scr_pxy_y)
	helpy.setAttribute("x1", scr_pxy_x)
	helpy.setAttribute("y1", scr_pxy_y)
	helpx.setAttribute("y2", scr_pxy)
	helpx.setAttribute("x2", scr_pxx)
	helpy.setAttribute("x2", scr_pyx)
	helpxy.setAttribute("x1", scr_pxy_x)
	helpxy.setAttribute("y1", scr_pxy_y)
	helpxy.setAttribute("x2", scr_b.x)
	helpxy.setAttribute("y2", scr_b.y)
}

var trace_add_node = (function() {
	prev_scr_b = {x:Infinity, y:Infinity}
	trace = this.trace

	return function(scr_b) {
		var d = trace.getAttribute("d"),
			// Start a new trace if we are too far away from the old one
			new_trace = Math.abs(prev_scr_b.x - scr_b.x) > 5.00 &&
						Math.abs(prev_scr_b.y - scr_b.y) > 5.00
		
		// If we are to start a new trace, merely move to its start;
		// continue the old trace otherwise
		trace.setAttribute("d", d + (new_trace? " M ":" L ")
							+ scr_b.x + " " + scr_b.y)

		prev_scr_b = scr_b
	}
})()

this.move_all = function()
{
	var scr_b = move_bloch_vector()
	move_projections(scr_b)
	correct_depth_order()
	if(this.trace_on) 
		trace_add_node(scr_b)
}

} // end SpinView

