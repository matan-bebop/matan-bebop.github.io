function SpinAnimator(s, sv, W) {

this.Wx = this.Wy = this.Wz = 0

if(typeof W === "undefined")
	W = 0.5e-3

var prev_t = null

function animation_step(t) // [t] = ms
{
	var dt

	if (!prev_t) prev_t = t
	else if (this.Wx != 0 || this.Wy != 0 || this.Wz != 0){
		dt = t - prev_t; prev_t = t

		// Don't move if we were idling for too much, e.g. the window was 
		// inactive for some time
		if(W*dt < 0.1) { 
			s.advance_paulis(dt, this.Wx, this.Wy, this.Wz)
			sv.move_all()
		}
	}

	window.requestAnimationFrame(animation_step.bind(this))
}

window.requestAnimationFrame(animation_step.bind(this))

// Applies a sequence of pulses.
// An argument is an array of objects [{axis:[x,y,z], phi:angle}, ...].
// Here x, y, z give the rotation axis direction; phi is the rotation angle
this.pulse_seq = function(vs)
{	
	function normalize(v)
	{	
		len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
		v[0] /= len; v[1] /= len; v[2] /= len
	}
		
	if(!vs.length) {
		this.Wx = this.Wy = this.Wz = 0
		return
	}

	normalize(vs[0].axis)

	this.Wx = W * vs[0].axis[0] * Math.sign(vs[0].phi)
	this.Wy = W * vs[0].axis[1] * Math.sign(vs[0].phi)
	this.Wz = W * vs[0].axis[2] * Math.sign(vs[0].phi)

	function next_pulse() { this.pulse_seq(vs.slice(1)) }
	window.setTimeout(next_pulse.bind(this), Math.abs(vs[0].phi)/W)
}

}
