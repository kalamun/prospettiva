/* )c( 2019 kalamun.net */

var beat = 0;

var ui = {};

/*
* INIT
*/

window.addEventListener( 'DOMContentLoaded', on_window_load );

function on_window_load( e )
{
	// load playlist
	ui.playlist = document.getElementById( 'playlist' );
	
	let track_id = 0;
	console.log(window.opener, window.opener.playlist);
	for(const [track, entry] of Object.entries(window.opener.playlist))
	{
		let track_elm = document.createElement( 'li' );
		track_elm.innerHTML = track;
		
		const track_ul = document.createElement( 'ul' );
		for(const file of entry.visuals) {
			const current_id = track_id++;
			let visual_elm = document.createElement( 'li' );
			visual_elm.innerHTML = file;
			visual_elm.dataset.id = current_id;
			visual_elm.addEventListener( 'click', (e) => window.opener.play_this(current_id) );
			track_ul.appendChild(visual_elm);
		}
		track_elm.appendChild( track_ul );
		
		ui.playlist.appendChild( track_elm );
	}
	
	mark_current_video();

	// create sequencers
	pad_labels = {
		fx: 		"OVERLAY ",
		strobe: "STROBE  ",
		shake: 	"SHAKE   ",
		zoom:		"ZOOM    ",
	};

	for( var i=1; i<=8; i++ )
	{
		var pad = document.createElement( 'DIV' );
		pad.className = 'pad pad' + i;
		pad.dataset.active = false;
		pad.dataset.number = i;
		
		var pad_fx = pad.cloneNode();
		pad_fx.addEventListener( 'click', on_fx_click );
		pad_fx.innerHTML = pad_labels.fx[i-1];
		
		var pad_strobe = pad.cloneNode();
		pad_strobe.addEventListener( 'click', on_strobe_click );
		pad_strobe.innerHTML = pad_labels.strobe[i-1];
		
		var pad_shake = pad.cloneNode();
		pad_shake.addEventListener( 'click', on_shake_click );
		pad_shake.innerHTML = pad_labels.shake[i-1];
		
		var pad_zoom = pad.cloneNode();
		pad_zoom.addEventListener( 'click', on_zoom_click );
		pad_zoom.innerHTML = pad_labels.zoom[i-1];
		
		document.querySelector( '.fx-seq' ).appendChild( pad_fx );
		document.querySelector( '.strobe-seq' ).appendChild( pad_strobe );
		document.querySelector( '.shake-seq' ).appendChild( pad_shake );
		document.querySelector( '.zoom-seq' ).appendChild( pad_zoom );
	}
}


/*
* SHORTCUTS
*/

window.addEventListener( 'keydown', on_keydown );

function on_keydown( e )
{
	window.opener.on_keydown( e );
}

/*
* BEAT
*/

function hit_the_beat( b )
{
	clear_sequencer();
	
	sequencer_cell = document.getElementsByClassName( 'sequencer_' + b )[0];
	sequencer_cell.classList.add( 'selected' );

	for( var i=0, c=document.querySelectorAll( '.pad' + b ); c[i]; i++ )
	{
		c[i].classList.add( 'selected' );
	}
}

/*
* SEQUENCER
*/

function clear_sequencer()
{
	var sequencer_cells = document.querySelectorAll( '.sequencer > div' );
	for( var i=0; sequencer_cells[i]; i++ )
	{
		sequencer_cells[i].classList.remove( 'selected' );
	}
	for( var i=0, c=document.getElementsByClassName('pad'); c[i]; i++ )
	{
		c[i].classList.remove( 'selected' );
	}
}

function on_fx_click( e )
{
	this.classList.toggle( 'active' );
	var active = this.classList.contains( 'active' ) ? true : false;
	this.dataset.active = active;
	window.opener.beat_fx[ this.dataset.number ] = active;
}

function on_strobe_click( e )
{
	this.classList.toggle( 'active' );
	var active = this.classList.contains( 'active' ) ? true : false;
	this.dataset.active = active;
	window.opener.beat_strobe[ this.dataset.number ] = active;
}

function on_shake_click( e )
{
	this.classList.toggle( 'active' );
	var active = this.classList.contains( 'active' ) ? true : false;
	this.dataset.active = active;
	window.opener.beat_shake[ this.dataset.number ] = active;
}

function on_zoom_click( e )
{
	this.classList.toggle( 'active' );
	var active = this.classList.contains( 'active' ) ? true : false;
	this.dataset.active = active;
	window.opener.beat_zoom[ this.dataset.number ] = active;
}

function on_reset_click( e )
{
	this.classList.toggle( 'active' );
	var active = this.classList.contains( 'active' ) ? true : false;
	this.dataset.active = active;
	window.opener.beat_reset[ this.dataset.number ] = active;
}



/*
* PLAYLIST
*/
function mark_current_video()
{
	document.querySelectorAll("#playlist li ul li").forEach((li, i) => {
		li.classList.remove('selected');
		if( i == window.opener.current_video )
			li.classList.add('selected');
	});
}
