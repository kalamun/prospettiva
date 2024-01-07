/* )c( 2019 kalamun.net */

var beat = 0;

var ui = {};

/*
* INIT
*/

window.addEventListener( 'DOMContentLoaded', on_window_load );

function on_window_load( e )
{
	// load filters
	ui.filters = document.getElementById( 'filters' );
	
	for( var i = 0; window.opener.filters[i]; i++ )
	{
		var elm = document.createElement( 'li' );
		elm.innerHTML = window.opener.filters[i];
		elm.addEventListener( 'click', set_filter );
		
		ui.filters.appendChild( elm );
	}

	// load playlist
	ui.playlist = document.getElementById( 'playlist' );
	
	for( var i = 0; window.opener.playlist[i]; i++ )
	{
		var elm = document.createElement( 'li' );
		elm.innerHTML = window.opener.playlist[i];
		elm.dataset.id = i;
		elm.addEventListener( 'click', (e) => window.opener.play_this(e.currentTarget.dataset.id) );
		
		ui.playlist.appendChild( elm );
	}
	
	mark_current_video();

	// create sequencers
	for( var i=1; i<=8; i++ )
	{
		var pad = document.createElement( 'DIV' );
		pad.className = 'pad pad' + i;
		pad.dataset.active = false;
		pad.dataset.number = i;
		
		var pad_fx = pad.cloneNode();
		pad_fx.addEventListener( 'click', on_fx_click );

		var pad_strobe = pad.cloneNode();
		pad_strobe.addEventListener( 'click', on_strobe_click );

		var pad_shake = pad.cloneNode();
		pad_shake.addEventListener( 'click', on_shake_click );
		
		var pad_zoom = pad.cloneNode();
		pad_zoom.addEventListener( 'click', on_zoom_click );
		
		document.querySelector( '.fx-seq' ).appendChild( pad_fx );
		document.querySelector( '.strobe-seq' ).appendChild( pad_strobe );
		document.querySelector( '.shake-seq' ).appendChild( pad_shake );
		document.querySelector( '.zoom-seq' ).appendChild( pad_zoom );
	}
	
	document.querySelector( '.fx-seq' ).appendChild( document.createTextNode( 'Filter' ) );
	document.querySelector( '.strobe-seq' ).appendChild( document.createTextNode( 'Strobe' ) );
	document.querySelector( '.shake-seq' ).appendChild( document.createTextNode( 'Shake' ) );
	document.querySelector( '.zoom-seq' ).appendChild( document.createTextNode( 'Zoom' ) );
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
* FILTERS
*/

function set_filter( e )
{
	for( var i=0, c=this.parentNode.childNodes; c[i]; i++ )
	{
		c[i].className = '';
	}
	
	this.className = 'selected';
	window.opener.set_filter( this.innerHTML );
}


/*
* PLAYLIST
*/
function mark_current_video()
{
	for( var i=0, c=ui.playlist.getElementsByTagName('li'); c[i]; i++ )
	{
		c[i].className = '';
		if( i == window.opener.current_video )
			c[i].className = 'selected';
	}
}
